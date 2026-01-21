"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeed = async (force: boolean = false) => {
    setLoading(true);
    setResult(null);
    try {
      const url = force ? "/api/seed?force=true" : "/api/seed";
      const method = force ? "POST" : "GET";
      const response = await fetch(url, { method });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, message: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour au dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Administration
            </CardTitle>
            <CardDescription>
              Initialiser la base de donnees avec des donnees de demonstration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Donnees de demo incluses :</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1 evenement : IPAE 2 - Advisory Committee Dakar</li>
                <li>6 participants (LPs et membres AC)</li>
                <li>14 workstreams avec 21 taches</li>
                <li>3 vendors (hotel, AV, transport)</li>
                <li>3 visites entreprises</li>
                <li>6 lignes de budget</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => handleSeed(false)} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                Initialiser les donnees
              </Button>
              <Button onClick={() => handleSeed(true)} disabled={loading} variant="outline" className="flex-1">
                Reinitialiser
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center gap-2">
                  {result.success ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                  <span className={result.success ? "text-green-800" : "text-red-800"}>{result.message}</span>
                </div>
              </div>
            )}

            {result?.success && (
              <div className="pt-4 border-t">
                <Link href="/"><Button className="w-full">Voir le dashboard</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}