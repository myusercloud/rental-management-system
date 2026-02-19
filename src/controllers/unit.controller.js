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
        leases: {
          where: { status: "ACTIVE" },
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
        leases: {
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
 * UPDATE UNIT
 */
export const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...req.body,
        rentAmount: req.body.rentAmount
          ? parseFloat(req.body.rentAmount)
          : undefined,
      },
    });

    res.json({ message: "Unit updated", unit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update unit" });
  }
};


/**
 * GET DASHBOARD STATS
 */
export const getUnitStats = async (req, res) => {
  try {
    const totalUnits = await prisma.unit.count();

    const occupiedUnits = await prisma.unit.count({
      where: { status: "OCCUPIED" },
    });

    const availableUnits = await prisma.unit.count({
      where: { status: "AVAILABLE" },
    });

    const units = await prisma.unit.findMany({
      select: {
        building: true,
        status: true,
      },
    });

    const buildingMap = {};

    units.forEach((unit) => {
      if (!buildingMap[unit.building]) {
        buildingMap[unit.building] = {
          total: 0,
          occupied: 0,
          vacant: 0,
        };
      }

      buildingMap[unit.building].total += 1;

      if (unit.status === "OCCUPIED") {
        buildingMap[unit.building].occupied += 1;
      } else {
        buildingMap[unit.building].vacant += 1;
      }
    });

    const buildingCapacity = Object.entries(buildingMap)
      .map(([building, data]) => ({
        building,
        total: data.total,
        occupied: data.occupied,
        vacant: data.vacant,
        percentage:
          data.total === 0
            ? 0
            : Math.round((data.occupied / data.total) * 100),
      }))
      .sort((a, b) => a.building.localeCompare(b.building));

    const occupancyRate =
      totalUnits === 0
        ? 0
        : Math.round((occupiedUnits / totalUnits) * 100);

    return res.json({
      totalUnits,
      occupiedUnits,
      availableUnits,
      occupancyRate,
      buildingCapacity,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch stats" });
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
