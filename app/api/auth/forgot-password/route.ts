import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link."
      });
    }

    // Generate a cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Delete any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: `password-reset:${email}` },
    });

    // Store the hashed token in the database
    await prisma.verificationToken.create({
      data: {
        identifier: `password-reset:${email}`,
        token: hashedToken,
        expires: resetExpires,
      },
    });

    // Send password reset email with the unhashed token
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const { error } = await resend.emails.send({
      from: "RentSquare <nishant-sharma@tryholo.studio>",
      to: email,
      subject: "Reset Your Password - RentSquare",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f6f6f8; padding: 20px; margin: 0;">
  <div style="max-width: 500px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 40px 32px;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #15803d; margin: 0; font-size: 28px; font-weight: 700;">RentSquare</h1>
    </div>
    
    <!-- Content -->
    <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 22px; text-align: center;">Forgot your password?</h2>
    
    <p style="color: #64748b; margin: 0 0 24px 0; line-height: 1.6; text-align: center;">
      No worries! Click the button below to reset your password and get back to renting.
    </p>
    
    <!-- Button -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #15803d; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Reset Password
      </a>
    </div>
    
    <!-- Expiry Note -->
    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 16px 0; text-align: center;">
      This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
    </p>
    
    <!-- Divider -->
    <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #15803d; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        © ${new Date().getFullYear()} RentSquare. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "If an account exists with this email, you will receive a password reset link." 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
