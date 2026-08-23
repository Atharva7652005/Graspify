const Razorpay = require("razorpay");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const PLAN_PRICES = {
  Basic: 149,
  Pro: 249,
  Premium: 349,
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createOrder(req, res, next) {
  try {
    const { planName } = req.body;
    
    if (!PLAN_PRICES[planName]) {
      return res.status(400).json({ message: "Invalid plan selected." });
    }

    const amount = PLAN_PRICES[planName] * 100; // Convert to paise
    const currency = "INR";

    const options = {
      amount,
      currency,
      receipt: `receipt_${req.userId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Failed to create Razorpay order." });
    }

    // Save transaction as pending
    await Transaction.create({
      user: req.userId,
      planName,
      amount: PLAN_PRICES[planName],
      razorpayOrderId: order.id,
      status: "Pending",
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Verify signature
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: "Transaction is not authentic." });
    }

    // Update Transaction status
    const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction record not found." });
    }

    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.status = "Success";
    await transaction.save();

    // Update User Plan
    const user = await User.findById(transaction.user);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.activePlan = transaction.planName;
    if (!user.purchasedPlans.includes(transaction.planName)) {
      user.purchasedPlans.push(transaction.planName);
    }
    await user.save();

    // Clean user for response
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      activePlan: user.activePlan,
      purchasedPlans: user.purchasedPlans,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    res.json({ message: "Payment successful", user: safeUser });
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, verifyPayment };
