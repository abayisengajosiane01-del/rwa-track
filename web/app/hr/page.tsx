"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { HRNav } from "@/components/hr/nav";
import { Loader2, AlertCircle, Users, MapPin, Plus, UserCheck } from "lucide-react";

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

export default function HRDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerAddresses, setWorkerAddresses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
          // Get latest log per worker
          const latest: Record<string, { lat: number; lng: number }> = {};
          for (const log of logs) {
            if (!latest[log.worker.user.email]) latest[log.worker.user.email] = { lat: log.lat, lng: log.lng };
          }
          // Reverse geocode each
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
    fetchData();
  }, []);

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
                  <Icon className="w-4 h-4" />
                  {label}
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
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <a href="/hr/workers/new"><Plus className="w-4 h-4 mr-2" />Register Worker</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/hr/workers">All Workers</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/hr/location-history">Location History</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/hr/reports">Reports</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
