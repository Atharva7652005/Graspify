const express = require("express");
const router = express.Router();
const controller = require("../controllers/payment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/create-order", authMiddleware.requireAuth, controller.createOrder);
router.post("/verify", authMiddleware.requireAuth, controller.verifyPayment);

module.exports = router;
