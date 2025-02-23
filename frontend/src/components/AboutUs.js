import React from 'react';
import '../styles/AboutUs.css'; // Import your CSS styles

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <h1 className="about-us-title">About Us</h1>
      <p className="about-us-description">
        Welcome to Zomato Restaurant Finder! Our mission is to help food lovers discover 
        the best restaurants in their area. Whether you are looking for a cozy café, a 
        fine dining experience, or a quick bite, we have got you covered.
      </p>
      <h2 className="about-us-subtitle">Get Involved</h2>
      <p className="about-us-description">
        We love hearing from our users! If you have any feedback, suggestions, or just want 
        to say hello, feel free to <a href="/contact" className="contact-link">contact us</a>.
      </p>
    </div>
  );
};

export default AboutUs;
