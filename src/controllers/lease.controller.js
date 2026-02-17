import prisma from "../config/prisma.js";

/**
 * CREATE LEASE
 * Assign tenant to unit
 */
export const createLease = async (req, res) => {
  try {
    const { tenantId, unitId, startDate, depositAmount } = req.body;

    if (!tenantId || !unitId || !startDate || !depositAmount) {
      return res.status(400).json({
        message: "tenantId, unitId, startDate and depositAmount are required",
      });
    }

    // Use transaction for safety
    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Check if unit already occupied
      const existingActiveLeaseForUnit = await tx.lease.findFirst({
        where: {
          unitId,
          status: "ACTIVE",
        },
      });

      if (existingActiveLeaseForUnit) {
        throw new Error("Unit is already occupied");
      }

      // 2️⃣ Check if tenant already has active lease
      const existingActiveLeaseForTenant = await tx.lease.findFirst({
        where: {
          tenantId,
          status: "ACTIVE",
        },
      });

      if (existingActiveLeaseForTenant) {
        throw new Error("Tenant already has an active lease");
      }

      // 3️⃣ Create Lease
      const lease = await tx.lease.create({
        data: {
          tenantId,
          unitId,
          startDate: new Date(startDate),
          depositAmount: parseFloat(depositAmount),
          depositPaid: true,
          status: "ACTIVE",
        },
      });

      // 4️⃣ Update unit status
      await tx.unit.update({
        where: { id: unitId },
        data: {
          status: "OCCUPIED",
        },
      });

      return lease;
    });

    return res.status(201).json({
      message: "Lease created successfully",
      lease: result,
    });

  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: error.message || "Failed to create lease",
    });
  }
};


/**
 * TERMINATE LEASE (Tenant moves out)
 */
export const terminateLease = async (req, res) => {
  try {
    const { id } = req.params;

    const lease = await prisma.lease.findUnique({
      where: { id },
    });

    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    if (lease.status === "TERMINATED") {
      return res.status(400).json({ message: "Lease already terminated" });
    }

    await prisma.$transaction(async (tx) => {

      // 1️⃣ Update lease
      await tx.lease.update({
        where: { id },
        data: {
          status: "TERMINATED",
          endDate: new Date(),
        },
      });

      // 2️⃣ Free the unit
      await tx.unit.update({
        where: { id: lease.unitId },
        data: {
          status: "AVAILABLE",
        },
      });
    });

    return res.json({
      message: "Lease terminated successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to terminate lease",
    });
  }
};


/**
 * GET ALL ACTIVE LEASES
 */
export const getActiveLeases = async (req, res) => {
  try {
    const leases = await prisma.lease.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        tenant: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        unit: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(leases);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch active leases",
    });
  }
};


/**
 * GET TENANT LEASE HISTORY
 */
export const getTenantLeases = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const leases = await prisma.lease.findMany({
      where: {
        tenantId,
      },
      include: {
        unit: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(leases);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch tenant leases",
    });
  }
};


/**
 * GET UNIT LEASE HISTORY
 */
export const getUnitLeases = async (req, res) => {
  try {
    const { unitId } = req.params;

    const leases = await prisma.lease.findMany({
      where: {
        unitId,
      },
      include: {
        tenant: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(leases);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch unit leases",
    });
  }
};
