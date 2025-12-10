import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initializeAuth } from "@/lib/auth";

import PublicHome from "@/pages/PublicHome";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import PatientDashboard from "@/pages/PatientDashboard";
import DoctorDashboard from "@/pages/DoctorDashboard";
import Profile from "@/pages/Profile";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={PublicHome} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />

      {/* Patient Routes */}
      <Route path="/patient/dashboard">
        <ProtectedRoute allowedRoles={["patient"]}>
          <PatientDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/patient/appointments">
        <ProtectedRoute allowedRoles={["patient"]}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Appointments</h2>
            <p className="text-muted-foreground">Appointment management coming soon...</p>
          </div>
        </ProtectedRoute>
      </Route>
      <Route path="/patient/medical-history">
        <ProtectedRoute allowedRoles={["patient"]}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Medical History</h2>
            <p className="text-muted-foreground">Medical history page coming soon...</p>
          </div>
        </ProtectedRoute>
      </Route>
      <Route path="/patient/test-results">
        <ProtectedRoute allowedRoles={["patient"]}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Test Results</h2>
            <p className="text-muted-foreground">Test results page coming soon...</p>
          </div>
        </ProtectedRoute>
      </Route>
      <Route path="/patient/profile">
        <ProtectedRoute allowedRoles={["patient"]}>
          <Profile />
        </ProtectedRoute>
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor/dashboard">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <DoctorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/doctor/patients">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Patients</h2>
            <p className="text-muted-foreground">Patient management page coming soon...</p>
          </div>
        </ProtectedRoute>
      </Route>
      <Route path="/doctor/appointments">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Appointments</h2>
            <p className="text-muted-foreground">Appointment management page coming soon...</p>
          </div>
        </ProtectedRoute>
      </Route>
      <Route path="/doctor/diagnosis">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <DoctorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/doctor/data-entry">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Data Entry</h2>
            <p className="text-muted-foreground">Patient data entry page coming soon...</p>
          </div>
        </ProtectedRoute>
      </Route>
      <Route path="/doctor/profile">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <Profile />
        </ProtectedRoute>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
