import Fastify from "fastify";
import cors from "@fastify/cors";
import { tradesRoutes } from "./routes/trades";
import { usersRoutes } from "./routes/users";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

async function main() {
  const app = Fastify({
    logger: true, // Enable Fastify's built-in logger
  });

  // Enable CORS (adjust origin if needed)
  await app.register(cors, {
    origin: "*",
  });

  // Routes
  await app.register(tradesRoutes);
  await app.register(usersRoutes);

  const PORT = process.env.PORT || 3001;
  try {
    await app.listen({ port: Number(PORT), host: "0.0.0.0" });
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
