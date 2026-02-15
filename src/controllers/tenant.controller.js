import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

/**
 * CREATE TENANT
 */
export const createTenant = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      nationalId,
      emergencyContact,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TENANT",
        isActive: true,
      },
    });

    const tenant = await prisma.tenant.create({
      data: {
        userId: user.id,
        phone,
        nationalId,
        emergencyContact,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Tenant created successfully",
      tenant,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create tenant" });
  }
};

/**
 * GET ALL TENANTS
 */
export const getAllTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(tenants);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch tenants" });
  }
};

/**
 * GET SINGLE TENANT
 */
export const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    return res.json(tenant);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch tenant" });
  }
};

/**
 * UPDATE TENANT
 */
export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      nationalId,
      emergencyContact,
    } = req.body;

    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingTenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Update user details
    await prisma.user.update({
      where: { id: existingTenant.userId },
      data: {
        name,
        email,
      },
    });

    // Update tenant profile
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        phone,
        nationalId,
        emergencyContact,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      message: "Tenant updated successfully",
      tenant: updatedTenant,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update tenant" });
  }
};

/**
 * DELETE TENANT
 */
export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Deleting user will cascade delete tenant
    await prisma.user.delete({
      where: { id: tenant.userId },
    });

    return res.json({ message: "Tenant deleted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete tenant" });
  }
};
