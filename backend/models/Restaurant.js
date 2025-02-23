const mongoose = require('mongoose');

// Define the schema for the Restaurant collection
const restaurantSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  cuisines: {
    type: String,
    required: true,
  },
  price_range: {
    type: Number,
    required: true,
  },
  average_cost_for_two: {
    type: Number,
    required: true,
  },
  user_rating: {
    aggregate_rating: {
      type: String,
      required: true,
    },
    rating_text: {
      type: String,
      required: true,
    },
    votes: {
      type: String,
      required: true,
    },
  },
  location: {
    type: {
      type: String,
      default: 'Point',  // GeoJSON Point
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true,
    },
  },
  featured_image: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Create 2dsphere index for geospatial queries
restaurantSchema.index({ location: "2dsphere" });

// Create the Restaurant model
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Export the model for use in other files
module.exports = Restaurant;
