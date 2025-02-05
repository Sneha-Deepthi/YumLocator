const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const Restaurant = require('./models/Restaurant');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/zomato', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Import restaurant data from JSON (only for initial load)
fs.readFile('./backend/zomato.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file', err);
    return;
  }

  const restaurants = JSON.parse(data);
  Restaurant.insertMany(restaurants)
    .then(() => console.log('Data inserted into MongoDB'))
    .catch((err) => console.error('Error inserting data:', err));
});

// API endpoint to search restaurants
app.get('/restaurants', async (req, res) => {
  const { name, location, cuisine } = req.query;

  try {
    let query = {};
    if (name) query.name = new RegExp(name, 'i');
    if (location) query.location = new RegExp(location, 'i');
    if (cuisine) query.cuisine = new RegExp(cuisine, 'i');

    const restaurants = await Restaurant.find(query);
    res.json(restaurants);
  } catch (err) {
    res.status(500).send('Error fetching restaurants');
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
