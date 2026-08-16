const mongoose = require("mongoose");

const chatFeedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    contentId: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    rating: { type: Number, required: true, enum: [-1, 1] }, // -1 for Thumbs Down, 1 for Thumbs Up
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatFeedback", chatFeedbackSchema);
