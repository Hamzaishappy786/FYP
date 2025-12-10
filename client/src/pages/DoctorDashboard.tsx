import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Stethoscope, Brain, Loader2, Check, X, Clock, Download, User, Building2, GraduationCap } from "lucide-react";

interface PatientRequest {
  id: number;
  patientName: string;
  hospital: string;
  status: string;
  note: string | null;
  createdAt: string;
  dataShare?: {
    allowDataShare: boolean;
    note: string;
    fileName?: string;
    fileContent?: string;
  };
}

interface DiagnosisResult {
  probability: string;
  riskLevel: string;
  recommendation: string;
  cancerType: string;
  tumorSize: number;
}

interface DoctorProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  experience: string | null;
  qualifications: string | null;
  hospitalName: string;
  hospitalCity: string;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Diagnosis form state
  const [cancerType, setCancerType] = useState("liver");
  const [tumorSize, setTumorSize] = useState("");
  const [biomarker1, setBiomarker1] = useState("");
  const [biomarker2, setBiomarker2] = useState("");
  const [additionalFactor, setAdditionalFactor] = useState("");
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  
  // Request response state
  const [requestResponses, setRequestResponses] = useState<Record<number, { slot: string; note: string }>>({});

  // Fetch doctor's profile
  const { data: doctorProfile, isLoading: profileLoading } = useQuery<DoctorProfile>({
    queryKey: ["/api/doctor/profile"],
  });

  // Fetch doctor's patients count
  const { data: patientsData } = useQuery({
    queryKey: ["/api/doctor/patients"],
  });

  // Fetch incoming requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery<PatientRequest[]>({
    queryKey: ["/api/doctor/requests"],
  });

  // Update request status mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, scheduleNote, proposedSlot }: {
      requestId: number;
      status: string;
      scheduleNote?: string;
      proposedSlot?: string;
    }) => {
      const response = await apiRequest("PATCH", `/api/doctor-requests/${requestId}`, {
        status,
        scheduleNote,
        proposedSlot,
      });
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: "Request updated!" });
        queryClient.invalidateQueries({ queryKey: ["/api/doctor/requests"] });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update request", variant: "destructive" });
    },
  });

  // Diagnosis calculation mutation
  const diagnosisMutation = useMutation({
    mutationFn: async (data: {
      cancerType: string;
      tumorSize: number;
      biomarker1: number;
      biomarker2?: string | null;
      additionalFactor?: string | null;
    }) => {
      const response = await apiRequest("POST", "/api/diagnosis/calculate", data);
      return response.json();
    },
    onSuccess: (result) => {
      setDiagnosisResult(result);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to calculate diagnosis", variant: "destructive" });
    },
  });

  const handleDiagnosisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tumorSize || !biomarker1) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }
    diagnosisMutation.mutate({
      cancerType,
      tumorSize: parseFloat(tumorSize),
      biomarker1: parseFloat(biomarker1),
      biomarker2: biomarker2 || null,
      additionalFactor: additionalFactor || null,
    });
  };

  const handleRequestDecision = (requestId: number, status: string) => {
    const response = requestResponses[requestId] || { slot: "", note: "" };
    updateRequestMutation.mutate({
      requestId,
      status,
      scheduleNote: response.note,
      proposedSlot: response.slot,
    });
  };

  const updateResponseField = (requestId: number, field: "slot" | "note", value: string) => {
    setRequestResponses((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value,
      },
    }));
  };

  const getBiomarkerLabel = () => {
    switch (cancerType) {
      case "liver":
        return "AFP Level (ng/mL)";
      case "lung":
        return "CEA Level (ng/mL)";
      default:
        return "Biomarker Level";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-medical-green-100 text-medical-green-700 dark:bg-medical-green-900/30";
      case "declined":
        return "bg-medical-red-100 text-medical-red-700 dark:bg-medical-red-900/30";
      case "reschedule":
        return "bg-medical-yellow-100 text-medical-yellow-600 dark:bg-medical-yellow-900/30";
      default:
        return "bg-medical-blue-100 text-medical-blue-700 dark:bg-medical-blue-900/30";
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "text-medical-green-600 bg-medical-green-100";
      case "Moderate":
        return "text-medical-yellow-600 bg-medical-yellow-100";
      case "High":
        return "text-medical-red-600 bg-medical-red-100";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2" data-testid="text-welcome">
          Doctor Dashboard
        </h2>
        <p className="text-medical-blue-100">
          Manage your patients and use diagnostic tools
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-foreground" data-testid="text-patients-count">
                  {Array.isArray(patientsData) ? patientsData.length : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-medical-blue-100 dark:bg-medical-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-medical-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-foreground">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-medical-yellow-100 dark:bg-medical-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-medical-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Diagnosis Tools</p>
                <p className="text-3xl font-bold text-foreground">3</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-medical-blue-600" />
            My Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your professional credentials and hospital affiliations
          </p>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : doctorProfile ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-medical-blue-100 dark:bg-medical-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-medical-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{doctorProfile.name}</p>
                    <p className="text-sm text-muted-foreground">{doctorProfile.email}</p>
                    {doctorProfile.phone && <p className="text-sm text-muted-foreground">{doctorProfile.phone}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-medical-green-100 dark:bg-medical-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-medical-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Hospital Affiliation</p>
                    <p className="text-sm text-muted-foreground">{doctorProfile.hospitalName}</p>
                    {doctorProfile.hospitalCity && <p className="text-xs text-muted-foreground">{doctorProfile.hospitalCity}</p>}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Specialization</p>
                    <p className="text-sm text-muted-foreground">{doctorProfile.specialization || "Not specified"}</p>
                    <p className="text-xs text-muted-foreground">{doctorProfile.experience || "Experience not specified"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-medical-yellow-100 dark:bg-medical-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-medical-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Qualifications</p>
                    <p className="text-sm text-muted-foreground">{doctorProfile.qualifications || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Unable to load profile. Please try again.</p>
          )}
        </CardContent>
      </Card>

      {/* Patient Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Requests</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and respond to patient appointment requests
          </p>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-3"
                  data-testid={`card-request-${request.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{request.patientName}</p>
                      <p className="text-xs text-muted-foreground">{request.hospital}</p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>

                  {request.note && (
                    <p className="text-sm text-muted-foreground">{request.note}</p>
                  )}

                  {request.dataShare?.allowDataShare && (
                    <div className="bg-medical-blue-50 dark:bg-medical-blue-900/20 rounded-lg p-3 space-y-2">
                      <p className="text-sm font-medium text-medical-blue-800 dark:text-medical-blue-200">
                        Patient shared data
                      </p>
                      {request.dataShare.note && (
                        <p className="text-xs text-medical-blue-700 dark:text-medical-blue-300">
                          {request.dataShare.note}
                        </p>
                      )}
                      {request.dataShare.fileName && (
                        <div className="flex items-center gap-2">
                          <p className="text-xs">{request.dataShare.fileName}</p>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {request.status === "pending" && (
                    <>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Propose Time/Slot</Label>
                          <Input
                            placeholder="e.g., Dec 20, 3:30 PM"
                            value={requestResponses[request.id]?.slot || ""}
                            onChange={(e) => updateResponseField(request.id, "slot", e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Note to Patient</Label>
                          <Input
                            placeholder="Add scheduling guidance..."
                            value={requestResponses[request.id]?.note || ""}
                            onChange={(e) => updateResponseField(request.id, "note", e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRequestDecision(request.id, "accepted")}
                          disabled={updateRequestMutation.isPending}
                          className="bg-medical-green-600 hover:bg-medical-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestDecision(request.id, "reschedule")}
                          disabled={updateRequestMutation.isPending}
                          className="border-medical-yellow-500 text-medical-yellow-600"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Propose New Time
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestDecision(request.id, "declined")}
                          disabled={updateRequestMutation.isPending}
                          className="border-medical-red-500 text-medical-red-600"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Requested on {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnosis Tool */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-medical-blue-600" />
              Cancer Diagnosis Tool
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Calculate cancer risk probability based on clinical data
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDiagnosisSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cancer Type</Label>
                <Select value={cancerType} onValueChange={(v) => {
                  setCancerType(v);
                  setBiomarker1("");
                  setBiomarker2("");
                  setAdditionalFactor("");
                  setDiagnosisResult(null);
                }}>
                  <SelectTrigger data-testid="select-cancer-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="liver">Liver Cancer</SelectItem>
                    <SelectItem value="lung">Lung Cancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tumor Size (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 2.5"
                    value={tumorSize}
                    onChange={(e) => setTumorSize(e.target.value)}
                    data-testid="input-tumor-size"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{getBiomarkerLabel()}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter value"
                    value={biomarker1}
                    onChange={(e) => setBiomarker1(e.target.value)}
                    data-testid="input-biomarker1"
                  />
                </div>
              </div>

              {cancerType === "lung" && (
                <div className="space-y-2">
                  <Label>Smoking History</Label>
                  <Select value={additionalFactor} onValueChange={setAdditionalFactor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select smoking history" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never Smoked</SelectItem>
                      <SelectItem value="former">Former Smoker</SelectItem>
                      <SelectItem value="current">Current Smoker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={diagnosisMutation.isPending}
                data-testid="button-calculate-diagnosis"
              >
                {diagnosisMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate Risk"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Diagnosis Result */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnosis Result</CardTitle>
          </CardHeader>
          <CardContent>
            {diagnosisResult ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-6xl font-bold text-foreground" data-testid="text-probability">
                    {diagnosisResult.probability}%
                  </p>
                  <Badge className={`mt-2 text-lg px-4 py-1 ${getRiskColor(diagnosisResult.riskLevel)}`}>
                    {diagnosisResult.riskLevel} Risk
                  </Badge>
                </div>

                <div className="bg-medical-blue-50 dark:bg-medical-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-medical-blue-800 dark:text-medical-blue-200 mb-2">
                    Recommendation
                  </h4>
                  <p className="text-sm text-medical-blue-700 dark:text-medical-blue-300 leading-relaxed">
                    {diagnosisResult.recommendation}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cancer Type</p>
                    <p className="font-medium">{diagnosisResult.cancerType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tumor Size</p>
                    <p className="font-medium">{diagnosisResult.tumorSize} cm</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Enter patient data and click "Calculate Risk"</p>
                <p className="text-sm">Results will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
