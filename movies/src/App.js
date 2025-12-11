import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminActions, userActions } from "./store";

// UI & Layout
import Header from "./components/Header";
import Footer from "./components/Footer";
import CityDialog from "./components/Shared/UI/CityDialog"; // New City Selector

// Pages
import HomePage from "./components/HomePage";
import Movies from "./components/Movies/Movies";
import MoviePage from "./components/Movies/Moviepage"; // New Movie Details Page
import ShowSelection from "./components/Bookings/ShowSelection"; // New Show Selector
import AdminDataEntry from "./components/Admin/AdminDataEntry";
// Auth
import Auth from "./components/Auth/Auth";

// User Profile
import UserProfile from "./components/Profile/UserProfile";
import Ticket from "./components/Profile/Ticket";

// Booking
import Booking from "./components/Bookings/Booking";

// Admin
import AdminLogin from "./components/Admin/Admin";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AddMovie from "./components/Movies/AddMovie"
import EditMovie from "./components/Admin/EditMovie";
import Marketplace from "./components/Resale/Marketplace";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);
  const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);

  // Check if we are on an admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  // City Dialog Logic
  const [isCityOpen, setCityOpen] = useState(false);
  const [userCity, setUserCity] = useState(localStorage.getItem("userCityName"));

  useEffect(() => {
    // Check Auth Status on Load
    if (localStorage.getItem("userId")) {
      dispatch(userActions.login());
    } else if (localStorage.getItem("adminId")) {
      dispatch(adminActions.login());
    }
  }, [dispatch]);

  // Open city dialog on first visit (if not admin)
  useEffect(() => {
    if (!userCity && !isAdminRoute) {
      setCityOpen(true);
    }
  }, [userCity, isAdminRoute]);

  const handleCitySelect = (cityName) => {
    setUserCity(cityName);
    setCityOpen(false);
  };

  return (
    <div>
      {/* Header with City Selector Trigger */}
      {!isAdminRoute && (
        <Header onCityClick={() => setCityOpen(true)} />
      )}

      {/* City Selection Modal */}
      <CityDialog
        open={isCityOpen}
        onClose={() => setCityOpen(false)}
        onSelectCity={handleCitySelect}
      />

      <section style={{ minHeight: '80vh' }}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MoviePage />} /> {/* New Movie Details */}
          <Route path="/auth" element={<Auth />} />

          {/* --- BOOKING FLOW --- */}
          {/* Step 1: Select Show (Time & Theatre) */}
          <Route path="/movie/:id/shows" element={<ShowSelection />} />
          {/* Step 2: Select Seats (Using Show ID) */}
          <Route path="/booking/show/:id" element={<Booking />} />
          {/* Legacy Route Support (Optional, redirects to home or handle error) */}
          <Route path="/booking/:id" element={<Booking />} />

          {/* --- USER ROUTES --- */}
          <Route path="/user" element={<UserProfile />} />
          <Route path="/user/ticket/:id" element={<Ticket />} />

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/add" element={<AddMovie />} />
          <Route path="/admin/edit/:id" element={<EditMovie />} />
          <Route path="/admin/config" element={<AdminDataEntry />} />
          <Route path="/resale/market" element = {<Marketplace />}/>
        </Routes>
      </section>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;