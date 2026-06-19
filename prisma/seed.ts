import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "music" }, update: {}, create: { name: "Music", slug: "music", icon: "🎵", color: "#ec4899" } }),
    prisma.category.upsert({ where: { slug: "sports" }, update: {}, create: { name: "Sports", slug: "sports", icon: "⚽", color: "#22c55e" } }),
    prisma.category.upsert({ where: { slug: "arts" }, update: {}, create: { name: "Arts & Culture", slug: "arts", icon: "🎨", color: "#a855f7" } }),
    prisma.category.upsert({ where: { slug: "food" }, update: {}, create: { name: "Food & Drink", slug: "food", icon: "🍽️", color: "#f97316" } }),
    prisma.category.upsert({ where: { slug: "technology" }, update: {}, create: { name: "Technology", slug: "technology", icon: "💻", color: "#3b82f6" } }),
    prisma.category.upsert({ where: { slug: "comedy" }, update: {}, create: { name: "Comedy", slug: "comedy", icon: "😂", color: "#eab308" } }),
    prisma.category.upsert({ where: { slug: "business" }, update: {}, create: { name: "Business", slug: "business", icon: "💼", color: "#64748b" } }),
    prisma.category.upsert({ where: { slug: "education" }, update: {}, create: { name: "Education", slug: "education", icon: "📚", color: "#14b8a6" } }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tickethub.com" },
    update: {},
    create: {
      name: "TicketHub Admin",
      email: "admin@tickethub.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  // Create sample events
  const musicCat = categories.find((c) => c.slug === "music")!;
  const techCat = categories.find((c) => c.slug === "technology")!;

  const event1 = await prisma.event.upsert({
    where: { id: "000000000000000000000001" },
    update: {},
    create: {
      id: "000000000000000000000001",
      title: "Accra Music Festival 2025",
      description: "The biggest music festival in Accra featuring Ghana's top artists and international acts. A night of incredible performances, food, and culture.",
      date: new Date("2025-12-15T18:00:00Z"),
      endDate: new Date("2025-12-15T23:59:00Z"),
      venue: "Accra Sports Stadium",
      address: "Independence Avenue",
      city: "Accra",
      country: "Ghana",
      status: "PUBLISHED",
      featured: true,
      categoryId: musicCat.id,
      organizerId: admin.id,
      ticketTypes: {
        create: [
          { name: "General Admission", description: "Standard entry", price: 50, quantity: 1000 },
          { name: "VIP", description: "VIP lounge access + complimentary drinks", price: 200, quantity: 200 },
          { name: "VVIP Table", description: "Private table for 4 + full service", price: 1000, quantity: 20 },
        ],
      },
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: "000000000000000000000002" },
    update: {},
    create: {
      id: "000000000000000000000002",
      title: "Ghana Tech Summit 2025",
      description: "Join Ghana's leading tech entrepreneurs, investors, and innovators for a full day of talks, workshops, and networking.",
      date: new Date("2025-11-20T09:00:00Z"),
      endDate: new Date("2025-11-20T18:00:00Z"),
      venue: "Accra International Conference Centre",
      address: "Castle Road",
      city: "Accra",
      country: "Ghana",
      status: "PUBLISHED",
      featured: true,
      categoryId: techCat.id,
      organizerId: admin.id,
      ticketTypes: {
        create: [
          { name: "Standard", description: "Full day access", price: 100, quantity: 500 },
          { name: "Premium", description: "All sessions + workshop + lunch", price: 250, quantity: 100 },
        ],
      },
    },
  });

  console.log("Created sample events:", event1.title, event2.title);
  console.log("\nSeed completed!");
  console.log("Admin login: admin@tickethub.com / admin123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
