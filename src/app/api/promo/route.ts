import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const eventId = searchParams.get("eventId");

  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase(), active: true },
  });

  if (
    !promo ||
    (promo.expiresAt && promo.expiresAt < new Date()) ||
    (promo.maxUses && promo.usedCount >= promo.maxUses) ||
    (promo.eventId && promo.eventId !== eventId)
  ) {
    return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 404 });
  }

  return NextResponse.json({
    code: promo.code,
    discount: promo.discount,
    isPercent: promo.isPercent,
  });
}
