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
import { HRNav } from "@/components/hr/nav";
import {
  Loader2,
  AlertCircle,
  Users,
  FileText,
  AlertTriangle,
  Plus,
} from "lucide-react";

interface Employee {
  id: string;
  employeeId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  position: string;
  department: string;
}

interface ResidenceRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_REVIEW";
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  newAddress: string;
  createdAt: string;
}

interface FraudAlert {
  id: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function HRDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requests, setRequests] = useState<ResidenceRequest[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          setUser(await userRes.json());
        }

        const empRes = await fetch("/api/employees");
        if (empRes.ok) {
          setEmployees(await empRes.json());
        }

        const reqRes = await fetch("/api/residence-requests");
        if (reqRes.ok) {
          setRequests(await reqRes.json());
        }

        const fraudRes = await fetch("/api/fraud-alerts");
        if (fraudRes.ok) {
          setFraudAlerts(await fraudRes.json());
        }
      } catch (err) {
        setError("Failed to load data");
        console.error("[v0] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_REVIEW":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <HRNav user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            HR Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage employees, residence requests, and monitor alerts.
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
          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {employees.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active workforce
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingRequests.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {requests.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {fraudAlerts.filter((a) => a.status === "OPEN").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Requests */}
          <div className="lg:col-span-2">
            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pending Residence Requests</CardTitle>
                  <CardDescription>
                    Requests awaiting your review
                  </CardDescription>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href="/hr/requests">View All →</a>
                </Button>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 5).map((request) => (
                      <div
                        key={request.id}
                        className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50/50 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {request.employee.user.firstName}{" "}
                              {request.employee.user.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {request.newAddress}
                            </p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Submitted:{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="space-y-4">
            {/* Actions */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <a href="/hr/employees/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/hr/employees">View All Employees</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/hr/fraud-alerts">View Alerts</a>
                </Button>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fraudAlerts.filter((a) => a.status === "OPEN").length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No active alerts
                  </p>
                ) : (
                  <div className="space-y-2">
                    {fraudAlerts
                      .filter((a) => a.status === "OPEN")
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="p-2 bg-red-50 rounded border border-red-200"
                        >
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <p className="text-xs mt-1 text-foreground">
                            {alert.description.substring(0, 50)}...
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
