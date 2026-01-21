import { db } from "./index";
import { sql } from "drizzle-orm";

// Create tables manually since we can't use Prisma migrations
export const createTables = async () => {
  console.log("Creating tables...");

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'LOCAL_TEAM',
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      fund TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      candidate_dates TEXT,
      selected_week INTEGER,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      budget_planned REAL DEFAULT 0,
      notes TEXT,
      owner_id TEXT REFERENCES users(id),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      locked_at INTEGER,
      closed_at INTEGER
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS participants (
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
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS workstreams (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      owner_id TEXT REFERENCES users(id),
      notes TEXT,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS tasks (
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
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS task_dependencies (
      id TEXT PRIMARY KEY,
      dependent_task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      blocking_task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      UNIQUE(dependent_task_id, blocking_task_id)
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      contact_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      quote_received INTEGER DEFAULT 0,
      contract_signed INTEGER DEFAULT 0,
      cancellation_terms TEXT,
      status TEXT DEFAULT 'PROSPECTING',
      notes TEXT,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS company_visits (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      portfolio_status TEXT NOT NULL,
      address TEXT NOT NULL,
      max_capacity INTEGER,
      space_confirmed INTEGER DEFAULT 0,
      epi_required TEXT,
      presentation_language TEXT DEFAULT 'EN',
      deck_received INTEGER DEFAULT 0,
      run_of_show_validated INTEGER DEFAULT 0,
      site_contact_name TEXT,
      site_contact_phone TEXT,
      identified_risks TEXT,
      visit_date INTEGER,
      visit_time TEXT,
      notes TEXT,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS budget_lines (
      id TEXT PRIMARY KEY,
      workstream_type TEXT NOT NULL,
      description TEXT NOT NULL,
      amount_planned REAL NOT NULL,
      amount_committed REAL DEFAULT 0,
      amount_paid REAL DEFAULT 0,
      currency TEXT DEFAULT 'EUR',
      cost_center TEXT,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      vendor_id TEXT REFERENCES vendors(id)
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      occurred_at INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      impact TEXT,
      resolution TEXT,
      future_action TEXT,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      generated_by TEXT,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      changes TEXT,
      user_id TEXT REFERENCES users(id),
      event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  console.log("Tables created successfully!");
};

// Run if executed directly
createTables().catch(console.error);
