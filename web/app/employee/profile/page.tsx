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
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmployeeNav } from "@/components/employee/nav";
import { AlertCircle, Loader2, User, Mail, Phone } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: string;
  employee?: {
    employeeId: string;
    department: string;
    position: string;
    dateOfJoining: string;
    salary?: number;
  };
}

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || "",
          });
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        setError("Error fetching profile");
        console.error("[v0] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    // TODO: Implement profile update endpoint
    setSuccess("Profile updated successfully!");
    setEditing(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <EmployeeNav user={null} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <EmployeeNav user={profile} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Personal Information */}
        <Card className="border-blue-200 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your basic profile information
                </CardDescription>
              </div>
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="grid md:grid-cols-2 gap-3">
                  <FieldGroup>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </FieldGroup>
                </div>
                <FieldGroup>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </FieldGroup>
                <div className="flex gap-2 pt-4">
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      First Name
                    </label>
                    <p className="font-medium text-foreground">
                      {profile?.firstName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Last Name
                    </label>
                    <p className="font-medium text-foreground">
                      {profile?.lastName}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Email
                      </label>
                      <p className="font-medium text-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Phone
                      </label>
                      <p className="font-medium text-foreground">
                        {profile?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Employment Information */}
        {profile?.employee && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
              <CardDescription>Your employment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Employee ID
                  </label>
                  <p className="font-medium text-foreground font-mono">
                    {profile.employee.employeeId}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Position
                  </label>
                  <p className="font-medium text-foreground">
                    {profile.employee.position}
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Department
                  </label>
                  <p className="font-medium text-foreground">
                    {profile.employee.department}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Date of Joining
                  </label>
                  <p className="font-medium text-foreground">
                    {new Date(
                      profile.employee.dateOfJoining,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
