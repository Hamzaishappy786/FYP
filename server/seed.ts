import { db } from "./db";
import { users, patients, doctors, hospitals, departments } from "@shared/schema";
import bcrypt from "bcrypt";

const pakistaniHospitals = [
  { name: "Shaukat Khanum Memorial Cancer Hospital", branchCode: "SKMCH-LHR", city: "Lahore", address: "7A Block R-3, M.A. Johar Town", phone: "+92-42-35905000" },
  { name: "Aga Khan University Hospital", branchCode: "AKUH-KHI", city: "Karachi", address: "Stadium Road, P.O. Box 3500", phone: "+92-21-111-911-911" },
  { name: "Shifa International Hospital", branchCode: "SHIFA-ISB", city: "Islamabad", address: "Sector H-8/4", phone: "+92-51-846-4646" },
  { name: "Pakistan Institute of Medical Sciences (PIMS)", branchCode: "PIMS-ISB", city: "Islamabad", address: "G-8/3, Islamabad", phone: "+92-51-9261170" },
  { name: "Jinnah Postgraduate Medical Centre (JPMC)", branchCode: "JPMC-KHI", city: "Karachi", address: "Rafiqui Shaheed Road", phone: "+92-21-99201300" },
  { name: "Combined Military Hospital (CMH)", branchCode: "CMH-RWP", city: "Rawalpindi", address: "The Mall Road", phone: "+92-51-9270614" },
  { name: "Liaquat National Hospital", branchCode: "LNH-KHI", city: "Karachi", address: "Stadium Road", phone: "+92-21-111-456-456" },
  { name: "Services Hospital", branchCode: "SHL-LHR", city: "Lahore", address: "Jail Road", phone: "+92-42-99203402" },
  { name: "Lady Reading Hospital", branchCode: "LRH-PSH", city: "Peshawar", address: "Hospital Road", phone: "+92-91-9211430" },
  { name: "Indus Hospital", branchCode: "IH-KHI", city: "Karachi", address: "Plot C-76, Sector 31/5, Korangi Crossing", phone: "+92-21-111-111-880" },
];

const doctorsData = [
  { name: "Dr. Ali Raza", email: "ali.raza@skmch.org", specialization: "Liver Specialist", hospitalIndex: 0 },
  { name: "Dr. Ayesha Khan", email: "ayesha.khan@akuh.org", specialization: "Lung Specialist", hospitalIndex: 1 },
  { name: "Dr. Bilal Ahmed", email: "bilal.ahmed@shifa.com", specialization: "Oncologist", hospitalIndex: 2 },
  { name: "Dr. Zainab Malik", email: "zainab.malik@pims.gov.pk", specialization: "Oncologist", hospitalIndex: 3 },
  { name: "Dr. Usman Tariq", email: "usman.tariq@jpmc.edu.pk", specialization: "Oncologist", hospitalIndex: 4 },
  { name: "Dr. Fatima Yusuf", email: "fatima.yusuf@cmh.com", specialization: "Oncologist", hospitalIndex: 5 },
  { name: "Dr. Hamza Farooq", email: "hamza.farooq@lnh.org.pk", specialization: "Oncologist", hospitalIndex: 6 },
  { name: "Dr. Sana Mir", email: "sana.mir@services.gov.pk", specialization: "Oncologist", hospitalIndex: 7 },
  { name: "Dr. Taimoor Hassan", email: "taimoor.hassan@lrh.gov.pk", specialization: "Oncologist", hospitalIndex: 8 },
  { name: "Dr. Hira Javed", email: "hira.javed@indushospital.org.pk", specialization: "Oncologist", hospitalIndex: 9 },
];

const samplePatient = {
  name: "Muhammad Ahmed",
  email: "ahmed.muhammad@example.com",
  phone: "+92-300-1234567",
  age: 45,
  gender: "Male",
  address: "House 123, Block A, Gulberg III, Lahore",
  bloodGroup: "O+",
};

export async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    const existingHospitals = await db.select().from(hospitals);
    if (existingHospitals.length > 0) {
      console.log("Database already seeded. Skipping...");
      return;
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    console.log("Creating hospitals...");
    const createdHospitals = await db.insert(hospitals).values(pakistaniHospitals).returning();
    console.log(`Created ${createdHospitals.length} hospitals`);

    console.log("Creating oncology departments...");
    const deptValues = createdHospitals.map(h => ({
      hospitalId: h.id,
      name: "Oncology",
      description: "Cancer treatment and care department",
    }));
    await db.insert(departments).values(deptValues);
    console.log(`Created ${deptValues.length} departments`);

    console.log("Creating doctors...");
    const createdDepartments = await db.select().from(departments);
    for (const doctorData of doctorsData) {
      const [user] = await db.insert(users).values({
        name: doctorData.name,
        email: doctorData.email,
        password: hashedPassword,
        role: "doctor",
        phone: "+92-300-0000000",
      }).returning();

      const hospitalDept = createdDepartments.find(
        d => d.hospitalId === createdHospitals[doctorData.hospitalIndex].id
      );

      await db.insert(doctors).values({
        userId: user.id,
        specialization: doctorData.specialization,
        experience: "10+ years",
        qualifications: "MBBS, FCPS (Oncology)",
        hospitalId: createdHospitals[doctorData.hospitalIndex].id,
        departmentId: hospitalDept?.id,
      });
    }
    console.log(`Created ${doctorsData.length} doctors`);

    console.log("Creating sample patient...");
    const [patientUser] = await db.insert(users).values({
      name: samplePatient.name,
      email: samplePatient.email,
      password: hashedPassword,
      role: "patient",
      phone: samplePatient.phone,
    }).returning();

    await db.insert(patients).values({
      userId: patientUser.id,
      age: samplePatient.age,
      gender: samplePatient.gender,
      address: samplePatient.address,
      bloodGroup: samplePatient.bloodGroup,
    });
    console.log("Created sample patient: Muhammad Ahmed");

    console.log("Database seeding completed successfully!");
    console.log("\nTest Credentials:");
    console.log("Patient: ahmed.muhammad@example.com / password123");
    console.log("Doctor: ali.raza@skmch.org / password123");
  } catch (error) {
    console.error("Seeding error:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
