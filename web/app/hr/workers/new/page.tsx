"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HRNav } from "@/components/hr/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, ArrowLeft, UserPlus, Eye, EyeOff, Lock } from "lucide-react";

export default function NewWorkerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    jobTitle: "",
    homeAddress: "",
    workAddress: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to register worker.");
        return;
      }
      router.push("/hr/workers");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <HRNav user={null} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Button asChild variant="ghost" className="mb-6 -ml-2 text-muted-foreground">
          <a href="/hr/workers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workers
          </a>
        </Button>

        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="w-5 h-5" />
              Register New Worker
            </CardTitle>
            <CardDescription>
              Fill in the worker's details. They will use the mobile app to log in.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup>
                  <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </FieldGroup>
              </div>

              <FieldGroup>
                <FieldLabel htmlFor="email">Email Address *</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="worker@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+250 700 000 000"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="password">Password *</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
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

              <FieldGroup>
                <FieldLabel htmlFor="jobTitle">Job Title *</FieldLabel>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="e.g. Field Officer"
                  value={form.jobTitle}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </FieldGroup>

              <div className="border-t border-blue-100 pt-4">
                <p className="text-sm font-medium text-foreground mb-3">Location Information</p>
                <div className="space-y-4">
                  <FieldGroup>
                    <FieldLabel htmlFor="workAddress">Work Location</FieldLabel>
                    <Input
                      id="workAddress"
                      name="workAddress"
                      placeholder="e.g. KN 5 Rd, Kigali"
                      value={form.workAddress}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="homeAddress">Home Location</FieldLabel>
                    <Input
                      id="homeAddress"
                      name="homeAddress"
                      placeholder="e.g. KG 123 St, Kigali"
                      value={form.homeAddress}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </FieldGroup>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/hr/workers")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register Worker
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
