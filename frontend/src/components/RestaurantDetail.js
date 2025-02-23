import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "../styles/RestaurantDetail.module.css"; // Updated import

function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/restaurants/${id}`)
      .then(response => {
        if (response.data) {
          setRestaurant(response.data);
        } else {
          setError("Restaurant not found!");
        }
      })
      .catch(error => setError("Error fetching restaurant details!"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
      <div>
        <h1 className={styles.h1}>{restaurant.name || "Unknown"}</h1>
        <div className={styles.restaurantContainer}>
          <img src={restaurant.featured_image} alt="Restaurant" className={styles.restaurantImage} />
          <div className={styles.restaurantDetails}>
            <p><strong>Restaurant ID:</strong> {restaurant.id || "N/A"}</p>
            <p><strong>City:</strong> {restaurant.location.city || "N/A"}</p>
            <p><strong>Address:</strong> {restaurant.location.address || "N/A"}</p>
            <p><strong>Longitude:</strong> {restaurant.location.longitude || "N/A"}</p>
            <p><strong>Latitude:</strong> {restaurant.location.latitude || "N/A"}</p>
            <p><strong>Cuisines:</strong> {restaurant.cuisines || "N/A"}</p>
            <p><strong>Average Cost for Two:</strong> {restaurant.average_cost_for_two} {restaurant.currency || ""}</p>
            <p><strong>Price Range:</strong> {restaurant.price_range || "N/A"}</p>
            <p><strong>Aggregate Rating:</strong> {restaurant.user_rating.aggregate_rating} ⭐ ({restaurant.user_rating.rating_text})</p>
            <p><strong>Votes:</strong> {restaurant.user_rating.votes || "N/A"}</p>
            <p><a href={restaurant.url} target="_blank" rel="noopener noreferrer">View on Zomato</a></p>
          </div>
        </div>
      </div>
  
);

}

export default RestaurantDetail;
