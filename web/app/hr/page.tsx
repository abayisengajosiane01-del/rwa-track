"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HRNav } from "@/components/hr/nav";
import { Loader2, AlertCircle, Users, MapPin, Plus, UserCheck, X } from "lucide-react";

interface Worker {
  id: string;
  jobTitle: string;
  user: { firstName: string; lastName: string; email: string; status: string };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

const emptyForm = {
  firstName: "", lastName: "", email: "", phone: "",
  password: "", jobTitle: "", homeAddress: "", workAddress: "",
};

export default function HRDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerAddresses, setWorkerAddresses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchData = async () => {
    try {
      const [userRes, workersRes, logsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/workers"),
        fetch("/api/location-logs"),
      ]);
      if (userRes.ok) setUser(await userRes.json());
      if (workersRes.ok) setWorkers(await workersRes.json());
      if (logsRes.ok) {
        const logs: any[] = await logsRes.json();
        const latest: Record<string, { lat: number; lng: number }> = {};
        for (const log of logs) {
          if (!latest[log.worker.user.email]) latest[log.worker.user.email] = { lat: log.lat, lng: log.lng };
        }
        const addresses: Record<string, string> = {};
        for (const [email, coords] of Object.entries(latest)) {
          addresses[email] = await reverseGeocode(coords.lat, coords.lng);
          await new Promise((r) => setTimeout(r, 1100));
        }
        setWorkerAddresses(addresses);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to register worker"); return; }
      setFormSuccess(`Worker ${data.user.firstName} ${data.user.lastName} registered successfully!`);
      setForm(emptyForm);
      // Refresh workers list
      const workersRes = await fetch("/api/workers");
      if (workersRes.ok) setWorkers(await workersRes.json());
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const activeWorkers = workers.filter((w) => w.user.status === "ACTIVE");
  const withLocation = workers.filter((w) => workerAddresses[w.user.email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <HRNav user={user} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">HR Dashboard</h1>
          <p className="text-muted-foreground">Manage your workers and monitor their location data.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Workers", value: workers.length, icon: Users, color: "text-foreground" },
            { label: "Active Workers", value: activeWorkers.length, icon: UserCheck, color: "text-green-600" },
            { label: "With Location", value: withLocation.length, icon: MapPin, color: "text-blue-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="w-4 h-4" /> {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Workers</CardTitle>
                  <CardDescription>Workers assigned to you</CardDescription>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href="/hr/workers">View All →</a>
                </Button>
              </CardHeader>
              <CardContent>
                {workers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">No workers assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workers.slice(0, 6).map((worker) => (
                      <div key={worker.id} className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50/50 transition">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {worker.user.firstName} {worker.user.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">{worker.jobTitle}</p>
                            {workerAddresses[worker.user.email] && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-primary" />
                                <span className="truncate max-w-xs">{workerAddresses[worker.user.email]}</span>
                              </p>
                            )}
                          </div>
                          <Badge className={worker.user.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {worker.user.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => { setDrawerOpen(true); setFormError(""); setFormSuccess(""); }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Register Worker
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/hr/workers">All Workers</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/hr/location-history">Location History</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Side Drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100">
              <div>
                <h2 className="text-lg font-bold text-foreground">Register Worker</h2>
                <p className="text-xs text-muted-foreground">Fill in the details to create a worker account</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              {formSuccess && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{formSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+250700000000" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input id="jobTitle" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="e.g. Field Officer" required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="homeAddress">Home Address</Label>
                <Input id="homeAddress" value={form.homeAddress} onChange={(e) => setForm({ ...form, homeAddress: e.target.value })} placeholder="e.g. KG 123 St, Kigali" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="workAddress">Work Address</Label>
                <Input id="workAddress" value={form.workAddress} onChange={(e) => setForm({ ...form, workAddress: e.target.value })} placeholder="e.g. KN 5 Rd, Kigali" />
              </div>

              <div className="pt-2 pb-6">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering…</> : "Register Worker"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
