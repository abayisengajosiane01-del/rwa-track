import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

async function main() {
  console.log("[v0] Starting database seed...");

  try {
    // Clear existing data
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.residenceRequest.deleteMany({});
    await prisma.fraudAlert.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("[v0] Cleared existing data");

    // Create Admin User
    const adminPassword = await hashPassword("password123");
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@rwatrack.com",
        password: adminPassword,
        firstName: "Admin",
        lastName: "User",
        phone: "+1-555-0001",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log("[v0] Created admin user:", adminUser.email);

    // Create HR User
    const hrPassword = await hashPassword("password123");
    const hrUser = await prisma.user.create({
      data: {
        email: "hr@rwatrack.com",
        password: hrPassword,
        firstName: "HR",
        lastName: "Officer",
        phone: "+1-555-0002",
        role: "HR",
        status: "ACTIVE",
      },
    });
    console.log("[v0] Created HR user:", hrUser.email);

    // Create Employee Users
    const empPassword = await hashPassword("password123");
    const employees = [];

    const emp1 = await prisma.user.create({
      data: {
        email: "employee1@rwatrack.com",
        password: empPassword,
        firstName: "John",
        lastName: "Doe",
        phone: "+1-555-0010",
        role: "EMPLOYEE",
        status: "ACTIVE",
      },
    });
    employees.push(emp1);

    const emp2 = await prisma.user.create({
      data: {
        email: "employee2@rwatrack.com",
        password: empPassword,
        firstName: "Jane",
        lastName: "Smith",
        phone: "+1-555-0011",
        role: "EMPLOYEE",
        status: "ACTIVE",
      },
    });
    employees.push(emp2);

    const emp3 = await prisma.user.create({
      data: {
        email: "employee3@rwatrack.com",
        password: empPassword,
        firstName: "Robert",
        lastName: "Johnson",
        phone: "+1-555-0012",
        role: "EMPLOYEE",
        status: "ACTIVE",
      },
    });
    employees.push(emp3);

    console.log("[v0] Created 3 employee users");

    // Create Employee Records
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      await prisma.employee.create({
        data: {
          userId: emp.id,
          employeeId: `EMP-${String(i + 1001).padStart(5, "0")}`,
          department: ["Engineering", "HR", "Finance"][i],
          position: ["Senior Developer", "HR Manager", "Financial Analyst"][i],
          dateOfJoining: new Date(2022, 0, 1),
          salary: 80000 + i * 5000,
          currentAddress: `${100 + i} Main St, City, State`,
          permanentAddr: `${200 + i} Oak Ave, Town, State`,
          emergencyContact: `Emergency Contact ${i + 1}`,
        },
      });
    }

    console.log("[v0] Created 3 employee records");

    // Create Fraud Alerts
    await prisma.fraudAlert.create({
      data: {
        description: "Suspicious login from new location",
        severity: "HIGH",
        status: "OPEN",
      },
    });

    await prisma.fraudAlert.create({
      data: {
        description: "Multiple failed login attempts",
        severity: "MEDIUM",
        status: "INVESTIGATING",
      },
    });

    console.log("[v0] Created fraud alerts");

    // Create Sample Residence Request
    const empData = await prisma.employee.findFirst();
    if (empData) {
      await prisma.residenceRequest.create({
        data: {
          employeeId: empData.id,
          submittedBy: employees[0].id,
          newAddress: "500 Maple Drive, New City, State",
          moveDate: new Date(2024, 5, 1),
          reason: "Relocating for better commute",
          status: "PENDING",
        },
      });
      console.log("[v0] Created sample residence request");
    }

    console.log("[v0] Database seed completed successfully!");
    console.log("");
    console.log("Demo Credentials:");
    console.log("Admin: admin@rwatrack.com / password123");
    console.log("HR: hr@rwatrack.com / password123");
    console.log("Employee: employee1@rwatrack.com / password123");
  } catch (error) {
    console.error("[v0] Seed error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
