import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, Loader2, Stethoscope, User } from "lucide-react";
import logoImage from "@assets/logo_1765394780707.png";

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
});

const doctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.string().optional(),
  qualifications: z.string().optional(),
});

type PatientForm = z.infer<typeof patientSchema>;
type DoctorForm = z.infer<typeof doctorSchema>;

export default function SignUp() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  const patientForm = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      age: "",
      gender: "",
      bloodGroup: "",
    },
  });

  const doctorForm = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      specialization: "",
      experience: "",
      qualifications: "",
    },
  });

  const onSubmitPatient = async (data: PatientForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          age: data.age ? parseInt(data.age) : undefined,
        }),
        credentials: "include",
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUser(result.user);
        toast({
          title: "Account created!",
          description: "Welcome to DoctorPath AI",
        });
        navigate("/patient/dashboard");
      } else {
        toast({
          title: "Signup failed",
          description: result.message || "Could not create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitDoctor = async (data: DoctorForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUser(result.user);
        toast({
          title: "Account created!",
          description: "Welcome to DoctorPath AI",
        });
        navigate("/doctor/dashboard");
      } else {
        toast({
          title: "Signup failed",
          description: result.message || "Could not create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 to-white dark:from-background dark:to-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-3 cursor-pointer">
              <img src={logoImage} alt="DoctorPath AI" className="h-12 w-auto" />
              <span className="text-2xl font-bold text-foreground">DoctorPath AI</span>
            </div>
          </Link>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground">Join DoctorPath AI today</p>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs value={role} onValueChange={(v) => setRole(v as "patient" | "doctor")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="patient" className="gap-2" data-testid="tab-patient">
                  <User className="h-4 w-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="doctor" className="gap-2" data-testid="tab-doctor">
                  <Stethoscope className="h-4 w-4" />
                  Doctor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patient">
                <form onSubmit={patientForm.handleSubmit(onSubmitPatient)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="patient-name">Full Name *</Label>
                      <Input
                        id="patient-name"
                        placeholder="John Doe"
                        data-testid="input-patient-name"
                        {...patientForm.register("name")}
                        className={patientForm.formState.errors.name ? "border-destructive" : ""}
                      />
                      {patientForm.formState.errors.name && (
                        <p className="text-sm text-destructive">{patientForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="patient-email">Email *</Label>
                      <Input
                        id="patient-email"
                        type="email"
                        placeholder="john@example.com"
                        data-testid="input-patient-email"
                        {...patientForm.register("email")}
                        className={patientForm.formState.errors.email ? "border-destructive" : ""}
                      />
                      {patientForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{patientForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="patient-password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="patient-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 6 characters"
                          data-testid="input-patient-password"
                          {...patientForm.register("password")}
                          className={patientForm.formState.errors.password ? "border-destructive pr-10" : "pr-10"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {patientForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{patientForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="patient-phone">Phone</Label>
                      <Input
                        id="patient-phone"
                        placeholder="+92 300 1234567"
                        data-testid="input-patient-phone"
                        {...patientForm.register("phone")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="patient-age">Age</Label>
                      <Input
                        id="patient-age"
                        type="number"
                        placeholder="25"
                        data-testid="input-patient-age"
                        {...patientForm.register("age")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select onValueChange={(v) => patientForm.setValue("gender", v)}>
                        <SelectTrigger data-testid="select-patient-gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Blood Group</Label>
                      <Select onValueChange={(v) => patientForm.setValue("bloodGroup", v)}>
                        <SelectTrigger data-testid="select-patient-blood">
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-submit-patient"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Patient Account"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="doctor">
                <form onSubmit={doctorForm.handleSubmit(onSubmitDoctor)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="doctor-name">Full Name *</Label>
                      <Input
                        id="doctor-name"
                        placeholder="Dr. Jane Smith"
                        data-testid="input-doctor-name"
                        {...doctorForm.register("name")}
                        className={doctorForm.formState.errors.name ? "border-destructive" : ""}
                      />
                      {doctorForm.formState.errors.name && (
                        <p className="text-sm text-destructive">{doctorForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="doctor-email">Email *</Label>
                      <Input
                        id="doctor-email"
                        type="email"
                        placeholder="doctor@hospital.com"
                        data-testid="input-doctor-email"
                        {...doctorForm.register("email")}
                        className={doctorForm.formState.errors.email ? "border-destructive" : ""}
                      />
                      {doctorForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{doctorForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="doctor-password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="doctor-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 6 characters"
                          data-testid="input-doctor-password"
                          {...doctorForm.register("password")}
                          className={doctorForm.formState.errors.password ? "border-destructive pr-10" : "pr-10"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {doctorForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{doctorForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor-phone">Phone</Label>
                      <Input
                        id="doctor-phone"
                        placeholder="+92 300 1234567"
                        data-testid="input-doctor-phone"
                        {...doctorForm.register("phone")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor-specialization">Specialization</Label>
                      <Input
                        id="doctor-specialization"
                        placeholder="Oncology"
                        data-testid="input-doctor-specialization"
                        {...doctorForm.register("specialization")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor-experience">Experience</Label>
                      <Input
                        id="doctor-experience"
                        placeholder="5 years"
                        data-testid="input-doctor-experience"
                        {...doctorForm.register("experience")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctor-qualifications">Qualifications</Label>
                      <Input
                        id="doctor-qualifications"
                        placeholder="MBBS, MD"
                        data-testid="input-doctor-qualifications"
                        {...doctorForm.register("qualifications")}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-submit-doctor"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Doctor Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-medical-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
