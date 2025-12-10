import { db } from "./db";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import {
  users, patients, doctors, hospitals, departments, appointments,
  testResults, medicalHistory, doctorRequests, patientCases, medicalFiles,
  InsertUser, User, InsertPatient, Patient, InsertDoctor, Doctor,
  InsertHospital, Hospital, InsertDepartment, Department, InsertAppointment, Appointment,
  InsertTestResult, TestResult, InsertMedicalHistory, MedicalHistory,
  InsertDoctorRequest, DoctorRequest, InsertPatientCase, PatientCase,
  InsertMedicalFile, MedicalFile,
} from "@shared/schema";

export interface IStorage {
  // Users
  createUser(data: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: number): Promise<User | null>;

  // Patients
  createPatient(data: InsertPatient): Promise<Patient>;
  getPatientById(id: number): Promise<Patient | null>;
  getPatientByUserId(userId: number): Promise<Patient | null>;
  updatePatient(id: number, data: Partial<InsertPatient>): Promise<Patient | null>;

  // Doctors
  createDoctor(data: InsertDoctor): Promise<Doctor>;
  getDoctorById(id: number): Promise<Doctor | null>;
  getDoctorByUserId(userId: number): Promise<Doctor | null>;
  getDoctorsByHospital(hospitalId: number): Promise<Doctor[]>;
  getDoctorsByDepartment(departmentId: number): Promise<Doctor[]>;
  updateDoctor(id: number, data: Partial<InsertDoctor>): Promise<Doctor | null>;

  // Hospitals
  createHospital(data: InsertHospital): Promise<Hospital>;
  getHospitalById(id: number): Promise<Hospital | null>;
  getAllHospitals(): Promise<Hospital[]>;

  // Departments
  createDepartment(data: InsertDepartment): Promise<Department>;
  getDepartmentsByHospital(hospitalId: number): Promise<Department[]>;

  // Doctor Requests
  createDoctorRequest(data: InsertDoctorRequest): Promise<DoctorRequest>;
  getDoctorRequestById(id: number): Promise<DoctorRequest | null>;
  getDoctorRequestsByPatient(patientId: number): Promise<DoctorRequest[]>;
  getDoctorRequestsByDoctor(doctorId: number): Promise<DoctorRequest[]>;
  updateDoctorRequest(id: number, data: Partial<DoctorRequest>): Promise<DoctorRequest | null>;

  // Appointments
  createAppointment(data: InsertAppointment): Promise<Appointment>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;

  // Test Results
  createTestResult(data: InsertTestResult): Promise<TestResult>;
  getTestResultsByPatient(patientId: number): Promise<TestResult[]>;

  // Medical History
  createMedicalHistory(data: InsertMedicalHistory): Promise<MedicalHistory>;
  getMedicalHistoryByPatient(patientId: number): Promise<MedicalHistory[]>;

  // Patient Cases
  createPatientCase(data: InsertPatientCase): Promise<PatientCase>;
  getPatientCasesByDoctor(doctorId: number): Promise<PatientCase[]>;
  getPatientCaseById(id: number): Promise<PatientCase | null>;
  getPatientCasesByPatient(patientId: number): Promise<PatientCase[]>;
  updatePatientCase(id: number, data: Partial<InsertPatientCase>): Promise<PatientCase | null>;

  // Medical Files
  createMedicalFile(data: InsertMedicalFile): Promise<MedicalFile>;
  getMedicalFileById(id: number): Promise<MedicalFile | null>;
  getMedicalFilesByPatient(patientId: number): Promise<MedicalFile[]>;
  getMedicalFilesByCase(caseId: number): Promise<MedicalFile[]>;
  updateMedicalFile(id: number, data: Partial<InsertMedicalFile>): Promise<MedicalFile | null>;

