/* eslint-disable */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs/promises");
const db = new PrismaClient();

const main = async () => {
    try {

        console.log("Backup...");

        const [
            users,
            products,
            orders,
            orderItems,
            transactions,
        ] = await Promise.all([
            db.user.findMany(),
            db.product.findMany(),
            db.order.findMany(),
            db.orderItem.findMany(),
            db.transaction.findMany(),
        ]);

        // Tulis hasil ke file JSON
        await Promise.all([
            fs.writeFile("users.json", JSON.stringify(users, null, 2)),
            fs.writeFile("products.json", JSON.stringify(products, null, 2)),
            fs.writeFile("orders.json", JSON.stringify(orders, null, 2)),
            fs.writeFile("orderItems.json", JSON.stringify(orderItems, null, 2)),
            fs.writeFile("transactions.json", JSON.stringify(transactions, null, 2)),
        ]);

        console.log("Backup Complete. Output: users.json, products.json, orders.json, orderItems.json, transactions.json");
        process.exit(0);
    } catch (error) {
        console.error("ERROR BACKUP", error)
    }
};

main();
