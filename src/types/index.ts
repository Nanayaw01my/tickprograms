import { Role, TicketStatus, PaymentStatus, EventStatus } from "@prisma/client";

export type { Role, TicketStatus, PaymentStatus, EventStatus };

export interface EventWithDetails {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date | null;
  venue: string;
  address?: string | null;
  city?: string | null;
  country: string;
  image?: string | null;
  status: EventStatus;
  featured: boolean;
  capacity?: number | null;
  categoryId?: string | null;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: string; name: string; slug: string; color?: string | null; icon?: string | null } | null;
  organizer: { id: string; name: string; email: string; image?: string | null };
  ticketTypes: TicketTypeWithCount[];
  _count?: { tickets: number; orders: number };
}

export interface TicketTypeWithCount {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  sold: number;
  eventId: string;
}

export interface TicketWithDetails {
  id: string;
  ticketCode: string;
  qrCode?: string | null;
  status: TicketStatus;
  checkedInAt?: Date | null;
  eventId: string;
  userId: string;
  ticketTypeId: string;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
  event: {
    id: string;
    title: string;
    date: Date;
    venue: string;
    image?: string | null;
  };
  ticketType: { name: string; price: number };
  user: { name: string; email: string };
}

export interface OrderWithDetails {
  id: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  promoCode?: string | null;
  discount?: number | null;
  userId: string;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
  event: { id: string; title: string; date: Date; venue: string; image?: string | null };
  tickets: TicketWithDetails[];
  payment?: {
    reference: string;
    amount: number;
    status: PaymentStatus;
    provider: string;
  } | null;
}

export interface CheckoutData {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  promoCode?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalTickets: number;
  totalEvents: number;
  totalUsers: number;
  recentOrders: OrderWithDetails[];
  revenueByMonth: { month: string; revenue: number }[];
}
