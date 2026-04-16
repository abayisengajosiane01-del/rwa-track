"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertCircle, Loader2, UserCheck, ArrowLeft,
  Plus, Mail, Phone, Users, Eye, EyeOff, Lock, X,
} from "lucide-react";
import Link from "next/link";

interface HR {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  managedWorkers: { id: string }[];
}

const emptyForm = { firstName: "", lastName: "", email: "", phone: "", password: "" };

export default function AdminHRPage() {
  const [hrs, setHrs] = useState<HR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch("/api/hr")
      .then((r) => r.ok ? r.json() : Promise.reject("Failed"))
      .then(setHrs)
      .catch(() => setError("Failed to load HR accounts"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to create HR"); return; }
      // Refresh list
      const refreshed = await fetch("/api/hr").then((r) => r.json());
      setHrs(refreshed);
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      setFormError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground">HR Managers</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage HR accounts. Each HR manages their own workers.
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => { setShowForm((v) => !v); setFormError(""); }}
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "Add HR"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Add HR form */}
        {showForm && (
          <Card className="border-blue-300 mb-6 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="w-5 h-5" />
                New HR Account
              </CardTitle>
              <CardDescription>This HR will be able to register and manage their own workers.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldGroup>
                    <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
                    <Input id="firstName" name="firstName" placeholder="Jane" value={form.firstName} onChange={handleChange} required disabled={submitting} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
                    <Input id="lastName" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required disabled={submitting} />
                  </FieldGroup>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldGroup>
                    <FieldLabel htmlFor="email">Email Address *</FieldLabel>
                    <Input id="email" name="email" type="email" placeholder="hr@company.com" value={form.email} onChange={handleChange} required disabled={submitting} />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input id="phone" name="phone" type="tel" placeholder="+250 700 000 000" value={form.phone} onChange={handleChange} disabled={submitting} />
                  </FieldGroup>
                </div>
                <FieldGroup>
                  <FieldLabel htmlFor="password">Password *</FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password" name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={form.password} onChange={handleChange}
                      required disabled={submitting}
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FieldGroup>
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={submitting}>
                    {submitting ? <><Spinner className="w-4 h-4 mr-2" />Creating...</> : <><UserCheck className="w-4 h-4 mr-2" />Create HR Account</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total HRs", value: hrs.length, color: "text-foreground" },
            { label: "Active", value: hrs.filter((h) => h.status === "ACTIVE").length, color: "text-green-600" },
            { label: "Total Workers Managed", value: hrs.reduce((s, h) => s + h.managedWorkers.length, 0), color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="border-blue-200">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* HR Table */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              All HR Accounts ({hrs.length})
            </CardTitle>
            <CardDescription>Each HR can only see and manage their own registered workers.</CardDescription>
          </CardHeader>
          <CardContent>
            {hrs.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium mb-1">No HR accounts yet</p>
                <p className="text-sm text-muted-foreground mb-4">Click "Add HR" to create the first HR account.</p>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />Add HR
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-200">
                      {["Name", "Email", "Phone", "Workers", "Status", "Joined"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-sm font-semibold text-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hrs.map((hr) => (
                      <tr key={hr.id} className="border-b border-blue-100 hover:bg-blue-50/50 transition">
                        <td className="py-3 px-4 text-sm font-semibold text-foreground">
                          {hr.firstName} {hr.lastName}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {hr.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {hr.phone ? (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              {hr.phone}
                            </div>
                          ) : "—"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                            <Users className="w-3.5 h-3.5" />
                            {hr.managedWorkers.length}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge className={statusColor(hr.status)}>{hr.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(hr.createdAt).toLocaleDateString()}
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
