"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { HRNav } from "@/components/hr/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus, Search, MapPin, Phone, Mail, Briefcase } from "lucide-react";

interface Worker {
  id: string;
  jobTitle: string;
  homeAddress: string | null;
  workAddress: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  };
  hr: { firstName: string; lastName: string; email: string } | null;
}

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function WorkersPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, workersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/workers"),
        ]);
        if (userRes.ok) setAuthUser(await userRes.json());
        if (!workersRes.ok) throw new Error("Failed to fetch workers");
        setWorkers(await workersRes.json());
      } catch {
        setError("Failed to load workers. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = workers.filter((w) => {
    const q = search.toLowerCase();
    return (
      w.user.firstName.toLowerCase().includes(q) ||
      w.user.lastName.toLowerCase().includes(q) ||
      w.user.email.toLowerCase().includes(q) ||
      w.jobTitle.toLowerCase().includes(q) ||
      (w.workAddress?.toLowerCase().includes(q) ?? false)
    );
  });

  const statusColor = (s: string) => {
    if (s === "ACTIVE") return "bg-green-100 text-green-800";
    if (s === "SUSPENDED") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <HRNav user={authUser} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Workers</h1>
            <p className="text-muted-foreground">
              {workers.length} worker{workers.length !== 1 ? "s" : ""} assigned to you
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <a href="/hr/workers/new">
              <Plus className="w-4 h-4 mr-2" />
              Register Worker
            </a>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, job title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total", value: workers.length, color: "text-foreground" },
            { label: "Active", value: workers.filter((w) => w.user.status === "ACTIVE").length, color: "text-green-600" },
            { label: "With Location", value: workers.filter((w) => w.workAddress).length, color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="border-blue-200">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workers list */}
        {filtered.length === 0 ? (
          <Card className="border-blue-200">
            <CardContent className="py-16 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium mb-2">
                {search ? "No workers match your search" : "No workers registered yet"}
              </p>
              {!search && (
                <Button asChild className="mt-2 bg-primary hover:bg-primary/90">
                  <a href="/hr/workers/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Register First Worker
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((worker) => (
              <Card key={worker.id} className="border-blue-200 hover:shadow-md transition">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {worker.user.firstName} {worker.user.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3" />
                        {worker.jobTitle}
                      </CardDescription>
                    </div>
                    <Badge className={statusColor(worker.user.status)}>
                      {worker.user.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{worker.user.email}</span>
                  </div>
                  {worker.user.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{worker.user.phone}</span>
                    </div>
                  )}
                  {worker.workAddress && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                      <span className="truncate">{worker.workAddress}</span>
                    </div>
                  )}
                  {worker.homeAddress && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
                      <span className="truncate">{worker.homeAddress}</span>
                    </div>
                  )}
                  <div className="pt-2 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <a href={`/hr/workers/${worker.id}`}>View Details</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
