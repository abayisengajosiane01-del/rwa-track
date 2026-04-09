"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { HRNav } from "@/components/hr/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2, AlertCircle, ArrowLeft, MapPin, Phone,
  Mail, Briefcase, Calendar, Clock,
} from "lucide-react";

interface LocationLog {
  id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  recordedAt: string;
}

interface Worker {
  id: string;
  jobTitle: string;
  homeAddress: string | null;
  workAddress: string | null;
  homeLat: number | null;
  homeLng: number | null;
  workLat: number | null;
  workLng: number | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  };
  hr: { firstName: string; lastName: string; email: string } | null;
  locationLogs: LocationLog[];
}

export default function WorkerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/workers/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setWorker)
      .catch(() => setError("Failed to load worker details."))
      .finally(() => setLoading(false));
  }, [id]);

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
      <HRNav user={null} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6 -ml-2 text-muted-foreground"
          onClick={() => router.push("/hr/workers")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workers
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {worker && (
          <div className="space-y-6">
            {/* Profile card */}
            <Card className="border-blue-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {worker.user.firstName} {worker.user.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {worker.jobTitle}
                    </CardDescription>
                  </div>
                  <Badge className={statusColor(worker.user.status)}>
                    {worker.user.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    {worker.user.email}
                  </div>
                  {worker.user.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {worker.user.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    Registered {new Date(worker.createdAt).toLocaleDateString()}
                  </div>
                  {worker.hr && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4 flex-shrink-0" />
                      HR: {worker.hr.firstName} {worker.hr.lastName}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Locations */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Work Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {worker.workAddress ? (
                    <p className="text-sm text-foreground">{worker.workAddress}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not set</p>
                  )}
                  {worker.workLat && worker.workLng && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {worker.workLat.toFixed(5)}, {worker.workLng.toFixed(5)}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Home Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {worker.homeAddress ? (
                    <p className="text-sm text-foreground">{worker.homeAddress}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not set</p>
                  )}
                  {worker.homeLat && worker.homeLng && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {worker.homeLat.toFixed(5)}, {worker.homeLng.toFixed(5)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Location history */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Location History
                </CardTitle>
                <CardDescription>
                  Last {worker.locationLogs.length} recorded location
                  {worker.locationLogs.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {worker.locationLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      No location data recorded yet. The worker needs to log in to the mobile app.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {worker.locationLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between border border-blue-100 rounded-lg px-4 py-2.5 hover:bg-blue-50/50 transition"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="text-sm font-mono text-foreground">
                            {log.lat.toFixed(5)}, {log.lng.toFixed(5)}
                          </span>
                          {log.accuracy && (
                            <span className="text-xs text-muted-foreground">
                              ±{Math.round(log.accuracy)}m
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {new Date(log.recordedAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
