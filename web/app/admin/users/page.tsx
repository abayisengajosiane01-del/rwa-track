"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/nav";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Users, ArrowLeft, UserCheck } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "ADMIN" | "HR" | "WORKER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.ok ? r.json() : Promise.reject("Failed"))
      .then((data: User[]) =>
        // Show only ADMIN and HR — workers are managed by HR
        setUsers(data.filter((u) => ["ADMIN", "HR"].includes(u.role)))
      )
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const updateUser = async (userId: string, patch: { role?: string; status?: string }) => {
    setUpdating(userId);
    const current = users.find((u) => u.id === userId)!;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: current.role, status: current.status, ...patch }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      }
    } finally {
      setUpdating(null);
    }
  };

  const roleColor = (r: string) =>
    r === "ADMIN" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";

  const statusColor = (s: string) =>
    s === "ACTIVE" ? "bg-green-100 text-green-800" :
    s === "SUSPENDED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <AdminNav user={null} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AdminNav user={null} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage Admin and HR accounts. Workers are managed by their assigned HR.
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <a href="/admin/hr">
              <UserCheck className="w-4 h-4 mr-2" />
              Manage HRs
            </a>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Admin & HR Users ({users.length})
            </CardTitle>
            <CardDescription>
              Update roles and account status. To add a new HR, use the Manage HRs page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No admin or HR users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-200">
                      {["Name", "Email", "Phone", "Role", "Status", "Joined"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-blue-100 hover:bg-blue-50/50 transition">
                        <td className="py-3 px-4 text-sm font-semibold text-foreground">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{user.phone || "—"}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge className={roleColor(user.role)}>{user.role}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Select
                            defaultValue={user.status}
                            onValueChange={(v) => updateUser(user.id, { status: v })}
                            disabled={updating === user.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                              <SelectItem value="SUSPENDED">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
