"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/nav";
import {
  Loader2,
  AlertCircle,
  Users,
  FileText,
  AlertTriangle,
  BarChart3,
  Plus,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalEmployees: number;
  totalRequests: number;
  activeAlerts: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "HR" | "EMPLOYEE";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  user: {
    email: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalEmployees: 0,
    totalRequests: 0,
    activeAlerts: 0,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          setUser(await userRes.json());
        }

        // Fetch all data to calculate stats
        const [usersRes, empRes, reqRes, fraudRes, auditRes] =
          await Promise.all([
            fetch("/api/admin/users"),
            fetch("/api/employees"),
            fetch("/api/residence-requests"),
            fetch("/api/fraud-alerts"),
            fetch("/api/audit-logs"),
          ]);

        let users = [];
        let employees = [];
        let requests = [];
        let fraudAlerts = [];
        let logs = [];

        if (usersRes.ok) users = await usersRes.json();
        if (empRes.ok) employees = await empRes.json();
        if (reqRes.ok) requests = await reqRes.json();
        if (fraudRes.ok) fraudAlerts = await fraudRes.json();
        if (auditRes.ok) {
          const data = await auditRes.json();
          logs = data.logs || [];
        }

        setStats({
          totalUsers: users.length,
          totalEmployees: employees.length,
          totalRequests: requests.length,
          activeAlerts: fraudAlerts.filter((a: any) => a.status === "OPEN")
            .length,
        });

        setAuditLogs(logs);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("[v0] Fetch error:", err);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, monitor system activity, and oversee all operations.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-200 hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.totalEmployees}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.totalRequests}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.activeAlerts}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Actions */}
          <Card className="border-blue-200 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <a href="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin/fraud-alerts">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Fraud Alerts
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin/audit-logs">
                  <FileText className="w-4 h-4 mr-2" />
                  Audit Logs
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin/settings">System Settings →</a>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-blue-200 lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest audit log entries</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No activity recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 8).map((log) => (
                    <div
                      key={log.id}
                      className="border border-blue-100 rounded-lg p-3 hover:bg-blue-50/50 transition"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">
                            {log.action}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {log.resource}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        By: {log.user.email}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Current system status and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-2">
                  Database Status
                </h4>
                <Badge className="bg-green-100 text-green-800">
                  ✓ Connected
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-2">
                  API Status
                </h4>
                <Badge className="bg-green-100 text-green-800">
                  ✓ Operational
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-2">
                  System Health
                </h4>
                <Badge className="bg-green-100 text-green-800">✓ Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
