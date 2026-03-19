"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmployeeNav } from "@/components/employee/nav";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, ArrowLeft } from "lucide-react";
import React from "react";

export default function EmployeeNewRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    newAddress: "",
    moveDate: "",
    reason: "",
    documentation: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
          setEmployee(userData.employee);
        } else {
          setError("Failed to load user data");
        }
      } catch (err) {
        setError("Error loading profile");
        console.error("[v0] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!employee) {
        setError("Employee information not found");
        return;
      }

      const res = await fetch("/api/residence-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          newAddress: formData.newAddress,
          moveDate: formData.moveDate,
          reason: formData.reason,
          documentation: formData.documentation,
        }),
      });

      if (res.ok) {
        router.push("/employee");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit request");
      }
    } catch (err) {
      setError("Error submitting request");
      console.error("[v0] Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <EmployeeNav user={user} />
        <div className="flex items-center justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <EmployeeNav user={user} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/employee"
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">
          Submit Residence Change Request
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>New Residence Request</CardTitle>
            <CardDescription>
              Submit a request to change your residence address
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-foreground mb-3">
                  Current Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Employee ID</p>
                    <p className="font-medium font-mono">
                      {employee?.employeeId}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Position</p>
                    <p className="font-medium">{employee?.position}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Department</p>
                    <p className="font-medium">{employee?.department}</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <FieldGroup>
                <FieldLabel htmlFor="newAddress">
                  New Residence Address *
                </FieldLabel>
                <Input
                  id="newAddress"
                  name="newAddress"
                  placeholder="Enter your new address"
                  value={formData.newAddress}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="moveDate">Intended Move Date *</FieldLabel>
                <Input
                  id="moveDate"
                  name="moveDate"
                  type="date"
                  value={formData.moveDate}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="reason">Reason for Change *</FieldLabel>
                <textarea
                  id="reason"
                  name="reason"
                  placeholder="Explain the reason for this residence change"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  rows={4}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="documentation">
                  Documentation URL (optional)
                </FieldLabel>
                <Input
                  id="documentation"
                  name="documentation"
                  placeholder="Link to supporting documents"
                  value={formData.documentation}
                  onChange={handleChange}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can upload documents to Cloudinary and paste the link here
                </p>
              </FieldGroup>

              <div className="pt-6 border-t border-blue-200 flex gap-3">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
                <Link href="/employee">
                  <Button variant="outline" disabled={submitting}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-blue-200 mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Provide a detailed reason for your residence change</p>
            <p>• Include any supporting documents as links</p>
            <p>
              • Your HR manager will review and respond within 5 business days
            </p>
            <p>• Questions? Contact your HR department</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
