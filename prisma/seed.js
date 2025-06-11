/* eslint-disable */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const bcrypt = require("bcryptjs");

const PASSWORD = "12345678";
const seedAdmin = async () => {
  const check = await db.user.findFirst({ where: { role: "Admin" } });

  if (check) {
    console.log("Admin already exists");
    return
  } else {
    const hashedPass = await bcrypt.hash(PASSWORD, 10);
    const user = await db.user.create({
      data: {
        email: "admin@example.com",
        password: hashedPass,
        name: "Admin",
        role: "Admin",
        picture: "https://static.wikia.nocookie.net/attack-on-titan/images/d/d0/Eren_Yeager.png/revision/latest?cb=20240729065824&path-prefix=id"
      }
    })
    console.log("Admin created ", user.email);
  }
}

const seedUser = async () => {
  const check = await db.user.findFirst({ where: { role: "User" } });

  if (check) {
    console.log("User already exists");
    return
  } else {
    const hashedPass = await bcrypt.hash(PASSWORD, 10);
    const user = await db.user.create({
      data: {
        email: "user@example.com",
        password: hashedPass,
        name: "User",
        role: "User",
        picture: "https://static1.cbrimages.com/wordpress/wp-content/uploads/2023/05/aqua-in-oshi-no-ko.jpg"
      }
    })
    console.log("User created ", user.email);
  }
}

const seedSeller = async () => {
  const check = await db.user.findFirst({ where: { role: "Seller" } });

  if (check) {
    console.log("Seller already exists");
    return
  } else {
    const hashedPass = await bcrypt.hash(PASSWORD, 10);
    const user = await db.user.create({
      data: {
        email: "seller@example.com",
        password: hashedPass,
        name: "Seller",
        role: "Seller",
        picture: "https://cdns.klimg.com/resized/670x/g/8/_/8_fakta_uchiha_sasuke_yang_dinobatkan_jadi_karakter_anime_terganteng_2024_simak_alasannya_di_sini/p/uchiha_sasuke-20241208-001-non_fotografer_kly.jpg",
        products: {
          createMany: {
            data: [
              {
                name: "Tirta Mayang 50L",
                desc: "Air Bersih Sehat dan Segar dari pegunungan terbaik di Indonesia, Tirta Mayang memberikan rasa yang segar dan sehat untuk tubuh, dengan mineral yang seimbang dan tidak berbahaya untuk tubuh.",
                price: 200000,
                images: ["https://tirtamayang.com/wp-content/uploads/2023/10/DSC03394.jpg"],
              },
              {
                name: "Tirta Hidayah 30L",
                desc: "Air Bersih dan Segar dari pegunungan terbaik di Indonesia, Tirta Hidayah memberikan rasa yang segar dan sehat untuk tubuh, dengan mineral yang seimbang dan tidak berbahaya untuk tubuh.",
                price: 150000,
                images: ["https://tirtahidayah.bengkulukota.go.id/wp-content/uploads/2022/12/mobil-tangki1-1024x698.png", "https://tirtamayang.com/wp-content/uploads/2023/10/DSC03395.jpg"],
              },
              {
                name: "Delta Tirta 20L",
                desc: "Air Bersih dan Segar dari pegunungan terbaik di Indonesia, Delta Tirta memberikan rasa yang segar dan sehat untuk tubuh, dengan mineral yang seimbang dan tidak berbahaya untuk tubuh.",
                price: 100000,
                images: ["https://asset-2.tstatic.net/surabaya/foto/bank/images/pdam-delta-tirta-sidoarjo-air-tangki_20150811_190511.jpg"],
                isDeleted: true,
              },
              {
                name: "日本の水50リテル",
                desc: "Air Bersih dan Segar dari pegunungan terbaik di Jepun, air ini memberikan rasa yang segar dan sehat untuk tubuh, dengan mineral yang seimbang dan tidak berbahaya untuk tubuh.",
                price: 50000,
                images: ["https://cdn-2.tstatic.net/tribunnews/foto/bank/images/tangki-air-limbah-nuklir-nih4.jpg"],
              }
            ]
          }
        }
      }
    })
    console.log("Seller created ", user.email);
  }
}

const main = async () => {
  console.log("Seeding...");
  await db.$connect();
  await seedAdmin();
  await seedUser();
  await seedSeller();
  await db.$disconnect();
  console.log("Seeding complete");
  process.exit(0);
};

main();

