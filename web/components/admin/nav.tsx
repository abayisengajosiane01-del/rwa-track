"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MapPin, LogOut, User, Users, UserCheck, FileText, Settings } from "lucide-react";

interface NavProps { user: any; }

export function AdminNav({ user }: NavProps) {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground hidden sm:inline">RWATRACK Admin</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/users", label: "Users" },
            { href: "/admin/hr", label: "HR Managers" },
            { href: "/admin/audit-logs", label: "Audit Logs" },
            { href: "/admin/settings", label: "Settings" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm font-medium text-foreground hover:text-primary transition">
              {label}
            </Link>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user?.firstName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-sm font-semibold">Administrator</div>
            <div className="px-2 py-0.5 text-xs text-muted-foreground">{user?.email}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/admin"><MapPin className="w-4 h-4 mr-2" />Dashboard</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/admin/users"><Users className="w-4 h-4 mr-2" />Manage Users</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/admin/hr"><UserCheck className="w-4 h-4 mr-2" />HR Managers</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/admin/audit-logs"><FileText className="w-4 h-4 mr-2" />Audit Logs</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/admin/settings"><Settings className="w-4 h-4 mr-2" />Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
