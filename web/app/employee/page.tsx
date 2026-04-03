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
import { EmployeeNav } from "@/components/employee/nav";
import { Home, Plus, AlertCircle, Loader2, FileText } from "lucide-react";

interface ResidenceRequest {
  id: string;
  newAddress: string;
  moveDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_REVIEW";
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ResidenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        // Fetch residence requests
        const reqRes = await fetch("/api/residence-requests");
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          setRequests(reqData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <EmployeeNav user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Manage your residence requests and
            information.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Residence Requests
              </CardTitle>
              <CardDescription>
                Total requests: {requests.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <a href="/employee/new-request">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit New Request
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                My Profile
              </CardTitle>
              <CardDescription>
                View and update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <a href="/employee/profile">View Profile →</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Your Residence Requests</CardTitle>
            <CardDescription>
              Track the status of your submitted requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  No residence requests yet
                </p>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <a href="/employee/new-request">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Request
                  </a>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50/50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {request.newAddress}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Move Date:{" "}
                          {new Date(request.moveDate).toLocaleDateString()}
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
      </main>
    </div>
  );
}
