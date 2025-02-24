import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/RestaurantList.css";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState(3000);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [detectedFood, setDetectedFood] = useState(null);
  const [editingField, setEditingField] = useState(null); // Track which field is being edited
  const [editingLatLng, setEditingLatLng] = useState(false); // Track if lat/lng input is active

  // Fetch restaurants based on filters
  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        city: selectedCity || undefined,
        name: searchTerm.trim() || undefined,
        lat: latitude ? parseFloat(latitude) : undefined,
        lng: longitude ? parseFloat(longitude) : undefined,
        radius: latitude && longitude ? radius : undefined,
      };

      let endpoint = "https://yumlocator.onrender.com/restaurants";

      if (searchTerm.trim()) {
        endpoint = "https://yumlocator.onrender.com/restaurants/search";
      } else if (latitude && longitude) {
        endpoint = "https://yumlocator.onrender.com/location";
      }

      const response = await axios.get(endpoint, { params });
      setRestaurants(response.data.restaurants || response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setRestaurants([]);
      setTotalPages(1);
      setError("Error fetching restaurants");
    } finally {
      setLoading(false);
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedFetchRestaurants = debounce(fetchRestaurants, 500);

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get("https://yumlocator.onrender.com/cities");
        setCities(response.data);
      } catch (error) {
        setError("⚠️ Error fetching cities.");
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    debouncedFetchRestaurants();
    setPage(1);
  }, [searchTerm, selectedCity, latitude, longitude, radius]);

  useEffect(() => {
    fetchRestaurants();
  }, [page]);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("https://yumlocator.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setDetectedFood(data.detectedFood);
        setRestaurants(data.restaurants);
        setTotalPages(Math.ceil(data.restaurants.length / limit));
        setPage(1);
      } else {
        setError("Failed to process image");
      }
    } catch (error) {
      setError("Error uploading image");
    } finally {
      setLoading(false);
    }
  };

  const clearImageSearch = () => {
    setDetectedFood(null);
    setFile(null);
    setTimeout(fetchRestaurants, 300);
  };

  // Function to handle input changes for editable fields
  const handleInputChange = (field, value) => {
    switch (field) {
      case "city":
        setSelectedCity(value);
        break;
      case "latitude":
        setLatitude(value);
        break;
      case "longitude":
        setLongitude(value);
        break;
      case "radius":
        setRadius(value);
        break;
      default:
        break;
    }
    setEditingField(null); // Close the input field after setting the value
  };

  return (
    <div className="container">
      <header className="title-container">
        <img src="YumLocator.png" alt="YumLocator" className="logo"/>
        <h1 className="title">YumLocator</h1>
        </header>
      <div className="main-content">
        <div className="left-pane">
          <h2>Filters</h2>
          <div className="search-container">
            <ul className="filter-list">
              <li onClick={() => setEditingField("search")}>
                {searchTerm || "Restaurant Name"}
              </li>
              {editingField === "search" && (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={() => setEditingField(null)} // Hide input on blur
                  className="filter-input"
                  placeholder="Enter restaurant name"
                />
              )}
              <li onClick={() => setEditingField("city")}>
                {selectedCity || "City"}
              </li>
              {editingField === "city" && (
                <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="search-input"
              >
                <option value="">🏙️ Select City</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
    
              )}

              <li onClick={() => setEditingLatLng((prev) => !prev)}>
                {latitude && longitude
                  ? `📍 Latitude: ${latitude}, Longitude: ${longitude}, Radius: ${radius} m`
                  : "Latitude, Longitude & Radius"}
              </li>
              {editingLatLng && (
                <div className="lat-lng-inputs">
                  <input
                    type="text"
                    placeholder="Enter latitude"
                    value={latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    className="filter-input"
                  />
                  <input
                    type="text"
                    placeholder="Enter longitude"
                    value={longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    className="filter-input"
                  />
                  <input
                    type="number"
                    placeholder="Enter radius"
                    value={radius}
                    onChange={(e) => handleInputChange("radius", Number(e.target.value))}
                    className="filter-input"
                  />
                </div>
              )}

            </ul>

            <div className="upload-container">
              <input
                type="file"
                onClick={()=>{console.log('Upload button clicked');
                  handleUpload();
                }}
                onChange={(e) => setFile(e.target.files[0])}
                accept="image/*"
              />
              <button onClick={handleUpload}>Upload</button>
              {detectedFood && (
                <button onClick={clearImageSearch} className="clear-btn">
                  Clear Image Search
                </button>
              )}
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          {loading && <p className="loading-text">⏳ Loading restaurants...</p>}
        </div>

        <div className="restaurant-list-container">
          <ul className="restaurant-list">
            {restaurants.length === 0 && !loading ? (
              <p className="no-results">❌ No restaurants found.</p>
            ) : (
              restaurants.map((restaurant) => (
                <li key={restaurant.id || restaurant._id} className="restaurant-card">
                  {restaurant.featured_image && (
                    <img
                      src={restaurant.featured_image}
                      alt={restaurant.name}
                      className="restaurant-image"
                    />
                  )}
                  <h2 className="restaurant-name">{restaurant.name}</h2>
                  <p className="restaurant-city">
                    📍 {restaurant.location?.city || "Location not available"}
                  </p>
                  <p className="restaurant-rating">
                    ⭐ {restaurant.user_rating?.aggregate_rating || "N/A"}
                    ({restaurant.user_rating?.rating_text || "No rating"})
                  </p>
                  <Link
                    to={`/restaurant/${restaurant.id || restaurant._id}`}
                    className="details-btn"
                  >
                    View Details ➡️
                  </Link>
                </li>
              ))
            )}
          </ul>

          <div className="pagination">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
            >
              ⬅️ Previous
            </button>
            <span className="page-indicator">Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || loading}
            >
              Next ➡️
            </button>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Zomato Restaurant Finder. All rights reserved.</p>
        <p>
          <Link to="/about">About Us</Link> 
        </p>
      </footer>
    </div>
  );
};

export default RestaurantList;
