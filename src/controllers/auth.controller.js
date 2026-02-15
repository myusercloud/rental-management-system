import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { generateAccessToken } from "../utils/generateToken.js";
import { sendEmail } from "../services/email.service.js";

/**
 * REGISTER
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        activationToken,
      },
    });

    const activationLink = `${process.env.CLIENT_URL}/activate/${activationToken}`;

    await sendEmail(
      email,
      "Activate Your Account",
      `<h2>Activate Account</h2>
       <p>Click the link below:</p>
       <a href="${activationLink}">${activationLink}</a>`
    );

    return res.status(201).json({
      message: "Registration successful. Check your email.",
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * ACTIVATE ACCOUNT
 */
export const activateAccount = async (req, res) => {
  const { token } = req.params;

  const user = await prisma.user.findFirst({
    where: { activationToken: token },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: true,
      activationToken: null,
    },
  });

  return res.json({ message: "Account activated successfully" });
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Activate your account first" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = generateAccessToken(user);

  return res.json({ token });
};

/**
 * REQUEST PASSWORD RESET
 */
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
    },
  });

  const resetLink = `${process.env.CLIENT_URL}/reset/${resetToken}`;

  await sendEmail(
    email,
    "Password Reset",
    `<h2>Reset Password</h2>
     <a href="${resetLink}">${resetLink}</a>`
  );

  return res.json({ message: "Password reset email sent" });
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return res.json({ message: "Password reset successful" });
};
