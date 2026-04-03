"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, MapPin, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function WorkerPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => {
      if (r.ok) r.json().then(setUser);
      else router.push("/login");
    });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-foreground">RWATRACK</span>
        </div>

        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Welcome{user ? `, ${user.firstName}` : ""}!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <Smartphone className="w-16 h-16 text-primary/60" />
            </div>
            <p className="text-muted-foreground text-sm">
              As a worker, please use the <strong>RWATRACK mobile app</strong> to
              access your account, share your location, and manage your work presence.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-left space-y-2">
              <p className="font-semibold text-foreground">Mobile App Features:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Secure login</li>
                <li>• Location permission & background updates</li>
                <li>• Work presence verification</li>
                <li>• Status & activity overview</li>
              </ul>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
