import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
}) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || "TicketHub <noreply@tickethub.com>",
    to,
    subject,
    html,
    attachments,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Verify your TicketHub account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to TicketHub!</h1>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${url}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendTicketConfirmationEmail(
  email: string,
  {
    eventName,
    ticketId,
    eventDate,
    venue,
  }: { eventName: string; ticketId: string; eventDate: string; venue: string }
) {
  return sendEmail({
    to: email,
    subject: `Your ticket for ${eventName} - TicketHub`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Ticket Confirmed!</h1>
        <p>Your ticket purchase was successful.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <h2>${eventName}</h2>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Venue:</strong> ${venue}</p>
        </div>
        <p>Log in to your dashboard to view and download your ticket QR code.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">View Ticket</a>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Reset your TicketHub password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Reset Password</h1>
        <p>Click the button below to reset your password:</p>
        <a href="${url}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 16px 0;">Reset Password</a>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
