import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { loginSchema, signupPatientSchema, signupDoctorSchema, diagnosisSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users, doctors, hospitals, patients } from "@shared/schema";
import { eq } from "drizzle-orm";

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    userId?: number;
    role?: string;
  }
}

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  next();
}

// Middleware to check role
function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    if (req.session.role !== role) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
}

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  // Setup session middleware
  const SessionStore = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "doctorpath-secret-key-2025",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );
  // ============ Authentication Routes ============
  
  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      // Get patient or doctor ID
      let patientId: number | undefined;
      let doctorId: number | undefined;

      if (user.role === "patient") {
        const patient = await storage.getPatientByUserId(user.id);
        patientId = patient?.id;
      } else if (user.role === "doctor") {
        const doctor = await storage.getDoctorByUserId(user.id);
        doctorId = doctor?.id;
      }

      // Set session
      req.session.userId = user.id;
      req.session.role = user.role;

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          patientId,
          doctorId,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Signup Patient
  app.post("/api/auth/signup/patient", async (req: Request, res: Response) => {
    try {
      const data = signupPatientSchema.parse(req.body);
      
      // Check if email exists
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "patient",
        phone: data.phone,
      });

      // Create patient profile
      const patient = await storage.createPatient({
        userId: user.id,
        age: data.age,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        address: data.address,
      });

      // Set session
      req.session.userId = user.id;
      req.session.role = user.role;

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          patientId: patient.id,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Signup Doctor
  app.post("/api/auth/signup/doctor", async (req: Request, res: Response) => {
    try {
      const data = signupDoctorSchema.parse(req.body);
      
      // Check if email exists
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "doctor",
        phone: data.phone,
      });

      // Create doctor profile
      const doctor = await storage.createDoctor({
        userId: user.id,
        specialization: data.specialization,
        experience: data.experience,
        qualifications: data.qualifications,
        hospitalId: data.hospitalId,
      });

      // Set session
      req.session.userId = user.id;
      req.session.role = user.role;

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          doctorId: doctor.id,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      let patientId: number | undefined;
      let doctorId: number | undefined;

      if (user.role === "patient") {
        const patient = await storage.getPatientByUserId(user.id);
        patientId = patient?.id;
      } else if (user.role === "doctor") {
        const doctor = await storage.getDoctorByUserId(user.id);
        doctorId = doctor?.id;
      }

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          patientId,
          doctorId,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      return res.json({ success: true });
    });
  });

  // ============ Hospitals Routes ============
  
  app.get("/api/hospitals", async (req: Request, res: Response) => {
    try {
      const allHospitals = await storage.getAllHospitals();
      return res.json(allHospitals);
    } catch (error) {
      console.error("Get hospitals error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ============ Departments Routes ============
  
  app.get("/api/departments/:hospitalId", async (req: Request, res: Response) => {
    try {
      const hospitalId = parseInt(req.params.hospitalId);
      const departmentsList = await storage.getDepartmentsByHospital(hospitalId);
      return res.json(departmentsList);
    } catch (error) {
      console.error("Get departments error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ============ Doctors Routes ============
  
  // Get doctors by department
  app.get("/api/doctors/department/:departmentId", async (req: Request, res: Response) => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      const doctorsList = await storage.getDoctorsByDepartment(departmentId);
      
      const doctorsWithNames = await Promise.all(
        doctorsList.map(async (doctor) => {
          const user = await storage.getUserById(doctor.userId);
          return {
            id: doctor.id,
            name: user?.name || "Unknown",
            specialization: doctor.specialization,
            experience: doctor.experience,
          };
        })
      );
      
      return res.json(doctorsWithNames);
    } catch (error) {
      console.error("Get doctors by department error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Get doctors by hospital
  app.get("/api/doctors/:hospitalId", async (req: Request, res: Response) => {
    try {
      const hospitalId = parseInt(req.params.hospitalId);
      const doctorsList = await storage.getDoctorsByHospital(hospitalId);
      
      // Get user names for each doctor
      const doctorsWithNames = await Promise.all(
        doctorsList.map(async (doctor) => {
          const user = await storage.getUserById(doctor.userId);
          return {
            id: doctor.id,
            name: user?.name || "Unknown",
            specialization: doctor.specialization,
            experience: doctor.experience,
          };
        })
      );
      
      return res.json(doctorsWithNames);
    } catch (error) {
      console.error("Get doctors error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Update doctor profile
  app.patch("/api/doctors/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = await storage.getDoctorById(id);
      
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      // Ownership check: only the doctor themselves can update their profile
      if (doctor.userId !== req.session.userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      // Update user name if provided
      if (req.body.name) {
        await db.update(users).set({ name: req.body.name }).where(eq(users.id, doctor.userId));
      }

      // Update doctor-specific fields
      const updatedDoctor = await storage.updateDoctor(id, {
        specialization: req.body.specialization,
        experience: req.body.experience,
        qualifications: req.body.qualifications,
      });

      return res.json({ success: true, doctor: updatedDoctor });
    } catch (error) {
      console.error("Update doctor error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ============ Patients Routes ============
  
  // Get patient by ID
  app.get("/api/patients/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatientById(id);
      
      if (!patient) {
        return res.status(404).json({ success: false, message: "Patient not found" });
      }

      // Ownership check for patients: can only view own profile
      if (req.session.role === "patient" && patient.userId !== req.session.userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      // For doctors: must have an approved relationship with this patient
      if (req.session.role === "doctor") {
        const doctor = await storage.getDoctorByUserId(req.session.userId!);
        if (!doctor) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
        
        const requests = await storage.getDoctorRequestsByDoctor(doctor.id);
        const hasRelationship = requests.some(
          (r) => r.patientId === id && r.status === "approved"
        );
        
        if (!hasRelationship) {
          return res.status(403).json({ success: false, message: "No approved relationship with this patient" });
        }
      }

      const user = await storage.getUserById(patient.userId);
      
      return res.json({
        ...patient,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
      });
    } catch (error) {
      console.error("Get patient error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Update patient profile
  app.patch("/api/patients/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatientById(id);
      
      if (!patient) {
        return res.status(404).json({ success: false, message: "Patient not found" });
      }

      // Ownership check: only the patient themselves can update their profile
      if (patient.userId !== req.session.userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      // Update user name and phone if provided
      if (req.body.name || req.body.phone) {
        await db.update(users).set({ 
          ...(req.body.name && { name: req.body.name }),
          ...(req.body.phone && { phone: req.body.phone }),
        }).where(eq(users.id, patient.userId));
      }

      // Update patient-specific fields
      const updatedPatient = await storage.updatePatient(id, {
        age: req.body.age ? parseInt(req.body.age) : undefined,
        gender: req.body.gender,
        bloodGroup: req.body.bloodGroup,
        address: req.body.address,
      });

      return res.json({ success: true, patient: updatedPatient });
    } catch (error) {
      console.error("Update patient error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ============ Doctor Requests Routes ============
  
  // Get patient's requests
  app.get("/api/patient/requests", requireRole("patient"), async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user || user.role !== "patient") {
        return res.status(403).json({ success: false, message: "Not a patient" });
      }

      const patient = await storage.getPatientByUserId(user.id);
      if (!patient) {
        return res.status(404).json({ success: false, message: "Patient not found" });
      }

      const requests = await storage.getDoctorRequestsByPatient(patient.id);
      
      // Enrich with doctor and hospital info
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const doctor = await storage.getDoctorById(request.doctorId);
          const doctorUser = doctor ? await storage.getUserById(doctor.userId) : null;
          const hospital = request.hospitalId ? await storage.getHospitalById(request.hospitalId) : null;
          
          return {
            id: request.id,
            doctorName: doctorUser?.name || "Unknown",
            hospital: hospital?.name || "Unknown",
            status: request.status,
            note: request.note,
            scheduleNote: request.scheduleNote,
            proposedSlot: request.proposedSlot,
            createdAt: request.createdAt,
          };
        })
      );
      
      return res.json(enrichedRequests);
    } catch (error) {
      console.error("Get patient requests error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Get doctor's requests
  app.get("/api/doctor/requests", requireRole("doctor"), async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user || user.role !== "doctor") {
        return res.status(403).json({ success: false, message: "Not a doctor" });
      }

      const doctor = await storage.getDoctorByUserId(user.id);
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      const requests = await storage.getDoctorRequestsByDoctor(doctor.id);
      
      // Enrich with patient and hospital info
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const patient = await storage.getPatientById(request.patientId);
          const patientUser = patient ? await storage.getUserById(patient.userId) : null;
          const hospital = request.hospitalId ? await storage.getHospitalById(request.hospitalId) : null;
          
          return {
            id: request.id,
            patientName: patientUser?.name || "Unknown",
            hospital: hospital?.name || "Unknown",
            status: request.status,
            note: request.note,
            dataShare: request.dataShare,
            createdAt: request.createdAt,
          };
        })
      );
      
      return res.json(enrichedRequests);
    } catch (error) {
      console.error("Get doctor requests error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Get doctor's patients
  app.get("/api/doctor/patients", requireRole("doctor"), async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user || user.role !== "doctor") {
        return res.status(403).json({ success: false, message: "Not a doctor" });
      }

      const doctor = await storage.getDoctorByUserId(user.id);
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      // Get accepted requests to find patients
      const requests = await storage.getDoctorRequestsByDoctor(doctor.id);
      const acceptedRequests = requests.filter(r => r.status === "accepted");
      
      const patientIds = Array.from(new Set(acceptedRequests.map(r => r.patientId)));
      
      const patientsList = await Promise.all(
        patientIds.map(async (patientId) => {
          const patient = await storage.getPatientById(patientId);
          const patientUser = patient ? await storage.getUserById(patient.userId) : null;
          return {
            id: patient?.id,
            name: patientUser?.name,
            age: patient?.age,
            gender: patient?.gender,
          };
        })
      );
      
      return res.json(patientsList.filter(p => p.id));
    } catch (error) {
      console.error("Get doctor patients error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Create doctor request
  app.post("/api/doctor-requests", requireRole("patient"), async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user || user.role !== "patient") {
        return res.status(403).json({ success: false, message: "Not a patient" });
      }

      const patient = await storage.getPatientByUserId(user.id);
      if (!patient) {
        return res.status(404).json({ success: false, message: "Patient not found" });
      }

      const { doctorId, hospitalId, note, dataShare } = req.body;
      
      const request = await storage.createDoctorRequest({
        patientId: patient.id,
        doctorId: parseInt(doctorId),
        hospitalId: hospitalId ? parseInt(hospitalId) : null,
        note,
        dataShare,
        status: "pending",
      });
      
      return res.json({ success: true, request });
    } catch (error) {
      console.error("Create request error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Update doctor request (for doctor to respond)
  app.patch("/api/doctor-requests/:id", requireRole("doctor"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, scheduleNote, proposedSlot } = req.body;
      
      // Get the existing request to check ownership
      const existingRequest = await storage.getDoctorRequestById(id);
      if (!existingRequest) {
        return res.status(404).json({ success: false, message: "Request not found" });
      }
      
      // Verify this doctor owns this request
      const doctor = await storage.getDoctorByUserId(req.session.userId!);
      if (!doctor || existingRequest.doctorId !== doctor.id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      
      const request = await storage.updateDoctorRequest(id, {
        status,
        scheduleNote,
        proposedSlot,
      });
      
      return res.json({ success: true, request });
    } catch (error) {
      console.error("Update request error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ============ Diagnosis Routes ============
  
  app.post("/api/diagnosis/calculate", requireRole("doctor"), async (req: Request, res: Response) => {
    try {
      const data = diagnosisSchema.parse(req.body);
      
      // Cancer risk calculation algorithm
      let probability = 0;
      let riskLevel = "Low";
      let recommendation = "";
      
      switch (data.cancerType) {
        case "liver":
          // AFP (Alpha-fetoprotein) based calculation
          if (data.biomarker1 > 400) {
            probability = 75 + Math.min(data.tumorSize * 3, 20);
          } else if (data.biomarker1 > 20) {
            probability = 45 + Math.min(data.tumorSize * 2, 25);
          } else {
            probability = 15 + Math.min(data.tumorSize, 15);
          }
          break;
          
        case "lung":
          // CEA based calculation with smoking factor
          let smokingMultiplier = 1;
          if (data.additionalFactor === "current") smokingMultiplier = 1.8;
          else if (data.additionalFactor === "former") smokingMultiplier = 1.3;
          
          if (data.biomarker1 > 10) {
            probability = (60 + Math.min(data.tumorSize * 4, 25)) * smokingMultiplier;
          } else if (data.biomarker1 > 5) {
            probability = (35 + Math.min(data.tumorSize * 3, 20)) * smokingMultiplier;
          } else {
            probability = (10 + Math.min(data.tumorSize * 2, 15)) * smokingMultiplier;
          }
          break;
          
        case "breast":
          // CA 15-3 based calculation with HER2 status
          let her2Multiplier = 1;
          if (data.biomarker2 === "positive") her2Multiplier = 1.4;
          
          if (data.biomarker1 > 100) {
            probability = (70 + Math.min(data.tumorSize * 3, 20)) * her2Multiplier;
          } else if (data.biomarker1 > 30) {
            probability = (40 + Math.min(data.tumorSize * 2, 25)) * her2Multiplier;
          } else {
            probability = (12 + Math.min(data.tumorSize, 15)) * her2Multiplier;
          }
          break;
      }
      
      // Cap probability at 98%
      probability = Math.min(Math.round(probability), 98);
      
      // Determine risk level
      if (probability >= 70) {
        riskLevel = "High";
        recommendation = `High-risk indicators detected for ${data.cancerType} cancer. Immediate further diagnostic imaging and biopsy recommended. Consider multidisciplinary oncology consultation.`;
      } else if (probability >= 40) {
        riskLevel = "Moderate";
        recommendation = `Moderate risk detected. Recommend additional imaging studies (CT/MRI/PET scan) and close monitoring. Follow-up appointment in 2-4 weeks advised.`;
      } else {
        riskLevel = "Low";
        recommendation = `Current biomarkers show low risk. Continue routine surveillance with follow-up testing in 3-6 months. Maintain healthy lifestyle factors.`;
      }
      
      return res.json({
        probability,
        riskLevel,
        recommendation,
        cancerType: data.cancerType.charAt(0).toUpperCase() + data.cancerType.slice(1),
        tumorSize: data.tumorSize,
      });
    } catch (error) {
      console.error("Diagnosis error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ============ Chatbot Routes ============
  
  app.post("/api/chatbot", async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.json({ response: "Please enter a message." });
      }

      // Use Gemini API for responses
      const geminiApiKey = process.env.GEMINI_API_KEY;
      
      if (geminiApiKey) {
        try {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `You are a medical AI assistant for DoctorPath AI, an oncology support platform. Keep responses brief and helpful. The user's question is: ${message}`
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 256
                }
              })
            }
          );
          
          const data = await geminiResponse.json();
          const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (aiResponse) {
            return res.json({ response: aiResponse });
          }
        } catch (aiError) {
          console.error("Gemini API error:", aiError);
        }
      }

      // Fallback to rule-based responses if Gemini fails
      const lowerMessage = message.toLowerCase();
      let response = "";
      
      if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
        response = "Hello! I'm your AI health assistant. I can help answer general health questions about cancer, symptoms, and treatment options. How can I assist you today?";
      } else if (lowerMessage.includes("cancer") && lowerMessage.includes("symptom")) {
        response = "Common cancer symptoms can vary by type, but general warning signs include: unexplained weight loss, fatigue, fever, pain, skin changes, bowel or bladder changes, persistent cough, and unusual bleeding. If you experience persistent symptoms, please consult with your doctor for proper evaluation.";
      } else if (lowerMessage.includes("liver cancer")) {
        response = "Liver cancer symptoms may include: unintentional weight loss, loss of appetite, upper abdominal pain, nausea, general weakness, abdominal swelling, and yellowing of skin (jaundice). Risk factors include chronic hepatitis B/C infection, cirrhosis, and excessive alcohol use. Early detection through regular screening is important for those at risk.";
      } else if (lowerMessage.includes("lung cancer")) {
        response = "Lung cancer warning signs include: persistent cough, coughing up blood, shortness of breath, chest pain, hoarseness, unexplained weight loss, and recurrent respiratory infections. Smoking is the leading risk factor. If you're experiencing these symptoms, especially with a history of smoking, please see your doctor immediately.";
      } else if (lowerMessage.includes("breast cancer")) {
        response = "Breast cancer signs to watch for include: a lump in the breast or underarm, changes in breast size or shape, skin dimpling, nipple discharge, and redness or scaling. Regular self-exams and mammograms are important for early detection. If you notice any changes, consult your healthcare provider promptly.";
      } else if (lowerMessage.includes("treatment") || lowerMessage.includes("therapy")) {
        response = "Cancer treatment options depend on the type and stage, and may include: surgery, chemotherapy, radiation therapy, immunotherapy, targeted therapy, and hormone therapy. Your oncologist will recommend the best treatment plan based on your specific diagnosis. It's important to discuss all options and potential side effects with your medical team.";
      } else if (lowerMessage.includes("appointment") || lowerMessage.includes("doctor")) {
        response = "To schedule an appointment, you can use the 'Choose Your Doctor' section on your dashboard. Select a hospital and doctor, then send a request with your symptoms or concerns. The doctor will review and respond with available appointment times.";
      } else if (lowerMessage.includes("test") || lowerMessage.includes("result")) {
        response = "You can view your test results in the 'Test Results' section of your dashboard. If you have questions about specific results, I recommend discussing them with your doctor who can provide personalized interpretation and guidance.";
      } else {
        response = "I'm here to help with general health information and navigate the DoctorPath AI platform. For personalized medical advice, please consult with your healthcare provider. Is there something specific about cancer symptoms, treatments, or using this platform I can help you with?";
      }
      
      return res.json({ response });
    } catch (error) {
      console.error("Chatbot error:", error);
      return res.json({ response: "I apologize, but I encountered an error. Please try again." });
    }
  });

  // ============ File Upload Routes ============
  
  const multer = (await import("multer")).default;
  const path = (await import("path")).default;
  const fs = (await import("fs")).default;
  
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });

  const upload = multer({
    storage: fileStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".dcm"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"));
      }
    },
  });

  app.post("/api/upload", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const patient = await storage.getPatientByUserId(req.session.userId!);
      if (!patient) {
        return res.status(403).json({ success: false, message: "Patient not found" });
      }

      const caseId = req.body.caseId ? parseInt(req.body.caseId) : null;
      
      // Verify case ownership if caseId is provided
      if (caseId) {
        const patientCase = await storage.getPatientCaseById(caseId);
        if (!patientCase || patientCase.patientId !== patient.id) {
          return res.status(403).json({ success: false, message: "Cannot attach file to this case" });
        }
      }

      const fileType = path.extname(file.originalname).toLowerCase().replace(".", "");

      let extractedText: string | null = null;

      if (fileType === "pdf") {
        try {
          const { extractTextFromPDF } = await import("./services/textExtractor");
          const extraction = await extractTextFromPDF(file.path);
          if (extraction.success) {
            extractedText = extraction.text || null;
          }
        } catch (error) {
          console.error("PDF extraction error:", error);
        }
      }

      const medicalFile = await storage.createMedicalFile({
        patientId: patient.id,
        caseId,
        fileName: file.originalname,
        fileType,
        filePath: file.path,
        fileSize: file.size,
        extractedText,
        metadata: { originalName: file.originalname, mimeType: file.mimetype },
      });

      return res.json({ success: true, file: medicalFile });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ success: false, message: "Upload failed" });
    }
  });

  app.get("/api/files", requireAuth, async (req: Request, res: Response) => {
    try {
      const patient = await storage.getPatientByUserId(req.session.userId!);
      if (!patient) {
        return res.status(403).json({ success: false, message: "Patient not found" });
      }
      const files = await storage.getMedicalFilesByPatient(patient.id);
      return res.json(files);
    } catch (error) {
      console.error("Get files error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ============ Patient Search (Doctor Only) ============
  
  app.get("/api/doctor/patients/search", requireRole("doctor"), async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const results = await storage.searchPatients(query);
      const patients = results.map(({ patient, user }) => ({
        id: patient.id,
        name: user.name,
        email: user.email,
        age: patient.age,
        gender: patient.gender,
      }));

      return res.json(patients);
    } catch (error) {
      console.error("Search error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ============ Patient Cases Routes ============
  
  app.post("/api/cases", requireRole("doctor"), async (req: Request, res: Response) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.session.userId!);
      if (!doctor) {
        return res.status(403).json({ success: false, message: "Doctor not found" });
      }

      const { patientId, cancerType, stage, tumorSize, biomarkers } = req.body;
      
      const patientCase = await storage.createPatientCase({
        patientId: parseInt(patientId),
        doctorId: doctor.id,
        cancerType,
        stage,
        tumorSize,
        biomarkers,
      });

      return res.json({ success: true, case: patientCase });
    } catch (error) {
      console.error("Create case error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/cases/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patientCase = await storage.getPatientCaseById(id);
      
      if (!patientCase) {
        return res.status(404).json({ success: false, message: "Case not found" });
      }

      // Authorization: verify user has access to this case
      if (req.session.role === "patient") {
        const patient = await storage.getPatientByUserId(req.session.userId!);
        if (!patient || patient.id !== patientCase.patientId) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      } else if (req.session.role === "doctor") {
        const doctor = await storage.getDoctorByUserId(req.session.userId!);
        if (!doctor || patientCase.doctorId !== doctor.id) {
          return res.status(403).json({ success: false, message: "Access denied - not assigned to this case" });
        }
      }

      const patient = await storage.getPatientById(patientCase.patientId);
      const patientUser = patient ? await storage.getUserById(patient.userId) : null;
      const files = await storage.getMedicalFilesByCase(id);

      return res.json({
        ...patientCase,
        patientName: patientUser?.name,
        files,
      });
    } catch (error) {
      console.error("Get case error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/doctor/cases", requireRole("doctor"), async (req: Request, res: Response) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.session.userId!);
      if (!doctor) {
        return res.status(403).json({ success: false, message: "Doctor not found" });
      }

      const cases = await storage.getPatientCasesByDoctor(doctor.id);
      
      const enrichedCases = await Promise.all(
        cases.map(async (c) => {
          const patient = await storage.getPatientById(c.patientId);
          const patientUser = patient ? await storage.getUserById(patient.userId) : null;
          return {
            ...c,
            patientName: patientUser?.name,
          };
        })
      );

      return res.json(enrichedCases);
    } catch (error) {
      console.error("Get doctor cases error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ============ AI-Powered Knowledge Graph & Treatment Routes ============
  
  app.post("/api/cases/:id/generate-graph", requireRole("doctor"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patientCase = await storage.getPatientCaseById(id);
      
      if (!patientCase) {
        return res.status(404).json({ success: false, message: "Case not found" });
      }

      // Authorization: verify doctor owns this case
      const doctor = await storage.getDoctorByUserId(req.session.userId!);
      if (!doctor || patientCase.doctorId !== doctor.id) {
        return res.status(403).json({ success: false, message: "Access denied - not assigned to this case" });
      }

      const files = await storage.getMedicalFilesByCase(id);
      const extractedText = files
        .filter((f) => f.extractedText)
        .map((f) => f.extractedText)
        .join("\n\n");

      const { generateKnowledgeGraph } = await import("./services/gemini");
      const result = await generateKnowledgeGraph({
        cancerType: patientCase.cancerType || "unknown",
        stage: patientCase.stage || undefined,
        biomarkers: patientCase.biomarkers as Record<string, unknown> || {},
        extractedText: extractedText || undefined,
      });

      if (!result.success) {
        return res.status(500).json({ success: false, message: result.error });
      }

      await storage.updatePatientCase(id, {
        knowledgeGraph: result.graph,
      });

      return res.json({ success: true, graph: result.graph });
    } catch (error) {
      console.error("Generate graph error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/cases/:id/generate-treatment", requireRole("doctor"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patientCase = await storage.getPatientCaseById(id);
      
      if (!patientCase) {
        return res.status(404).json({ success: false, message: "Case not found" });
      }

      // Authorization: verify doctor owns this case
      const doctor = await storage.getDoctorByUserId(req.session.userId!);
      if (!doctor || patientCase.doctorId !== doctor.id) {
        return res.status(403).json({ success: false, message: "Access denied - not assigned to this case" });
      }

      const patient = await storage.getPatientById(patientCase.patientId);
      const medicalHistory = patient ? await storage.getMedicalHistoryByPatient(patient.id) : [];
      const historyText = medicalHistory.map((h) => `${h.condition}: ${h.treatment || "No treatment"}`).join("; ");

      const { generateTreatmentPlan } = await import("./services/gemini");
      const result = await generateTreatmentPlan({
        cancerType: patientCase.cancerType || "unknown",
        stage: patientCase.stage || undefined,
        tumorSize: patientCase.tumorSize || undefined,
        biomarkers: patientCase.biomarkers as Record<string, unknown> || {},
        medicalHistory: historyText || undefined,
        knowledgeGraph: patientCase.knowledgeGraph,
      });

      if (!result.success) {
        return res.status(500).json({ success: false, message: result.error });
      }

      await storage.updatePatientCase(id, {
        treatmentPlan: JSON.stringify(result.treatmentPlan),
      });

      return res.json({ success: true, treatmentPlan: result.treatmentPlan });
    } catch (error) {
      console.error("Generate treatment error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/cases/:id/pdf", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patientCase = await storage.getPatientCaseById(id);
      
      if (!patientCase) {
        return res.status(404).json({ success: false, message: "Case not found" });
      }

      // Authorization: verify user has access to this case
      if (req.session.role === "patient") {
        const patientUser = await storage.getPatientByUserId(req.session.userId!);
        if (!patientUser || patientUser.id !== patientCase.patientId) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      } else if (req.session.role === "doctor") {
        const doctor = await storage.getDoctorByUserId(req.session.userId!);
        if (!doctor || patientCase.doctorId !== doctor.id) {
          return res.status(403).json({ success: false, message: "Access denied - not assigned to this case" });
        }
      }

      if (!patientCase.treatmentPlan) {
        return res.status(400).json({ success: false, message: "No treatment plan generated yet" });
      }

      const patient = await storage.getPatientById(patientCase.patientId);
      const patientUser = patient ? await storage.getUserById(patient.userId) : null;
      const doctor = patientCase.doctorId ? await storage.getDoctorById(patientCase.doctorId) : null;
      const doctorUser = doctor ? await storage.getUserById(doctor.userId) : null;

      let treatmentPlanData;
      try {
        treatmentPlanData = JSON.parse(patientCase.treatmentPlan);
      } catch {
        treatmentPlanData = {
          summary: patientCase.treatmentPlan,
          primaryRecommendation: "See summary",
          alternativeOptions: [],
          considerations: [],
          followUp: [],
          references: [],
        };
      }

      const { generateTreatmentPlanPDF } = await import("./services/pdfGenerator");
      const pdfBuffer = await generateTreatmentPlanPDF({
        patientName: patientUser?.name || "Unknown Patient",
        caseId: patientCase.id,
        cancerType: patientCase.cancerType || "Unknown",
        stage: patientCase.stage || undefined,
        tumorSize: patientCase.tumorSize || undefined,
        treatmentPlan: treatmentPlanData,
        generatedAt: new Date(),
        doctorName: doctorUser?.name,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=treatment-plan-${id}.pdf`);
      return res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      return res.status(500).json({ success: false, message: "PDF generation failed" });
    }
  });

  app.post("/api/extract-entities", requireRole("doctor"), async (req: Request, res: Response) => {
    try {
      const { text, fileId } = req.body;
      
      let textToProcess = text;
      
      if (fileId && !text) {
        const file = await storage.getMedicalFileById(parseInt(fileId));
        if (!file || !file.extractedText) {
          return res.status(400).json({ success: false, message: "No text available for this file" });
        }
        textToProcess = file.extractedText;
      }

      if (!textToProcess) {
        return res.status(400).json({ success: false, message: "No text provided" });
      }

      const { extractMedicalEntities } = await import("./services/gemini");
      const result = await extractMedicalEntities(textToProcess);

      if (!result.success) {
        return res.status(500).json({ success: false, message: result.error });
      }

      return res.json({ success: true, entities: result.entities });
    } catch (error) {
      console.error("Entity extraction error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // ============ Seed Data ============
  
  // Seed hospitals if none exist
  app.get("/api/seed/hospitals", async (req: Request, res: Response) => {
    try {
      const existing = await storage.getAllHospitals();
      if (existing.length > 0) {
        return res.json({ message: "Hospitals already seeded", hospitals: existing });
      }

      const hospitalsData = [
        { name: "Shaukat Khanum Memorial Cancer Hospital", branchCode: "SKMCH-LHR", city: "Lahore", address: "7-A Block R-3, Johar Town", phone: "+92-42-35905000" },
        { name: "Aga Khan University Hospital", branchCode: "AKUH-KHI", city: "Karachi", address: "Stadium Road", phone: "+92-21-111-911-911" },
        { name: "Shifa International Hospital", branchCode: "SHIFA-ISB", city: "Islamabad", address: "Pitras Bukhari Road, H-8/4", phone: "+92-51-8464646" },
        { name: "Liaquat National Hospital", branchCode: "LNH-KHI", city: "Karachi", address: "Stadium Road", phone: "+92-21-111-456-456" },
        { name: "CMH Rawalpindi", branchCode: "CMH-RWP", city: "Rawalpindi", address: "CMH Road, Rawalpindi", phone: "+92-51-9270610" },
      ];

      const created = await Promise.all(
        hospitalsData.map(h => storage.createHospital(h))
      );

      return res.json({ message: "Hospitals seeded successfully", hospitals: created });
    } catch (error) {
      console.error("Seed error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
}
