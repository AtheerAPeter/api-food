import { PrismaClient } from "@prisma/client";
import v1 from "./routes/v1";
const express = require("express");
export const prisma = new PrismaClient();
const cors = require("cors");
const Redis = require("redis");

// export const client = Redis.createClient({
//   host: process.env.REDIS_HOSTNAME,
//   port: process.env.REDIS_PORT,
//   password: process.env.REDIS_PASSWORD,
// });

async function main() {
  // ... you will write your Prisma Client queries here
  const app = express();
  const port = process.env.PORT || 4000;
  app.use(cors());

  app.use(express.json());

  app.use("/v1", v1);

  app.listen(port, () => {
    console.log(`==== app is running on port: ${port} ======`);
  });
}
main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
