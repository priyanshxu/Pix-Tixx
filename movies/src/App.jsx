import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminActions, userActions } from "./store";
import { Box } from "@mui/material"; // Import Box

// UI & Layout
import Header from "./components/Header";
import Footer from "./components/Footer";
import CityDialog from "./components/Shared/UI/CityDialog";

// Pages
import HomePage from "./components/HomePage";
import Movies from "./components/Movies/Movies";
import MoviePage from "./components/Movies/Moviepage";
import ShowSelection from "./components/Bookings/ShowSelection";
import AdminDataEntry from "./components/Admin/AdminDataEntry";
import Auth from "./components/Auth/Auth";
import UserProfile from "./components/Profile/UserProfile";
import Ticket from "./components/Profile/Ticket";
import Booking from "./components/Bookings/Booking";
import AdminLogin from "./components/Admin/Admin";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AddMovie from "./components/Movies/AddMovie"
import EditMovie from "./components/Admin/EditMovie";
import Marketplace from "./components/Resale/Marketplace";
import Checkout from "./components/Bookings/Checkout";
import About from "./components/About";
import Contact from "./components/Contact";
import RefundPolicy from "./components/RefundPolicy";
import Privacy from "./components/Privacy";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);
  const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);

  const isAdminRoute = location.pathname.startsWith("/admin");

  const [isCityOpen, setCityOpen] = useState(false);
  const [userCity, setUserCity] = useState(localStorage.getItem("userCityName"));

  useEffect(() => {
    if (localStorage.getItem("userId")) {
      dispatch(userActions.login());
    } else if (localStorage.getItem("adminId")) {
      dispatch(adminActions.login());
    }
  }, [dispatch]);

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
    // Changed <div> to <Box> with explicit black background and min-height
    <Box sx={{ bgcolor: "#000000", minHeight: "100vh", color: "white" }}>

      <ScrollToTop />

      {!isAdminRoute && (
        <Header onCityClick={() => setCityOpen(true)} />
      )}

      <CityDialog
        open={isCityOpen}
        onClose={() => setCityOpen(false)}
        onSelectCity={handleCitySelect}
      />

      <section style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/auth" element={<Auth />} />

          <Route path="/movie/:id/shows" element={<ShowSelection />} />
          <Route path="/booking/show/:id" element={<Booking />} />
          <Route path="/booking/:id" element={<Booking />} />

          <Route path="/user" element={<UserProfile />} />
          <Route path="/user/ticket/:id" element={<Ticket />} />

          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/add" element={<AddMovie />} />
          <Route path="/admin/edit/:id" element={<EditMovie />} />
          <Route path="/admin/config" element={<AdminDataEntry />} />
          <Route path="/resale/market" element={<Marketplace />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </section>
      {!isAdminRoute && <Footer />}
    </Box>
  );
}

export default App;