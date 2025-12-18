import React, { useEffect, useState } from "react";
import {
    AppBar, Autocomplete, Box, Tab, Tabs, TextField, Toolbar, Typography, InputAdornment, Button, Slide, useScrollTrigger, Avatar
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import StorefrontIcon from '@mui/icons-material/Storefront'; // Marketplace Icon
import { getAllMovies } from "../api-helpers/api-helpers";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminActions, userActions } from "../store";
import axios from "axios";
import logo from "../assets/logo.png";

// --- HIDE ON SCROLL LOGIC ---
function HideOnScroll(props) {
    const { children, window } = props;
    const trigger = useScrollTrigger({ target: window ? window() : undefined });
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}
const BASE_URL = process.env.REACT_APP_API_URL


const Header = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);
    const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);

    const [value, setValue] = useState(0);
    const [movies, setMovies] = useState([]);
    const [userCity, setUserCity] = useState(localStorage.getItem("userCityName") || "Select City");
    const [userName, setUserName] = useState("");

    // --- TYPEWRITER EFFECT STATE (omitted for brevity) ---
    const [placeholderText, setPlaceholderText] = useState("");
    const placeholders = ["Search for 'Avengers'...", "Try 'Romantic Movies'...", "Find 'Action'...", "Search Movies..."];

    useEffect(() => {
        let loopNum = 0;
        let isDeleting = false;
        let text = '';
        let delta = 150;

        const tick = () => {
            let i = loopNum % placeholders.length;
            let fullText = placeholders[i];
            text = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1);
            setPlaceholderText(text);

            if (!isDeleting && text === fullText) {
                delta = 2000;
                isDeleting = true;
            } else if (isDeleting && text === '') {
                isDeleting = false;
                loopNum++;
                delta = 150;
            } else {
                delta = isDeleting ? 50 : 100;
            }
        };

        const ticker = setInterval(tick, delta);
        return () => clearInterval(ticker);
    }, []);
    // --- END TYPEWRITER EFFECT STATE ---

    // Fetch User Details for Greeting
    useEffect(() => {
        if (isUserLoggedIn) {
            const userId = localStorage.getItem("userId");
            if (userId) {
                axios.get(`/user/${userId}`)
                    .then(res => {
                        const firstName = res.data.user.name.split(" ")[0];
                        setUserName(firstName);
                    })
                    .catch(e => console.log(e));
            }
        }
    }, [isUserLoggedIn]);

    // Handle City & Movie Updates
    useEffect(() => {
        const handleStorageChange = () => setUserCity(localStorage.getItem("userCityName") || "Select City");
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener("cityUpdated", handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener("cityUpdated", handleStorageChange);
        };
    }, []);

    useEffect(() => {
        getAllMovies().then((data) => setMovies(data.movies)).catch((err) => console.log(err));
    }, []);

    // FIX: Sync Tabs
    useEffect(() => {
        const path = location.pathname;
        if (path === "/" || path === "/movies" || path === "/movies/add") {
            setValue(0); // Movies is Index 0
        } else if (path === "/resale/market") {
            setValue(1); // Marketplace is Index 1
        } else if (path === "/auth" || path === "/user" || path === "/admin/dashboard" || path === "/admin") {
            // Profile/Dashboard/Login Group is Index 2
            setValue(2);
        } else {
            setValue(0);
        }
    }, [location]);

    // Note: Logout button is now removed from here and placed in UserProfile.js

    return (
        <HideOnScroll {...props}>
            <AppBar position="sticky" sx={{ background: "rgba(20, 20, 20, 0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>

                    {/* 1. BRANDING */}
                    <Box display="flex" alignItems="center" gap={1} width="20%">
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                            <img src={logo} alt="Pix-Tix" style={{fontFamily: "Poppins", height: "40px", borderRadius: "50%", border: "2px solid #e50914" }} />
                            <Typography variant="h5" sx={{ ml: 1.5, fontWeight: "800", letterSpacing: "1px", color: "#e50914", fontFamily: "'Poppins', sans-serif" }}>
                                PIX-TIX
                            </Typography>
                        </Link>
                    </Box>

                    {/* 2. SEARCH & LOCATION */}
                    <Box display="flex" alignItems="center" gap={2} width="50%" justifyContent="center">
                        <Button
                            onClick={props.onCityClick}
                            startIcon={<LocationOnIcon sx={{ color: "#e50914" }} />}
                            endIcon={<ArrowDropDownIcon sx={{ color: "#777" }} />}
                            sx={{
                                color: '#fff', textTransform: 'none',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '50px', px: 2, py: 0.5,
                                fontFamily: "'Poppins', sans-serif",
                                '&:hover': { borderColor: '#e50914', bgcolor: 'rgba(229, 9, 20, 0.1)' }
                            }}
                        >
                            {userCity}
                        </Button>

                        <Autocomplete
                            freeSolo options={movies} getOptionLabel={(option) => option.title || ""}
                            onChange={(event, value) => { if (value && value._id) navigate(`/movie/${value._id}`); }}
                            componentsProps={{ paper: { sx: { bgcolor: "#1a1a1a", color: "white", border: "1px solid #333" } } }}
                            renderOption={(props, option) => (
                                <Box component="li" {...props} sx={{ display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#1a1a1a', color: 'white', borderBottom: '1px solid #333', p: 1, '&:hover': { bgcolor: '#333 !important' } }}>
                                    <img src={option.posterUrl} alt={option.title} style={{ width: 30, height: 45, objectFit: 'cover', borderRadius: 4 }} />
                                    <Typography variant="body2" fontFamily="'Poppins', sans-serif">{option.title}</Typography>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField {...params}
                                    placeholder={placeholderText}
                                    variant="standard"
                                    sx={{
                                        width: "280px", bgcolor: "rgba(255,255,255,0.1)", borderRadius: "50px", px: 2, py: 0.5,
                                        "& .MuiInput-root": { color: "white", fontFamily: "'Poppins', sans-serif", "&:before, &:after": { display: "none" } }
                                    }}
                                    InputProps={{ ...params.InputProps, disableUnderline: true, startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "#888" }} /></InputAdornment>) }}
                                />
                            )}
                        />
                    </Box>

                    {/* 3. NAVIGATION TABS (Movies, Marketplace, Profile/Login/Admin) */}
                    <Box display="flex" alignItems="center" gap={3} width="auto">
                        <Tabs value={value} onChange={(e, val) => setValue(val)} textColor="inherit" indicatorColor="secondary" sx={{ "& .MuiTabs-indicator": { backgroundColor: "#e50914" } }}>

                            {/* Index 0: Movies */}
                            <Tab LinkComponent={Link} to="/movies" label="Movies" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: 'none' }} />

                            {/* Index 1: Marketplace */}
                            <Tab
                                LinkComponent={Link}
                                to="/resale/market"
                                label="Marketplace"
                                icon={<StorefrontIcon fontSize="small" />}
                                iconPosition="start"
                                sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: 'none', minHeight: 'auto' }}
                            />

                            {/* Index 2: Dynamic Profile/Dashboard/Login Button Group */}
                            {isAdminLoggedIn && <Tab LinkComponent={Link} to="/admin/dashboard" label="Dashboard" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: 'none' }} />}
                            {isUserLoggedIn && (
                                <Link to="/user" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Box textAlign="right" sx={{ display: { xs: 'none', md: 'block' } }}>
                                        <Typography variant="caption" color="#aaa" display="block" fontFamily="'Poppins', sans-serif">Hello,</Typography>
                                        <Typography variant="body2" color="white" fontWeight="bold" fontFamily="'Poppins', sans-serif">{userName || "User"}</Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: "#e50914", width: 35, height: 35, fontSize: "1rem", fontWeight: "bold" }}>
                                        {userName ? userName[0] : "U"}
                                    </Avatar>
                                </Link>
                            )}
                            {!isUserLoggedIn && !isAdminLoggedIn && <Tab LinkComponent={Link} to="/auth" label="Login" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: 'none' }} />}
                        </Tabs>

                    </Box>

                </Toolbar>
            </AppBar>
        </HideOnScroll>
    );
};

export default Header;