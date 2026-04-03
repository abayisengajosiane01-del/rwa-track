"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MapPin, LogOut, User, Users, BarChart2 } from "lucide-react";

interface NavProps { user: any; }

export function HRNav({ user }: NavProps) {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/hr" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground hidden sm:inline">RWATRACK HR</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {[
            { href: "/hr", label: "Dashboard" },
            { href: "/hr/workers", label: "Workers" },
            { href: "/hr/location-history", label: "Location History" },
            { href: "/hr/reports", label: "Reports" },
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
            <div className="px-2 py-1.5 text-sm font-semibold">HR Manager</div>
            <div className="px-2 py-0.5 text-xs text-muted-foreground">{user?.email}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/hr"><MapPin className="w-4 h-4 mr-2" />Dashboard</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/hr/workers"><Users className="w-4 h-4 mr-2" />Workers</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/hr/location-history"><MapPin className="w-4 h-4 mr-2" />Location History</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/hr/reports"><BarChart2 className="w-4 h-4 mr-2" />Reports</Link></DropdownMenuItem>
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
