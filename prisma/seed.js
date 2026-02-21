import prisma from "../src/config/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding large dataset...");

  // ============================
  // CLEAR DATABASE
  // ============================
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.caretaker.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.user.deleteMany();

  // ============================
  // 1️⃣ CREATE CARETAKER
  // ============================
  const caretakerPassword = await bcrypt.hash("caretaker123", 10);

  const caretakerUser = await prisma.user.create({
    data: {
      name: "James Njoroge",
      email: "caretaker@apartments.com",
      password: caretakerPassword,
      role: "CARETAKER",
      isActive: true,
    },
  });

  await prisma.caretaker.create({
    data: {
      userId: caretakerUser.id,
      phone: "0700000000",
      assignedArea: "All Blocks",
    },
  });

  console.log("✔ Caretaker created");

  // ============================
  // 2️⃣ CREATE 250 UNITS
  // ============================

  const blocks = [
    { name: "Block A", description: "Single Room", rent: 6000 },
    { name: "Block B", description: "Bedsitter", rent: 8000 },
    { name: "Block C", description: "Studio", rent: 12000 },
    { name: "Block D", description: "1 Bedroom", rent: 16000 },
    { name: "Block E", description: "2 Bedroom", rent: 22000 },
  ];

  for (const block of blocks) {
    for (let i = 1; i <= 50; i++) {
      await prisma.unit.create({
        data: {
          building: block.name,
          unitNumber: `${block.name.split(" ")[1]}${String(i).padStart(3, "0")}`,
          description: block.description,
          rentAmount: block.rent,
        },
      });
    }
  }

  console.log("✔ 250 Units created");

  const allUnits = await prisma.unit.findMany({
    orderBy: { building: "asc" },
  });

  // ============================
  // 3️⃣ CREATE 150 TENANTS
  // ============================

  const firstNames = [
    "Brian", "Kevin", "David", "Daniel", "Victor", "Mark",
    "Samuel", "Joseph", "Peter", "Paul", "Dennis", "Michael",
    "Grace", "Faith", "Mary", "Jane", "Lucy", "Esther",
    "Naomi", "Wanjiku", "Achieng", "Chebet", "Mercy", "Caroline"
  ];

  const lastNames = [
    "Mwangi", "Otieno", "Njoroge", "Wanjiku", "Omondi",
    "Kariuki", "Mutua", "Maina", "Kamau", "Kiptoo",
    "Cheruiyot", "Odhiambo", "Kimani", "Muthoni"
  ];

  for (let i = 0; i < 150; i++) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];

    const fullName = `${first} ${last}`;
    const email = `${first.toLowerCase()}${i}@mail.com`;

    const hashedPassword = await bcrypt.hash("tenant123", 10);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: "TENANT",
        isActive: true,
      },
    });

    const tenant = await prisma.tenant.create({
      data: {
        userId: user.id,
        phone: `07${Math.floor(10000000 + Math.random() * 89999999)}`,
        nationalId: `${Math.floor(20000000 + Math.random() * 20000000)}`,
        emergencyContact: "Parent 0700000000",
      },
    });

    const unit = allUnits[i]; // First 150 units occupied

    await prisma.lease.create({
      data: {
        tenantId: tenant.id,
        unitId: unit.id,
        startDate: new Date("2026-01-01"),
        depositAmount: unit.rentAmount,
        depositPaid: true,
        status: "ACTIVE",
      },
    });

    await prisma.unit.update({
      where: { id: unit.id },
      data: { status: "OCCUPIED" },
    });
  }

  console.log("✔ 150 Tenants created and assigned");
  console.log("✔ Remaining 100 units left AVAILABLE");

  console.log("✅ Large dataset seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {        
    await prisma.$disconnect();
  });
