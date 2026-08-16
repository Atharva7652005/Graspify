const PORT = Number(process.env.PORT || 3000);
const FASTAPI_URL = (process.env.FASTAPI_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

module.exports = { PORT, FASTAPI_URL, JWT_EXPIRES_IN };