  // Search
  searchPatients(query: string): Promise<{ patient: Patient; user: User }[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  // Patients
  async createPatient(data: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(data).returning();
    return patient;
  }

  async getPatientById(id: number): Promise<Patient | null> {
    const result = await db.select().from(patients).where(eq(patients.id, id));
    return result[0] || null;
  }

  async getPatientByUserId(userId: number): Promise<Patient | null> {
    const result = await db.select().from(patients).where(eq(patients.userId, userId));
    return result[0] || null;
  }

  async updatePatient(id: number, data: Partial<InsertPatient>): Promise<Patient | null> {
    const [patient] = await db.update(patients).set(data).where(eq(patients.id, id)).returning();
    return patient || null;
  }

  // Doctors
  async createDoctor(data: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values(data).returning();
    return doctor;
  }

  async getDoctorById(id: number): Promise<Doctor | null> {
    const result = await db.select().from(doctors).where(eq(doctors.id, id));
    return result[0] || null;
  }

  async getDoctorByUserId(userId: number): Promise<Doctor | null> {
    const result = await db.select().from(doctors).where(eq(doctors.userId, userId));
    return result[0] || null;
  }

  async getDoctorsByHospital(hospitalId: number): Promise<Doctor[]> {
    const result = await db.select().from(doctors).where(eq(doctors.hospitalId, hospitalId));
    return result;
  }

  async getDoctorsByDepartment(departmentId: number): Promise<Doctor[]> {
    const result = await db.select().from(doctors).where(eq(doctors.departmentId, departmentId));
    return result;
  }

  async updateDoctor(id: number, data: Partial<InsertDoctor>): Promise<Doctor | null> {
    const [doctor] = await db.update(doctors).set(data).where(eq(doctors.id, id)).returning();
    return doctor || null;
  }

  // Hospitals
  async createHospital(data: InsertHospital): Promise<Hospital> {
    const [hospital] = await db.insert(hospitals).values(data).returning();
    return hospital;
  }

  async getHospitalById(id: number): Promise<Hospital | null> {
    const result = await db.select().from(hospitals).where(eq(hospitals.id, id));
    return result[0] || null;
  }

  async getAllHospitals(): Promise<Hospital[]> {
    return await db.select().from(hospitals);
  }

  // Departments
  async createDepartment(data: InsertDepartment): Promise<Department> {
    const [department] = await db.insert(departments).values(data).returning();
    return department;
  }

  async getDepartmentsByHospital(hospitalId: number): Promise<Department[]> {
    return await db.select().from(departments).where(eq(departments.hospitalId, hospitalId));
  }

  // Doctor Requests
  async createDoctorRequest(data: InsertDoctorRequest): Promise<DoctorRequest> {
    const [request] = await db.insert(doctorRequests).values(data).returning();
    return request;
  }

  async getDoctorRequestById(id: number): Promise<DoctorRequest | null> {
    const result = await db.select().from(doctorRequests).where(eq(doctorRequests.id, id));
    return result[0] || null;
  }

  async getDoctorRequestsByPatient(patientId: number): Promise<DoctorRequest[]> {
    return await db.select().from(doctorRequests)
      .where(eq(doctorRequests.patientId, patientId))
      .orderBy(desc(doctorRequests.createdAt));
  }

  async getDoctorRequestsByDoctor(doctorId: number): Promise<DoctorRequest[]> {
    return await db.select().from(doctorRequests)
      .where(eq(doctorRequests.doctorId, doctorId))
      .orderBy(desc(doctorRequests.createdAt));
  }

  async updateDoctorRequest(id: number, data: Partial<DoctorRequest>): Promise<DoctorRequest | null> {
    const [request] = await db.update(doctorRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(doctorRequests.id, id))
      .returning();
    return request || null;
  }

  // Appointments
  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(data).returning();
    return appointment;
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.date));
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.doctorId, doctorId))
      .orderBy(desc(appointments.date));
  }

  // Test Results
  async createTestResult(data: InsertTestResult): Promise<TestResult> {
    const [result] = await db.insert(testResults).values(data).returning();
    return result;
  }

  async getTestResultsByPatient(patientId: number): Promise<TestResult[]> {
    return await db.select().from(testResults)
      .where(eq(testResults.patientId, patientId))
      .orderBy(desc(testResults.testDate));
  }

  // Medical History
  async createMedicalHistory(data: InsertMedicalHistory): Promise<MedicalHistory> {
    const [history] = await db.insert(medicalHistory).values(data).returning();
    return history;
  }

  async getMedicalHistoryByPatient(patientId: number): Promise<MedicalHistory[]> {
    return await db.select().from(medicalHistory)
      .where(eq(medicalHistory.patientId, patientId))
      .orderBy(desc(medicalHistory.createdAt));
  }

  // Patient Cases
  async createPatientCase(data: InsertPatientCase): Promise<PatientCase> {
    const [patientCase] = await db.insert(patientCases).values(data).returning();
    return patientCase;
  }

  async getPatientCasesByDoctor(doctorId: number): Promise<PatientCase[]> {
    return await db.select().from(patientCases)
      .where(eq(patientCases.doctorId, doctorId))
      .orderBy(desc(patientCases.createdAt));
  }

  async getPatientCaseById(id: number): Promise<PatientCase | null> {
    const result = await db.select().from(patientCases).where(eq(patientCases.id, id));
    return result[0] || null;
  }

  async getPatientCasesByPatient(patientId: number): Promise<PatientCase[]> {
    return await db.select().from(patientCases)
      .where(eq(patientCases.patientId, patientId))
      .orderBy(desc(patientCases.createdAt));
  }

  async updatePatientCase(id: number, data: Partial<InsertPatientCase>): Promise<PatientCase | null> {
    const [patientCase] = await db.update(patientCases)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(patientCases.id, id))
      .returning();
    return patientCase || null;
  }

  // Medical Files
  async createMedicalFile(data: InsertMedicalFile): Promise<MedicalFile> {
    const [file] = await db.insert(medicalFiles).values(data).returning();
    return file;
  }

  async getMedicalFileById(id: number): Promise<MedicalFile | null> {
    const result = await db.select().from(medicalFiles).where(eq(medicalFiles.id, id));
    return result[0] || null;
  }

  async getMedicalFilesByPatient(patientId: number): Promise<MedicalFile[]> {
    return await db.select().from(medicalFiles)
      .where(eq(medicalFiles.patientId, patientId))
      .orderBy(desc(medicalFiles.createdAt));
  }

  async getMedicalFilesByCase(caseId: number): Promise<MedicalFile[]> {
    return await db.select().from(medicalFiles)
      .where(eq(medicalFiles.caseId, caseId))
      .orderBy(desc(medicalFiles.createdAt));
  }

  async updateMedicalFile(id: number, data: Partial<InsertMedicalFile>): Promise<MedicalFile | null> {
    const [file] = await db.update(medicalFiles).set(data).where(eq(medicalFiles.id, id)).returning();
    return file || null;
  }

  // Search
  async searchPatients(query: string): Promise<{ patient: Patient; user: User }[]> {
    const results = await db
      .select({ patient: patients, user: users })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.email, `%${query}%`)
        )
      );
    return results;
  }
}

export const storage = new DatabaseStorage();
