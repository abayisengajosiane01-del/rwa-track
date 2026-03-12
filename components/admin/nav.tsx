"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  LogOut,
  User,
  Users,
  AlertTriangle,
  Settings,
} from "lucide-react";

interface NavProps {
  user: any;
}

export function AdminNav({ user }: NavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground hidden sm:inline">
            RWATRACK Admin
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          <Link
            href="/admin"
            className="text-sm font-medium text-foreground hover:text-primary transition"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-foreground hover:text-primary transition"
          >
            Users
          </Link>
          <Link
            href="/admin/fraud-alerts"
            className="text-sm font-medium text-foreground hover:text-primary transition"
          >
            Fraud Alerts
          </Link>
          <Link
            href="/admin/audit-logs"
            className="text-sm font-medium text-foreground hover:text-primary transition"
          >
            Audit Logs
          </Link>
          <Link
            href="/admin/settings"
            className="text-sm font-medium text-foreground hover:text-primary transition"
          >
            Settings
          </Link>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user?.firstName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-sm font-semibold">
              Administrator
            </div>
            <div className="px-2 py-0.5 text-xs text-muted-foreground">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/users">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/fraud-alerts">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Fraud Alerts
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/audit-logs">
                <User className="w-4 h-4 mr-2" />
                Audit Logs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
