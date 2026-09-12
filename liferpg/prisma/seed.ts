import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const items = [
    { title: "Tavern Ale", description: "A frothy reward for a hard day's questing. Purely cosmetic bragging rights.", icon: "🍺", cost: 20, category: "trinket" },
    { title: "Wax-Seal Badge: Iron Will", description: "Shown on your Hero Sheet. Earned by those who spend their gold wisely (or don't).", icon: "🛡️", cost: 60, category: "badge" },
    { title: "Midnight Ink Theme", description: "Swap the parchment for a deep midnight-blue ledger.", icon: "🌙", cost: 120, category: "theme" },
    { title: "Gilded Quill", description: "A decorative flourish next to your name on the Quest Board.", icon: "🪶", cost: 45, category: "trinket" },
    { title: "Dragon's Hoard Frame", description: "An ornate gold frame around your character portrait.", icon: "🐉", cost: 200, category: "badge" },
    { title: "Scholar's Spectacles", description: "Cosmetic flair for the Hero Sheet header.", icon: "🧐", cost: 35, category: "trinket" },
  ];

  for (const item of items) {
    await prisma.shopItem.upsert({
      where: { id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {},
      create: { id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), ...item },
    });
  }

  console.log(`Seeded ${items.length} shop items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
