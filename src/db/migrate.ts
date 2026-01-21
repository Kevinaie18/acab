import { createClient } from "@libsql/client";

// Script pour initialiser la base de données Turso en production
// Usage: DATABASE_URL=libsql://xxx DATABASE_AUTH_TOKEN=xxx npx tsx src/db/migrate.ts

async function migrate() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url) {
    console.error("❌ DATABASE_URL is required");
    process.exit(1);
  }

  console.log("🔄 Connecting to database...");
  console.log(`   URL: ${url.substring(0, 30)}...`);

  const client = createClient({ url, authToken });

  const tables = [
    // Users
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'LOCAL_TEAM',
      avatar_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Events
    `CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      fund TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      selected_week INTEGER,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      budget_planned INTEGER DEFAULT 0,
      notes TEXT,
      owner_id TEXT REFERENCES users(id),
      locked_at INTEGER,
      closed_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Participants
    `CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      organization TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL,
      language TEXT DEFAULT 'EN',
      needs_visa INTEGER DEFAULT 0,
      visa_status TEXT,
      flight_arrival TEXT,
      flight_departure TEXT,
      dietary_restrictions TEXT,
      special_needs TEXT,
      hotel_assigned TEXT,
      rsvp_status TEXT DEFAULT 'PENDING',
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Workstreams
    `CREATE TABLE IF NOT EXISTS workstreams (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Tasks
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      deadline INTEGER,
      status TEXT NOT NULL DEFAULT 'NOT_STARTED',
      criticality TEXT DEFAULT 'MEDIUM',
      proof_url TEXT,
      notes TEXT,
      workstream_id TEXT NOT NULL REFERENCES workstreams(id) ON DELETE CASCADE,
      owner_id TEXT REFERENCES users(id),
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Task Dependencies
    `CREATE TABLE IF NOT EXISTS task_dependencies (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      depends_on_task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Vendors
    `CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      service_type TEXT NOT NULL,
      contact_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      status TEXT DEFAULT 'PROSPECT',
      contract_url TEXT,
      amount_quoted INTEGER,
      amount_contracted INTEGER,
      notes TEXT,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Company Visits
    `CREATE TABLE IF NOT EXISTS company_visits (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      sector TEXT,
      contact_name TEXT,
      contact_email TEXT,
      visit_date INTEGER,
      visit_time TEXT,
      location TEXT,
      deck_received INTEGER DEFAULT 0,
      deck_url TEXT,
      logistics_confirmed INTEGER DEFAULT 0,
      notes TEXT,
      readiness_score INTEGER DEFAULT 0,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Budget Lines
    `CREATE TABLE IF NOT EXISTS budget_lines (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      vendor_id TEXT REFERENCES vendors(id),
      amount_planned INTEGER DEFAULT 0,
      amount_committed INTEGER DEFAULT 0,
      amount_paid INTEGER DEFAULT 0,
      currency TEXT DEFAULT 'EUR',
      invoice_url TEXT,
      notes TEXT,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Incidents
    `CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      severity TEXT DEFAULT 'LOW',
      status TEXT DEFAULT 'OPEN',
      resolution TEXT,
      reported_by TEXT REFERENCES users(id),
      resolved_by TEXT REFERENCES users(id),
      resolved_at INTEGER,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Documents
    `CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      uploaded_by TEXT REFERENCES users(id),
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,

    // Audit Logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      user_id TEXT REFERENCES users(id),
      event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
  ];

  console.log("🔄 Creating tables...");

  for (const sql of tables) {
    const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
    try {
      await client.execute(sql);
      console.log(`   ✅ ${tableName}`);
    } catch (error) {
      console.error(`   ❌ ${tableName}:`, error);
      throw error;
    }
  }

  // Create indexes
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id)",
    "CREATE INDEX IF NOT EXISTS idx_workstreams_event ON workstreams(event_id)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_workstream ON tasks(workstream_id)",
    "CREATE INDEX IF NOT EXISTS idx_vendors_event ON vendors(event_id)",
    "CREATE INDEX IF NOT EXISTS idx_visits_event ON company_visits(event_id)",
    "CREATE INDEX IF NOT EXISTS idx_budget_event ON budget_lines(event_id)",
    "CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_logs(event_id)",
  ];

  console.log("🔄 Creating indexes...");
  for (const sql of indexes) {
    await client.execute(sql);
  }
  console.log("   ✅ All indexes created");

  console.log("\n✅ Migration complete!");
  
  // Verify
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log("\n📋 Tables created:");
  result.rows.forEach((row) => console.log(`   - ${row.name}`));

  client.close();
}

migrate().catch(console.error);
