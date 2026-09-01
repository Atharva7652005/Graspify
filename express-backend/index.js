require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const { PORT } = require("./const");

async function start() {
  if (!process.env.MONGODB_URL) throw new Error("MONGODB_URL is required in .env.");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required in .env.");
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`KnowLearn Express API listening on http://localhost:${PORT}`));
}

start().catch((error) => {
  console.error("Unable to start server:", error.message);
  process.exit(1);
});
