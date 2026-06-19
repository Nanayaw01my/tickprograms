import axios from "axios";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const BASE_URL = "https://api.paystack.co";

const paystackAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export async function initializeTransaction({
  email,
  amount,
  reference,
  callback_url,
  metadata,
}: {
  email: string;
  amount: number;
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}) {
  const response = await paystackAxios.post("/transaction/initialize", {
    email,
    amount: Math.round(amount * 100), // Convert to pesewas/kobo
    reference,
    callback_url,
    metadata,
  });
  return response.data;
}

export async function verifyTransaction(reference: string) {
  const response = await paystackAxios.get(
    `/transaction/verify/${reference}`
  );
  return response.data;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return hash === signature;
}
