import React from 'react';
import { Route, Routes } from 'react-router-dom';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './components/RestaurantDetail';
import AboutUs from './components/AboutUs';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<RestaurantList />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </div>
  );
};

export default App;
