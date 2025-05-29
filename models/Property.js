const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Apartment", "Villa", "Bungalow", "Studio", "Penthouse"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    areaSqFt: {
      type: Number,
      required: true,
      min: 0,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: [
      {
        type: String,
      },
    ],
    furnished: {
      type: String,
      enum: ["Furnished", "Semi", "Unfurnished"],
      required: true,
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    listedBy: {
      type: String,
      enum: ["Owner", "Agent", "Builder"],
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    colorTheme: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    listingType: {
      type: String,
      enum: ["rent", "sale"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


propertySchema.index({ city: 1, type: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ listingType: 1 });
propertySchema.index({ createdBy: 1 });
propertySchema.index({ tags: 1 });

module.exports = mongoose.model("Property", propertySchema);
