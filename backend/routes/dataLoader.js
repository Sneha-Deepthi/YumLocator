const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// MongoDB connection
const MONGO_URI = "mongodb://localhost:27017/zomato";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  id: String,
  name: String,
  cuisines: String,
  price_range: Number,
  average_cost_for_two: Number,
  user_rating: {
    aggregate_rating: String,
    rating_text: String,
    votes: String,
  },
  location: {
    address: String,
    city: String,
    latitude: String,
    longitude: String,
  },
  featured_image: String,
  url: String,
}, { timestamps: true });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

// Function to read and upload JSON files
const uploadData = async () => {
  try {
    const jsonDir = path.join(__dirname, "../json_data"); // Ensure correct path
    const files = fs.readdirSync(jsonDir); // Read JSON files

    for (const file of files) {
      if (file.endsWith(".json")) { // Process only JSON files
        const filePath = path.join(jsonDir, file);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        for (const entry of jsonData) {
          if (entry.restaurants && Array.isArray(entry.restaurants)) {
            const restaurantData = entry.restaurants.map(r => r.restaurant);
            await Restaurant.insertMany(restaurantData, { ordered: false })
              .catch(err => console.log(`⚠️ Skipping duplicate entries in ${file}`));
          }
        }
        console.log(`✅ Successfully uploaded data from ${file}`);
      }
    }
  } catch (error) {
    console.error("❌ Error uploading data:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute upload function
uploadData();
