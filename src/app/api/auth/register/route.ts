import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendRegistrationSMS } from "@/lib/arkesel";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
      },
    });

    // Send welcome SMS if phone provided
    if (data.phone) {
      sendRegistrationSMS(data.phone, data.name).catch(console.error);
    }

    // Send verification email
    const token = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: data.email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    sendVerificationEmail(data.email, token).catch(console.error);

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
