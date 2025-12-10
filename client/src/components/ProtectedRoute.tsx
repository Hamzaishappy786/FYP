import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, initializeAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("patient" | "doctor")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      navigate("/login");
    }
  }, [isLoading, user, allowedRoles, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-medical-blue-600 mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
