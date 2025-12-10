import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (both patients and doctors)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'patient' or 'doctor'
  phone: text("phone"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Patients table (extends users)
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  age: integer("age"),
  gender: text("gender"),
  address: text("address"),
  bloodGroup: text("blood_group"),
});

// Doctors table (extends users)
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specialization: text("specialization"),
  experience: text("experience"),
  qualifications: text("qualifications"),
  hospitalId: integer("hospital_id").references(() => hospitals.id),
  departmentId: integer("department_id").references(() => departments.id),
});

// Hospitals table
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  branchCode: text("branch_code").notNull().unique(),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
});

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id").notNull().references(() => hospitals.id),
  name: text("name").notNull(),
  description: text("description"),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").notNull().references(() => doctors.id),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Test Results table
export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  testName: text("test_name").notNull(),
  testDate: timestamp("test_date").notNull(),
  result: text("result"),
  status: text("status").default("pending"), // pending, completed
  values: jsonb("values"), // Flexible JSON for different test types
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Medical History table
export const medicalHistory = pgTable("medical_history", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  condition: text("condition").notNull(),
  diagnosisDate: timestamp("diagnosis_date"),
  treatment: text("treatment"),
  status: text("status"), // active, resolved
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Doctor Requests table (patient requests to connect with doctor)
export const doctorRequests = pgTable("doctor_requests", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").notNull().references(() => doctors.id),
  hospitalId: integer("hospital_id").references(() => hospitals.id),
  status: text("status").notNull().default("pending"), // pending, accepted, declined, reschedule
  note: text("note"),
  scheduleNote: text("schedule_note"),
  proposedSlot: text("proposed_slot"),
  dataShare: jsonb("data_share"), // Contains file info if patient shared data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Patient Cases table (for knowledge graph and treatment recommendations)
export const patientCases = pgTable("patient_cases", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").references(() => doctors.id),
  cancerType: text("cancer_type"),
  stage: text("stage"),
  tumorSize: text("tumor_size"),
  biomarkers: jsonb("biomarkers"),
  diagnosisData: jsonb("diagnosis_data"),
  treatmentPlan: text("treatment_plan"),
  knowledgeGraph: jsonb("knowledge_graph"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Medical Files table (for uploaded PDFs, images, DICOM)
export const medicalFiles = pgTable("medical_files", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  caseId: integer("case_id").references(() => patientCases.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  extractedText: text("extracted_text"),
  embeddings: jsonb("embeddings"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  patient: one(patients, {
    fields: [users.id],
    references: [patients.userId],
  }),
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
  testResults: many(testResults),
  medicalHistory: many(medicalHistory),
  doctorRequests: many(doctorRequests),
  patientCases: many(patientCases),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  hospital: one(hospitals, {
    fields: [doctors.hospitalId],
    references: [hospitals.id],
  }),
  department: one(departments, {
    fields: [doctors.departmentId],
    references: [departments.id],
  }),
  appointments: many(appointments),
  doctorRequests: many(doctorRequests),
  patientCases: many(patientCases),
}));

export const hospitalsRelations = relations(hospitals, ({ many }) => ({
  doctors: many(doctors),
  departments: many(departments),
}));

export const departmentsRelations = relations(departments, ({ one }) => ({
  hospital: one(hospitals, {
    fields: [departments.hospitalId],
    references: [hospitals.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
}));

export const testResultsRelations = relations(testResults, ({ one }) => ({
  patient: one(patients, {
    fields: [testResults.patientId],
    references: [patients.id],
  }),
}));

export const medicalHistoryRelations = relations(medicalHistory, ({ one }) => ({
  patient: one(patients, {
    fields: [medicalHistory.patientId],
    references: [patients.id],
  }),
}));

export const doctorRequestsRelations = relations(doctorRequests, ({ one }) => ({
  patient: one(patients, {
    fields: [doctorRequests.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [doctorRequests.doctorId],
    references: [doctors.id],
  }),
  hospital: one(hospitals, {
    fields: [doctorRequests.hospitalId],
    references: [hospitals.id],
  }),
}));

export const patientCasesRelations = relations(patientCases, ({ one, many }) => ({
  patient: one(patients, {
    fields: [patientCases.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [patientCases.doctorId],
    references: [doctors.id],
  }),
  medicalFiles: many(medicalFiles),
}));

export const medicalFilesRelations = relations(medicalFiles, ({ one }) => ({
  patient: one(patients, {
    fields: [medicalFiles.patientId],
    references: [patients.id],
  }),
  case: one(patientCases, {
    fields: [medicalFiles.caseId],
    references: [patientCases.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true });
export const insertHospitalSchema = createInsertSchema(hospitals).omit({ id: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertTestResultSchema = createInsertSchema(testResults).omit({ id: true, createdAt: true });
export const insertMedicalHistorySchema = createInsertSchema(medicalHistory).omit({ id: true, createdAt: true });
export const insertDoctorRequestSchema = createInsertSchema(doctorRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPatientCaseSchema = createInsertSchema(patientCases).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMedicalFileSchema = createInsertSchema(medicalFiles).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitals.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResults.$inferSelect;
export type InsertMedicalHistory = z.infer<typeof insertMedicalHistorySchema>;
export type MedicalHistory = typeof medicalHistory.$inferSelect;
export type InsertDoctorRequest = z.infer<typeof insertDoctorRequestSchema>;
export type DoctorRequest = typeof doctorRequests.$inferSelect;
export type InsertPatientCase = z.infer<typeof insertPatientCaseSchema>;
export type PatientCase = typeof patientCases.$inferSelect;
export type InsertMedicalFile = z.infer<typeof insertMedicalFileSchema>;
export type MedicalFile = typeof medicalFiles.$inferSelect;

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Signup schemas
export const signupPatientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  age: z.number().min(1).max(150).optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
});

export const signupDoctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.string().optional(),
  qualifications: z.string().optional(),
  hospitalId: z.number().optional(),
});

export type SignupPatientInput = z.infer<typeof signupPatientSchema>;
export type SignupDoctorInput = z.infer<typeof signupDoctorSchema>;

// Diagnosis schema
export const diagnosisSchema = z.object({
  cancerType: z.enum(["liver", "lung", "breast"]),
  tumorSize: z.number().positive(),
  biomarker1: z.number(),
  biomarker2: z.string().optional().nullable(),
  additionalFactor: z.string().optional().nullable(),
});

export type DiagnosisInput = z.infer<typeof diagnosisSchema>;
