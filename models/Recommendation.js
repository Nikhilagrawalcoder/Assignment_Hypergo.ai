const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

recommendationSchema.index({ to: 1, isRead: 1 });

module.exports = mongoose.model("Recommendation", recommendationSchema);
