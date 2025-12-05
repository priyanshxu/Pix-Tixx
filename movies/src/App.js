import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import Movies from "./components/Movies/Movies";
import Admin from "./components/Admin/Admin";
import Auth from "./components/Auth/Auth";
import AdminDashboard from "./components/Admin/AdminDashboard.js";
import UserProfile from "./components/Profile/UserProfile.js";
import Ticket from "./components/Profile/Ticket.js";
import AdminLogin from "./components/Admin/Admin";
import Booking from "./components/Bookings/Booking.js";
import MoviePage from "./components/Movies/Moviepage.js";
import AddMovie from "./components/Movies/AddMovie.js";
import EditMovie from "./components/Admin/EditMovie.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { adminActions, userActions } from "./store";

function App() {
  const dispatch = useDispatch();
  const isAdminLoggedIn = useSelector((state)=> state.admin.isLoggedIn);
  const isUserLoggedIn = useSelector((state)=> state.user.isLoggedIn);
  console.log("isAdminLoggedIn", isAdminLoggedIn);
  console.log("isUserLoggedIn", isUserLoggedIn);
  useEffect(()=> { 
    if(localStorage.getItem("userId")){
      dispatch(userActions.login())
    }else if(localStorage.getItem("adminId")){
      dispatch(adminActions.login());
    }
  }, [dispatch]);
  return (
    <div>
      <Header/>
      <section>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/movies" element={<Movies />} />
          <Route path="/admin/add" element={<AddMovie />} />
          <Route path="/admin" element={<Admin/>}/>
          <Route path="/auth" element={<Auth />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/user/ticket/:id" element={<Ticket />} />
          <Route path="/admin/edit/:id" element={<EditMovie />} />
          <Route path="/movie/:id" element={<MoviePage />} />
        </Routes>
      </section>
    </div>
  );
}

export default App;
// hello