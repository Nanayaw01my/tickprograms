"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import jsPDF from "jspdf";

interface TicketData {
  ticketCode: string;
  qrCode?: string | null;
  event: { title: string; date: Date | string; venue: string; city?: string | null };
  ticketType: { name: string; price: number };
}

export function TicketDownload({ ticket }: { ticket: TicketData }) {
  const handleDownload = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [100, 160],
    });

    // Background
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 100, 40, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TicketHub", 50, 15, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Your Digital Ticket", 50, 23, { align: "center" });

    // Event Name
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const eventTitle = doc.splitTextToSize(ticket.event.title, 80);
    doc.text(eventTitle, 50, 52, { align: "center" });

    // Details
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("DATE & TIME", 10, 70);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(formatDateTime(ticket.event.date), 10, 76);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("VENUE", 10, 85);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${ticket.event.venue}${ticket.event.city ? `, ${ticket.event.city}` : ""}`, 10, 91);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("TICKET TYPE", 10, 100);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(ticket.ticketType.name, 10, 106);

    // QR Code
    if (ticket.qrCode) {
      doc.addImage(ticket.qrCode, "PNG", 25, 110, 50, 50);
    }

    // Ticket Code
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(ticket.ticketCode, 50, 148, { align: "center" });

    // Dashed line
    doc.setLineDashPattern([2, 2], 0);
    doc.setDrawColor(200, 200, 200);
    doc.line(5, 38, 95, 38);

    doc.save(`ticket-${ticket.ticketCode}.pdf`);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className="w-full">
      <Download className="h-4 w-4" />
      Download PDF
    </Button>
  );
}
