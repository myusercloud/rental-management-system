import prisma from "../config/prisma.js";

/**
 * CREATE UNIT
 */
export const createUnit = async (req, res) => {
  try {
    const { unitNumber, building, description, rentAmount } = req.body;

    if (!unitNumber || !building || !description || !rentAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUnit = await prisma.unit.findFirst({
      where: {
        unitNumber,
        building,
      },
    });

    if (existingUnit) {
      return res.status(400).json({
        message: "Unit already exists in this building",
      });
    }

    const unit = await prisma.unit.create({
      data: {
        unitNumber,
        building,
        description,
        rentAmount: parseFloat(rentAmount),
      },
    });

    return res.status(201).json({
      message: "Unit created successfully",
      unit,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create unit" });
  }
};

/**
 * GET ALL UNITS
 */
export const getAllUnits = async (req, res) => {
  try {
    const units = await prisma.unit.findMany({
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

    return res.json(units);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch units" });
  }
};

/**
 * GET AVAILABLE UNITS
 */
export const getAvailableUnits = async (req, res) => {
  try {
    const units = await prisma.unit.findMany({
      where: {
        status: "AVAILABLE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(units);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch available units" });
  }
};

/**
 * GET SINGLE UNIT
 */
export const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await prisma.unit.findUnique({
      where: { id },
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
    });

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    return res.json(unit);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch unit" });
  }
};

/**
 * DELETE UNIT
 * Only allowed if unit is AVAILABLE
 */
export const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await prisma.unit.findUnique({
      where: { id },
    });

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    if (unit.status === "OCCUPIED") {
      return res.status(400).json({
        message: "Cannot delete an occupied unit",
      });
    }

    await prisma.unit.delete({
      where: { id },
    });

    return res.json({ message: "Unit deleted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete unit" });
  }
};
