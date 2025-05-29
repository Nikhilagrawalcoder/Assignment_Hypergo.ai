const express = require('express');
const Favorite = require('../models/Favorite');
const Property = require('../models/Property');
const auth = require('../middleware/auth');

const router = express.Router();


router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [favorites, total] = await Promise.all([
      Favorite.find({ user: req.user._id })
        .populate({
          path: 'property',
          populate: {
            path: 'createdBy',
            select: 'name email'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Favorite.countDocuments({ user: req.user._id })
    ]);

    res.json({
      favorites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
});


router.post('/:propertyId', auth, async (req, res) => {
  try {
    const property = await Property.findOne({
      $or: [{ _id: req.params.propertyId }, { id: req.params.propertyId }],
      isActive: true
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      property: property._id
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    const favorite = new Favorite({
      user: req.user._id,
      property: property._id
    });

    await favorite.save();
    await favorite.populate('property');

    res.status(201).json({
      message: 'Added to favorites',
      favorite
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
});


router.delete('/:propertyId', auth, async (req, res) => {
  try {
    const property = await Property.findOne({
      $or: [{ _id: req.params.propertyId }, { id: req.params.propertyId }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const deleted = await Favorite.findOneAndDelete({
      user: req.user._id,
      property: property._id
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
});

module.exports = router;