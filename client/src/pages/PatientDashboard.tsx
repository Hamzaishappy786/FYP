import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ChatbotWidget from "@/components/ChatbotWidget";
import { Calendar, FileText, TestTube, Loader2, Send, Upload, X } from "lucide-react";

interface Hospital {
  id: number;
  name: string;
  branchCode: string;
  city: string;
}

interface Department {
  id: number;
  name: string;
  description: string | null;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string | null;
}

interface DoctorRequest {
  id: number;
  doctorName: string;
  hospital: string;
  status: string;
  note: string | null;
  scheduleNote: string | null;
  proposedSlot: string | null;
  createdAt: string;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [requestNote, setRequestNote] = useState("");
  const [shareNote, setShareNote] = useState("");
  const [allowDataShare, setAllowDataShare] = useState(true);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Fetch patient data
  const { data: patientData, isLoading: patientLoading } = useQuery({
    queryKey: ["/api/patients", user?.patientId],
    enabled: !!user?.patientId,
  });

  // Fetch hospitals
  const { data: hospitals = [], isLoading: hospitalsLoading } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  // Fetch departments by hospital
  const { data: departmentsList = [], isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments", selectedHospital],
    enabled: !!selectedHospital,
  });

  // Fetch doctors by department
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors/department", selectedDepartment],
    enabled: !!selectedDepartment,
  });

  // Fetch patient's doctor requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery<DoctorRequest[]>({
    queryKey: ["/api/patient/requests"],
  });

  // Create doctor request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: {
      doctorId: number;
      hospitalId: number;
      note: string;
      dataShare: { allowDataShare: boolean; note: string; fileName?: string };
    }) => {
      const response = await apiRequest("POST", "/api/doctor-requests", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: "Request sent to doctor!" });
        queryClient.invalidateQueries({ queryKey: ["/api/patient/requests"] });
        setSelectedHospital("");
        setSelectedDepartment("");
        setSelectedDoctor("");
        setRequestNote("");
        setShareNote("");
        setShareFile(null);
        setWizardStep(1);
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
    },
  });

  const handleSubmitRequest = () => {
    if (!selectedDoctor || !selectedHospital) {
      toast({ title: "Error", description: "Please select a hospital and doctor", variant: "destructive" });
      return;
    }

    createRequestMutation.mutate({
      doctorId: parseInt(selectedDoctor),
      hospitalId: parseInt(selectedHospital),
      note: requestNote,
      dataShare: {
        allowDataShare,
        note: shareNote,
        fileName: shareFile?.name,
      },
    });
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

  if (patientLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2" data-testid="text-welcome">
          Welcome back, {user?.name || "Patient"}!
        </h2>
        <p className="text-medical-blue-100">
          Here's an overview of your health information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upcoming Appointments</p>
                <p className="text-3xl font-bold text-foreground" data-testid="text-appointments-count">0</p>
              </div>
              <div className="w-12 h-12 bg-medical-blue-100 dark:bg-medical-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-medical-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Recent Test Results</p>
                <p className="text-3xl font-bold text-foreground" data-testid="text-tests-count">0</p>
              </div>
              <div className="w-12 h-12 bg-medical-green-100 dark:bg-medical-green-900/30 rounded-lg flex items-center justify-center">
                <TestTube className="h-6 w-6 text-medical-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Medical Records</p>
                <p className="text-3xl font-bold text-foreground" data-testid="text-records-count">0</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Doctor Selection Wizard */}
        <Card>
          <CardHeader>
            <CardTitle>Book a Doctor Appointment</CardTitle>
            <p className="text-sm text-muted-foreground">
              Follow the steps to find and connect with a specialist
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${wizardStep >= 1 ? 'bg-medical-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>1</div>
              <div className={`flex-1 h-1 ${wizardStep >= 2 ? 'bg-medical-blue-600' : 'bg-muted'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${wizardStep >= 2 ? 'bg-medical-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>2</div>
              <div className={`flex-1 h-1 ${wizardStep >= 3 ? 'bg-medical-blue-600' : 'bg-muted'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${wizardStep >= 3 ? 'bg-medical-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>3</div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Hospital</span>
              <span>Department</span>
              <span>Doctor</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Hospital Selection */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Step 1: Select Hospital</Label>
                  <p className="text-xs text-muted-foreground">Choose from Pakistani hospitals</p>
                </div>
                <div className="grid gap-2 max-h-64 overflow-y-auto">
                  {hospitalsLoading ? (
                    <Skeleton className="h-16" />
                  ) : (
                    hospitals.map((hospital) => (
                      <button
                        key={hospital.id}
                        onClick={() => {
                          setSelectedHospital(hospital.id.toString());
                          setSelectedDepartment("");
                          setSelectedDoctor("");
                          setWizardStep(2);
                        }}
                        className={`p-3 text-left border rounded-lg hover-elevate active-elevate-2 transition-colors ${
                          selectedHospital === hospital.id.toString() 
                            ? 'border-medical-blue-600 bg-medical-blue-50 dark:bg-medical-blue-900/20' 
                            : ''
                        }`}
                        data-testid={`button-hospital-${hospital.id}`}
                      >
                        <p className="font-medium text-foreground">{hospital.name}</p>
                        <p className="text-xs text-muted-foreground">{hospital.city}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Department Selection */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Step 2: Select Department</Label>
                  <p className="text-xs text-muted-foreground">
                    Hospital: {hospitals.find(h => h.id.toString() === selectedHospital)?.name}
                  </p>
                </div>
                <div className="grid gap-2">
                  {departmentsLoading ? (
                    <Skeleton className="h-16" />
                  ) : departmentsList.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3 border rounded-lg">No departments available</p>
                  ) : (
                    departmentsList.map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => {
                          setSelectedDepartment(dept.id.toString());
                          setSelectedDoctor("");
                          setWizardStep(3);
                        }}
                        className={`p-3 text-left border rounded-lg hover-elevate active-elevate-2 transition-colors ${
                          selectedDepartment === dept.id.toString() 
                            ? 'border-medical-blue-600 bg-medical-blue-50 dark:bg-medical-blue-900/20' 
                            : ''
                        }`}
                        data-testid={`button-department-${dept.id}`}
                      >
                        <p className="font-medium text-foreground">{dept.name}</p>
                        {dept.description && <p className="text-xs text-muted-foreground">{dept.description}</p>}
                      </button>
                    ))
                  )}
                </div>
                <Button variant="ghost" onClick={() => setWizardStep(1)} className="w-full">
                  Back to Hospital Selection
                </Button>
              </div>
            )}

            {/* Step 3: Doctor Selection */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Step 3: Select Doctor</Label>
                  <p className="text-xs text-muted-foreground">
                    {hospitals.find(h => h.id.toString() === selectedHospital)?.name} - {departmentsList.find(d => d.id.toString() === selectedDepartment)?.name}
                  </p>
                </div>
                <div className="grid gap-2">
                  {doctorsLoading ? (
                    <Skeleton className="h-16" />
                  ) : doctors.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3 border rounded-lg">No doctors available in this department</p>
                  ) : (
                    doctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => setSelectedDoctor(doctor.id.toString())}
                        className={`p-3 text-left border rounded-lg hover-elevate active-elevate-2 transition-colors ${
                          selectedDoctor === doctor.id.toString() 
                            ? 'border-medical-blue-600 bg-medical-blue-50 dark:bg-medical-blue-900/20' 
                            : ''
                        }`}
                        data-testid={`button-doctor-${doctor.id}`}
                      >
                        <p className="font-medium text-foreground">{doctor.name}</p>
                        {doctor.specialization && <p className="text-xs text-muted-foreground">{doctor.specialization}</p>}
                      </button>
                    ))
                  )}
                </div>
                <Button variant="ghost" onClick={() => setWizardStep(2)} className="w-full">
                  Back to Department Selection
                </Button>
              </div>
            )}

            {/* Request Form - Only show when doctor is selected */}
            {selectedDoctor && wizardStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Request Note</Label>
                  <Textarea
                    placeholder="Describe your symptoms or reason for visit..."
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    rows={3}
                    data-testid="input-request-note"
                  />
                </div>

                {/* Data Sharing Section */}
                <div className="border border-dashed rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">Share Your Data (Optional)</p>
                      <p className="text-xs text-muted-foreground">
                        Upload medical reports for the doctor to review
                      </p>
                    </div>
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 text-medical-blue-600 hover:text-medical-blue-700 font-medium text-sm">
                        <Upload className="h-4 w-4" />
                        Upload
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setShareFile(e.target.files?.[0] || null)}
                        data-testid="input-file-upload"
                      />
                    </label>
                  </div>

                  {shareFile && (
                    <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium">{shareFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(shareFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShareFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Textarea
                    placeholder="Add context about the data..."
                    value={shareNote}
                    onChange={(e) => setShareNote(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="data-share"
                      checked={allowDataShare}
                      onCheckedChange={(checked) => setAllowDataShare(!!checked)}
                      data-testid="checkbox-data-share"
                    />
                    <label htmlFor="data-share" className="text-sm text-muted-foreground cursor-pointer">
                      I allow this doctor to view my uploaded data
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitRequest}
                  disabled={createRequestMutation.isPending || !selectedDoctor}
                  className="w-full"
                  data-testid="button-send-request"
                >
                  {createRequestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Doctor Request
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Doctor Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Doctor Requests</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your appointment requests and responses
            </p>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No requests yet</p>
                <p className="text-sm">Select a doctor to send your first request</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 space-y-2"
                    data-testid={`card-request-${request.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{request.doctorName}</p>
                        <p className="text-xs text-muted-foreground">{request.hospital}</p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    {request.note && (
                      <p className="text-sm text-muted-foreground">{request.note}</p>
                    )}
                    {request.proposedSlot && (
                      <p className="text-sm text-medical-blue-600">
                        Proposed: {request.proposedSlot}
                      </p>
                    )}
                    {request.scheduleNote && (
                      <p className="text-sm text-muted-foreground italic">
                        Doctor note: {request.scheduleNote}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
