"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Home,
  Shield,
  BarChart3,
  ArrowRight,
  Lock,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">RWATRACK</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary transition"
            >
              Login
            </Link>
            <Link href="/register" className="text-sm font-medium">
              <Button size="sm" variant="outline">
                Register
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
          Enterprise Residence Management System
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Streamline employee residence verification, requests, and compliance
          with our intelligent management platform designed for HR teams and
          administrators.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
          Core Features
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-blue-200 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Employee Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage employee profiles, departments, positions, and personal
                information in one centralized location.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Residence Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Submit and track residence change requests with documentation
                support and approval workflow.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Fraud Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Alert system and investigation tools to identify and manage
                suspicious activities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Granular permission system with Admin, HR, and Employee roles
                for secure operations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time insights and reporting on residence requests, employee
                data, and system activity.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete audit logs of all system activities for compliance and
                security monitoring.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white border-t border-blue-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Why Choose RWATRACK?
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Secure & Compliant
                  </h3>
                  <p className="text-muted-foreground">
                    Enterprise-grade security with audit trails and
                    comprehensive access controls.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Easy to Use
                  </h3>
                  <p className="text-muted-foreground">
                    Intuitive interface designed for both administrators and
                    employees.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Real-time Updates
                  </h3>
                  <p className="text-muted-foreground">
                    Instant notifications and status updates on all residence
                    requests.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Scalable Solution
                  </h3>
                  <p className="text-muted-foreground">
                    Handles organizations of any size with enterprise
                    infrastructure.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    24/7 Support
                  </h3>
                  <p className="text-muted-foreground">
                    Dedicated support team ready to assist with any questions or
                    issues.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Advanced Analytics
                  </h3>
                  <p className="text-muted-foreground">
                    Powerful dashboards and reports for data-driven decision
                    making.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join organizations worldwide using RWATRACK for efficient residence
          management.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Create Your Account Today
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; 2024 RWATRACK. All rights reserved. Enterprise Residence
            Management System.
          </p>
        </div>
      </footer>
    </div>
  );
}
