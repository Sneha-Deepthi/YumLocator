const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const Restaurant = require('./models/Restaurant');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

  app.get('/location', async (req, res) => {
    try {
      const { lat, lng, radius = 3000 } = req.query;
  
      if (!lat || !lng) {
        return res.status(400).json({ success: false, error: "Latitude and Longitude are required." });
      }
  
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = parseFloat(radius);
  
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ success: false, error: "Invalid latitude or longitude." });
      }
  
      const restaurants = await Restaurant.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: radiusInMeters
          }
        }
      });
  
      if (restaurants.length === 0) {
        return res.status(404).json({ success: false, error: "No restaurants found in the specified location." });
      }
      res.json({ success: true, data: restaurants });
    } catch (err) {
      console.error("Error in location search:", err);
      res.status(500).json({ success: false, error: 'Error performing location search' });
    }
  });
  

// 📌 API to Search & Paginate Restaurants (Supports Name & Location Filters)
// Main restaurants endpoint

app.get('/restaurants', async (req, res) => {
  try {
    const { page = 1, limit = 10, city = '' } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Build query object
    const query = {};
    
    // Add city filter if provided
    if (city.trim()) {
      query['location.city'] = city.trim();
    }

    // Get total count of restaurants matching the query
    const totalRestaurants = await Restaurant.countDocuments(query);

    // Fetch restaurants with pagination and city filter
    const restaurants = await Restaurant.find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // If no restaurants found, return empty array with pagination info
    res.json({
      total: totalRestaurants,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(totalRestaurants / limitNumber),
      restaurants: restaurants || [],
    });

  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Search endpoint
// Search endpoint with improved name searching
app.get('/restaurants/search', async (req, res) => {
  try {
    const { name = '', page = 1, limit = 10, city = '' } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Build query object
    let query = {};
    
    // Improved name search with case-insensitive partial matching
    if (name.trim()) {
      // Split search terms and create OR conditions for each word
      const searchTerms = name.trim().split(/\s+/);
      query.name = {
        $regex: searchTerms.map(term => `(?=.*${term})`).join(''),
        $options: 'i'
      };
    }
    
    // Add city filter if provided
    if (city && city !== 'Select City') {
      query['location.city'] = city;
    }

    // Get total count of matching restaurants
    const totalRestaurants = await Restaurant.countDocuments(query);

    // Fetch matching restaurants with pagination
    const restaurants = await Restaurant.find(query)
      .sort({ 'user_rating.aggregate_rating': -1 }) // Sort by rating
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);


    res.json({
      total: totalRestaurants,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(totalRestaurants / limitNumber),
      restaurants: restaurants || [],
      query: query // Include query for debugging
    });

  } catch (err) {
    console.error('Error searching restaurants:', err);
    res.status(500).json({ error: 'Failed to search restaurants' });
  }
});

app.get('/cities', async (req, res) => {
  try {
    const cities = await Restaurant.distinct("location.city");
    res.json(cities);
  } catch (err) {
    console.error('Error fetching cities:', err);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});


// 📌 API to Fetch a Single Restaurant by ID
app.get('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found!" });
    }

    res.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 📌 API to Get Restaurants by Country (City-Based Search)
app.get('/restaurants/city', async (req, res) => {
  try {
    const { city_name } = req.query;

    if (!city_name) {
      return res.status(400).json({ error: "city_name is required" });
    }

    console.log('Searching for city:', city_name);

    const restaurants = await Restaurant.find({
      "location.city": { $regex: new RegExp(city_name, "i") }
    });

    if (restaurants.length === 0) {
      return res.status(404).json({ message: "No restaurants found for the given city" });
    }

    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// 📌 API for General Restaurant Filtering (Pagination)
app.get('/restaurants/filter', async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const restaurants = await Restaurant.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Route to process the uploaded image

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageBase64 = req.file.buffer.toString('base64');

    const response = await axios.post(
      'https://api.clarifai.com/v2/models/food-item-v1-recognition/outputs',
      {
        inputs: [{ data: { image: { base64: imageBase64 } } }],
      },
      {
        headers: {
          Authorization: `Key ${process.env.CLARIFAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const detectedFood = response.data.outputs[0].data.concepts.map(item => item.name);

    // Create a mapping of food items to cuisines
    const foodToCuisineMap = {
      'pasta': ['Italian'],
      'pizza': ['Italian'],
      'sushi': ['Japanese'],
      'ramen': ['Japanese'],
      'burger': ['American'],
      'ice cream': ['Desserts'],
      // Add more mappings as needed
    };

    // Get relevant cuisines based on detected food
    const relevantCuisines = detectedFood.reduce((cuisines, food) => {
      const mappedCuisines = foodToCuisineMap[food.toLowerCase()] || [];
      return [...cuisines, ...mappedCuisines];
    }, []);

    // Search restaurants with relevant cuisines
    const restaurants = await Restaurant.find({
      cuisines: { 
        $regex: new RegExp(relevantCuisines.join('|'), 'i')
      }
    }).limit(10);

    res.json({ 
      success: true, 
      detectedFood, 
      matchedCuisines: relevantCuisines,
      restaurants 
    });
  } catch (error) {
    console.error('Clarifai API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error processing image' });
  }
});

// 🚀 Server Listening
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
