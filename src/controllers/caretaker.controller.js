import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

/**
 * CARETAKER BUSINESS OPERATION:
 * ONBOARD TENANT
 * 
 * Creates:
 * - User
 * - Tenant profile
 * - Lease
 * - Updates Unit status
 */
export const onboardTenant = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      nationalId,
      emergencyContact,
      unitId,
      startDate,
      depositAmount,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !unitId ||
      !startDate ||
      !depositAmount
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Check unit availability
      const unit = await tx.unit.findUnique({
        where: { id: unitId },
      });

      if (!unit) {
        throw new Error("Unit not found");
      }

      if (unit.status === "OCCUPIED") {
        throw new Error("Unit already occupied");
      }

      // 2️⃣ Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "TENANT",
          isActive: true,
        },
      });

      // 3️⃣ Create tenant profile
      const tenant = await tx.tenant.create({
        data: {
          userId: user.id,
          phone,
          nationalId,
          emergencyContact,
        },
      });

      // 4️⃣ Create lease
      await tx.lease.create({
        data: {
          tenantId: tenant.id,
          unitId,
          startDate: new Date(startDate),
          depositAmount: parseFloat(depositAmount),
          depositPaid: true,
          status: "ACTIVE",
        },
      });

      // 5️⃣ Mark unit as occupied
      await tx.unit.update({
        where: { id: unitId },
        data: { status: "OCCUPIED" },
      });

      return tenant;
    });

    return res.status(201).json({
      message: "Tenant onboarded successfully",
      tenant: result,
    });

  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: error.message || "Failed to onboard tenant",
    });
  }
};
