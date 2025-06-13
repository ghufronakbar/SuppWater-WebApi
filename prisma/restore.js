/* eslint-disable */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs/promises");
const path = require("path");
const db = new PrismaClient();

const BACKUP_DIR = path.join(__dirname, "backup");

const main = async () => {
    try {

        console.log("Restore in progress...");


        const promises = [
            db.orderItem.deleteMany(),
            db.transaction.deleteMany(),
            db.order.deleteMany(),
            db.product.deleteMany(),
            db.user.deleteMany(),
        ];

        await Promise.all(promises).then(() => console.log("All data deleted"));

        // Read JSON files
        const users = JSON.parse(await fs.readFile(path.join(BACKUP_DIR, "users.json"), "utf-8"));
        const products = JSON.parse(await fs.readFile(path.join(BACKUP_DIR, "products.json"), "utf-8"));
        const orders = JSON.parse(await fs.readFile(path.join(BACKUP_DIR, "orders.json"), "utf-8"));
        const orderItems = JSON.parse(await fs.readFile(path.join(BACKUP_DIR, "orderItems.json"), "utf-8"));
        const transactions = JSON.parse(await fs.readFile(path.join(BACKUP_DIR, "transactions.json"), "utf-8"));

        // Insert in order (users → products → orders → transactions → orderItems)
        // Insert User
        for (const user of users) {
            const data = await db.user.create({ data: user });
            console.log(data.name, data.role)
        }
        // Insert Product
        for (const product of products) {
            const data = await db.product.create({ data: product });
            console.log(data.name)
        }
        // Insert Order
        for (const order of orders) {
            const data = await db.order.create({ data: order });
            console.log(data.id)
        }
        // Insert Transaction
        for (const transaction of transactions) {
            const data = await db.transaction.create({ data: transaction });
            console.log(data.id)
        }
        // Insert OrderItem
        for (const orderItem of orderItems) {
            const data = await db.orderItem.create({ data: orderItem });
            console.log(data.id)
        }

        console.log("Restore complete.");
        process.exit(0);
    } catch (error) {
        console.error("ERROR RESTORE", error);
    }
};

main();
