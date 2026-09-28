import "dotenv/config";
import { prisma } from "../src/core/database/prisma";

async function main() {
  const plans = [
    {
      name: "Basic",
      price: 4.99,
      durationDays: 30,
    },
    {
      name: "Premium",
      price: 9.99,
      durationDays: 30,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: {
        name: plan.name,
      },
      update: {
        price: plan.price,
        durationDays: plan.durationDays,
      },
      create: {
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
      },
    });
  }

  console.log("Subscription plans seeded successfully");
}

main()
  .catch((error) => {
    console.error("Error seeding plans:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });