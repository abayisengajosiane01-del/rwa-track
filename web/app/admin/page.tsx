"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/nav";
import { Loader2, AlertCircle, Users, MapPin, BarChart3, UserCheck } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalHRs: number;
  totalWorkers: number;
  activeWorkers: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "HR" | "WORKER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  user: { email: string };
  createdAt: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalHRs: 0, totalWorkers: 0, activeWorkers: 0 });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, usersRes, hrsRes, workersRes, auditRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/admin/users"),
          fetch("/api/hr"),
          fetch("/api/workers"),
          fetch("/api/audit-logs"),
        ]);

        if (userRes.ok) setUser(await userRes.json());

        const users: User[] = usersRes.ok ? await usersRes.json() : [];
        const hrs: User[] = hrsRes.ok ? await hrsRes.json() : [];
        const workers = workersRes.ok ? await workersRes.json() : [];
        const auditData = auditRes.ok ? await auditRes.json() : {};

        setStats({
          totalUsers: users.length,
          totalHRs: hrs.length,
          totalWorkers: workers.length,
          activeWorkers: workers.filter((w: any) => w.user?.status === "ACTIVE").length,
        });
        setAuditLogs(auditData.logs || []);
      } catch {
        setError("Failed to load dashboard data");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AdminNav user={user} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage HRs, workers, and monitor system-wide activity.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-foreground" },
            { label: "HR Managers", value: stats.totalHRs, icon: UserCheck, color: "text-blue-600" },
            { label: "Total Workers", value: stats.totalWorkers, icon: Users, color: "text-foreground" },
            { label: "Active Workers", value: stats.activeWorkers, icon: MapPin, color: "text-green-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-blue-200 hover:shadow-lg transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="border-blue-200 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <a href="/admin/users"><Users className="w-4 h-4 mr-2" />Manage Users</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin/hr"><UserCheck className="w-4 h-4 mr-2" />Manage HRs</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin/audit-logs">Audit Logs</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin/settings">System Settings</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest audit log entries</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No activity recorded</p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 8).map((log) => (
                    <div key={log.id} className="border border-blue-100 rounded-lg p-3 hover:bg-blue-50/50 transition">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-sm">{log.action}</h4>
                          <p className="text-xs text-muted-foreground">{log.resource}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">By: {log.user?.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {["Database", "API", "Location Service"].map((s) => (
                <div key={s}>
                  <h4 className="font-semibold text-sm mb-2">{s}</h4>
                  <Badge className="bg-green-100 text-green-800">✓ Operational</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
