import QRCode from "qrcode";

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

export function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "TKT-";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
