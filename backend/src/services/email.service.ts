/**
 * src/services/email.service.ts
 *
 * Summary: Email service for sending transactional emails
 * - Uses nodemailer for sending emails
 * - Handles password reset emails
 */

import nodemailer from "nodemailer";
import { AppError } from "../types";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Email service class for sending transactional emails
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter using environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Send an email
   * @param options - Email options
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    const { to, subject, html } = options;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@chatapp.com",
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw new AppError("Failed to send email", 500);
    }
  }

  /**
   * Send password reset email
   * @param email - User's email address
   * @param resetToken - Password reset token
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3001";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #666; font-size: 16px;">
          You requested to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          This link will expire in 1 hour.<br>
          If you didn't request a password reset, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${resetUrl}
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: "Password Reset Request",
      html,
    });
  }
}
