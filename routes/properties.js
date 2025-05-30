const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const Property = require("../models/Property");
const auth = require("../middleware/auth");
const { getCache, setCache, deleteCache } = require("../utils/cache");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      city,
      state,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      furnished,
      listingType,
      amenities,
      tags,
      listedBy,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const cacheKey = `properties:${JSON.stringify(req.query)}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const filter = { isActive: true };

    if (type) filter.type = type;
    if (city) filter.city = new RegExp(city, "i");
    if (state) filter.state = new RegExp(state, "i");
    if (listingType) filter.listingType = listingType;
    if (furnished) filter.furnished = furnished;
    if (listedBy) filter.listedBy = listedBy;
    if (bedrooms) filter.bedrooms = parseInt(bedrooms);
    if (bathrooms) filter.bathrooms = parseInt(bathrooms);

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (amenities) {
      const amenitiesArray = amenities.split(",").map((a) => a.trim());
      filter.amenities = { $in: amenitiesArray };
    }

    if (tags) {
      const tagsArray = tags.split(",").map((t) => t.trim());
      filter.tags = { $in: tagsArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("createdBy", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Property.countDocuments(filter),
    ]);

    const result = {
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };

    await setCache(cacheKey, result, 300);

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching properties", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `property:${id}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const query = { isActive: true, $or: [] };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.push({ _id: id });
    }
    query.$or.push({ id });

    const property = await Property.findOne(query).populate(
      "createdBy",
      "name email"
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await setCache(cacheKey, property, 600);

    res.json(property);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching property", error: error.message });
  }
});

router.post(
  "/",
  auth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("type")
      .isIn(["Apartment", "Villa", "Bungalow", "Studio", "Penthouse"])
      .withMessage("Invalid property type"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("state").notEmpty().withMessage("State is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("areaSqFt").isNumeric().withMessage("Area must be a number"),
    body("bedrooms").isNumeric().withMessage("Bedrooms must be a number"),
    body("bathrooms").isNumeric().withMessage("Bathrooms must be a number"),
    body("furnished")
      .isIn(["Furnished", "Semi", "Unfurnished"])
      .withMessage("Invalid furnished status"),
    body("availableFrom").isISO8601().withMessage("Valid date required"),
    body("listedBy")
      .isIn(["Owner", "Agent", "Builder"])
      .withMessage("Invalid listed by value"),
    body("listingType")
      .isIn(["rent", "sale"])
      .withMessage("Invalid listing type"),
    body("colorTheme").notEmpty().withMessage("Color theme is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const propertyData = {
        ...req.body,
        id: `PROP${Date.now()}`,
        createdBy: req.user._id,
        amenities: req.body.amenities || [],
        tags: req.body.tags || [],
      };

      const property = new Property(propertyData);
      await property.save();
      await property.populate("createdBy", "name email");

      await deleteCache("properties:*");

      res.status(201).json({
        message: "Property created successfully",
        property,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating property", error: error.message });
    }
  }
);

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const query = { isActive: true, $or: [] };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.push({ _id: id });
    }
    query.$or.push({ id });

    const property = await Property.findOne(query);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this property" });
    }

    const updatedProperty = await Property.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    await deleteCache(`property:${id}`);
    await deleteCache("properties:*");

    res.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating property", error: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const query = { isActive: true, $or: [] };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.push({ _id: id });
    }
    query.$or.push({ id });

    const property = await Property.findOne(query);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this property" });
    }

    await Property.findOneAndUpdate(query, { isActive: false });

    await deleteCache(`property:${id}`);
    await deleteCache("properties:*");

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting property", error: error.message });
  }
});

router.get("/search/text", async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const cacheKey = `search:${q}:${limit}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const searchRegex = new RegExp(q, "i");

    const properties = await Property.find({
      isActive: true,
      $or: [
        { title: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { type: searchRegex },
        { tags: { $in: [searchRegex] } },
        { amenities: { $in: [searchRegex] } },
      ],
    })
      .populate("createdBy", "name email")
      .limit(parseInt(limit));

    await setCache(cacheKey, properties, 300);

    res.json(properties);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching properties", error: error.message });
  }
});

module.exports = router;
