const express = require("express");
const { body, validationResult } = require("express-validator");
const Recommendation = require("../models/Recommendation");
const Property = require("../models/Property");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();


router.get("/received", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [recommendations, total] = await Promise.all([
      Recommendation.find({ to: req.user._id })
        .populate("from", "name email")
        .populate({
          path: "property",
          populate: {
            path: "createdBy",
            select: "name email",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Recommendation.countDocuments({ to: req.user._id }),
    ]);

    res.json({
      recommendations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching recommendations",
        error: error.message,
      });
  }
});


router.get("/sent", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [recommendations, total] = await Promise.all([
      Recommendation.find({ from: req.user._id })
        .populate("to", "name email")
        .populate({
          path: "property",
          populate: {
            path: "createdBy",
            select: "name email",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Recommendation.countDocuments({ from: req.user._id }),
    ]);

    res.json({
      recommendations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching sent recommendations",
        error: error.message,
      });
  }
});


router.post(
  "/",
  auth,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("propertyId").notEmpty().withMessage("Property ID is required"),
    body("message")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Message too long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, propertyId, message } = req.body;

   
      const recipient = await User.findOne({ email, isActive: true });
      if (!recipient) {
        return res.status(404).json({ message: "User not found" });
      }

      if (recipient._id.toString() === req.user._id.toString()) {
        return res
          .status(400)
          .json({ message: "Cannot recommend to yourself" });
      }

 
      const property = await Property.findOne({
        $or: [{ _id: propertyId }, { id: propertyId }],
        isActive: true,
      });

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      const existingRecommendation = await Recommendation.findOne({
        from: req.user._id,
        to: recipient._id,
        property: property._id,
      });

      if (existingRecommendation) {
        return res
          .status(400)
          .json({ message: "Property already recommended to this user" });
      }

      const recommendation = new Recommendation({
        from: req.user._id,
        to: recipient._id,
        property: property._id,
        message,
      });

      await recommendation.save();
      await recommendation.populate(["from to property"]);

      res.status(201).json({
        message: "Recommendation sent successfully",
        recommendation,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error sending recommendation",
          error: error.message,
        });
    }
  }
);


router.patch("/:id/read", auth, async (req, res) => {
  try {
    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: req.params.id, to: req.user._id },
      { isRead: true },
      { new: true }
    ).populate(["from", "property"]);

    if (!recommendation) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    res.json({
      message: "Recommendation marked as read",
      recommendation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating recommendation", error: error.message });
  }
});

router.get("/users/search", auth, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email query is required" });
    }

    const users = await User.find({
      email: new RegExp(email, "i"),
      _id: { $ne: req.user._id },
      isActive: true,
    })
      .select("name email")
      .limit(10);

    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching users", error: error.message });
  }
});

module.exports = router;
