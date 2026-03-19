"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Home, LogOut, User, FileText, Menu } from "lucide-react";

interface NavProps {
  user: any;
}

export function EmployeeNav({ user }: NavProps) {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/employee" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground hidden sm:inline">
            RWATRACK
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/employee"
            className="text-sm font-medium text-foreground hover:text-primary transition"
          >
            Dashboard
          </Link>
          <Link
            href="/employee/new-request"
            className="text-sm font-medium text-foreground hover:text-primary transition"
          >
            New Request
          </Link>
          <Link
            href="/employee/profile"
            className="text-sm font-medium text-foreground hover:text-primary transition"
          >
            Profile
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
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/employee/profile">
                <User className="w-4 h-4 mr-2" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/employee/requests">
                <FileText className="w-4 h-4 mr-2" />
                My Requests
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
