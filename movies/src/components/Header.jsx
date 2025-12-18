import React, { useEffect, useState } from "react";
import {
    AppBar, Autocomplete, Box, Tab, Tabs, TextField, Toolbar, Typography, InputAdornment, Button, Slide, useScrollTrigger, Avatar, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MenuIcon from '@mui/icons-material/Menu'; // Hamburger Icon
import CloseIcon from '@mui/icons-material/Close'; // Close Icon
import MovieIcon from '@mui/icons-material/Movie';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LoginIcon from '@mui/icons-material/Login';

import { getAllMovies } from "../api-helpers/api-helpers";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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

const Header = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);
    const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);

    const [value, setValue] = useState(0);
    const [movies, setMovies] = useState([]);
    const [userCity, setUserCity] = useState(localStorage.getItem("userCityName") || "Select City");
    const [userName, setUserName] = useState("");

    // Mobile Drawer State
    const [mobileOpen, setMobileOpen] = useState(false);

    // --- TYPEWRITER EFFECT STATE ---
    const [placeholderText, setPlaceholderText] = useState("");
    const placeholders = ["Search 'Avengers'...", "Try 'Action'...", "Find Movies..."];

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

    // Fetch User Details
    useEffect(() => {
        if (isUserLoggedIn) {
            const userId = localStorage.getItem("userId");
            if (userId) {
                // Use VITE_API_URL logic here if you updated index.js, or direct .env access
                const API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:5000";
                axios.get(`${API_URL}/user/${userId}`)
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

    // Sync Tabs with URL
    useEffect(() => {
        const path = location.pathname;
        if (path === "/" || path === "/movies") setValue(0);
        else if (path === "/resale/market") setValue(1);
        else if (["/auth", "/user", "/admin/dashboard"].some(p => path.startsWith(p))) setValue(2);
        else setValue(0);
    }, [location]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // --- DRAWER CONTENT (Mobile Menu) ---
    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', height: '100%', bgcolor: '#141414', color: 'white' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #333">
                <Box display="flex" alignItems="center" gap={1}>
                    <img src={logo} alt="Logo" style={{ height: "30px", borderRadius: "50%" }} />
                    <Typography variant="h6" sx={{ color: "#e50914", fontWeight: "bold", fontFamily: "'Poppins', sans-serif" }}>
                        PIX-TIX
                    </Typography>
                </Box>
                <CloseIcon sx={{ color: '#fff' }} />
            </Box>
            <List>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/movies">
                        <ListItemIcon><MovieIcon sx={{ color: '#e50914' }} /></ListItemIcon>
                        <ListItemText primary="Movies" primaryTypographyProps={{ fontFamily: "'Poppins', sans-serif" }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/resale/market">
                        <ListItemIcon><StorefrontIcon sx={{ color: '#e50914' }} /></ListItemIcon>
                        <ListItemText primary="Marketplace" primaryTypographyProps={{ fontFamily: "'Poppins', sans-serif" }} />
                    </ListItemButton>
                </ListItem>
                <Divider sx={{ bgcolor: '#333', my: 1 }} />

                {isAdminLoggedIn && (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/admin/dashboard">
                            <ListItemIcon><DashboardIcon sx={{ color: '#e50914' }} /></ListItemIcon>
                            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontFamily: "'Poppins', sans-serif" }} />
                        </ListItemButton>
                    </ListItem>
                )}

                {isUserLoggedIn ? (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/user">
                            <ListItemIcon>
                                <Avatar sx={{ width: 24, height: 24, bgcolor: '#e50914', fontSize: 12 }}>{userName[0]}</Avatar>
                            </ListItemIcon>
                            <ListItemText primary={`Profile (${userName})`} primaryTypographyProps={{ fontFamily: "'Poppins', sans-serif" }} />
                        </ListItemButton>
                    </ListItem>
                ) : (
                    !isAdminLoggedIn && (
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/auth">
                                <ListItemIcon><LoginIcon sx={{ color: '#e50914' }} /></ListItemIcon>
                                <ListItemText primary="Login" primaryTypographyProps={{ fontFamily: "'Poppins', sans-serif" }} />
                            </ListItemButton>
                        </ListItem>
                    )
                )}
            </List>
        </Box>
    );

    // ✅ FIX: Separated AppBar and Drawer. 
    // AppBar is inside HideOnScroll. Drawer is outside.
    return (
        <>
            <HideOnScroll {...props}>
                <AppBar position="sticky" sx={{ background: "rgba(20, 20, 20, 0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
                    <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>

                        {/* 1. BRANDING & HAMBURGER (Mobile) */}
                        <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 2, display: { md: 'none' }, color: '#e50914' }}
                            >
                                <MenuIcon />
                            </IconButton>

                            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                                <img src={logo} alt="Pix-Tix" style={{ height: "40px", borderRadius: "50%", border: "2px solid #e50914" }} />
                                <Typography variant="h5" sx={{ ml: 1.5, fontWeight: "800", letterSpacing: "1px", color: "#e50914", fontFamily: "'Poppins', sans-serif", display: { xs: 'none', sm: 'block' } }}>
                                    PIX-TIX
                                </Typography>
                            </Link>
                        </Box>

                        {/* 2. SEARCH & LOCATION (Responsive) */}
                        <Box display="flex" alignItems="center" gap={1} width={{ xs: "60%", md: "50%" }} justifyContent="center">
                            <Button
                                onClick={props.onCityClick}
                                startIcon={<LocationOnIcon sx={{ color: "#e50914" }} />}
                                sx={{
                                    color: '#fff', textTransform: 'none',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '50px', px: { xs: 1, md: 2 }, py: 0.5,
                                    fontSize: { xs: '0.7rem', md: '0.9rem' },
                                    minWidth: 'auto',
                                    fontFamily: "'Poppins', sans-serif",
                                    '&:hover': { borderColor: '#e50914', bgcolor: 'rgba(229, 9, 20, 0.1)' }
                                }}
                            >
                                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{userCity}</Box>
                                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{userCity.split(' ')[0]}</Box>
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
                                            width: { xs: "120px", sm: "200px", md: "280px" },
                                            bgcolor: "rgba(255,255,255,0.1)", borderRadius: "50px", px: 2, py: 0.5,
                                            "& .MuiInput-root": { color: "white", fontSize: { xs: "0.8rem", md: "1rem" }, fontFamily: "'Poppins', sans-serif", "&:before, &:after": { display: "none" } }
                                        }}
                                        InputProps={{ ...params.InputProps, disableUnderline: true, startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "#888", fontSize: "1.2rem" }} /></InputAdornment>) }}
                                    />
                                )}
                            />
                        </Box>

                        {/* 3. DESKTOP NAVIGATION (Hidden on Mobile) */}
                        <Box display={{ xs: 'none', md: 'flex' }} alignItems="center" gap={3}>
                            <Tabs value={value} onChange={(e, val) => setValue(val)} textColor="inherit" indicatorColor="secondary" sx={{ "& .MuiTabs-indicator": { backgroundColor: "#e50914" } }}>
                                <Tab LinkComponent={Link} to="/movies" label="Movies" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: 'none' }} />
                                <Tab LinkComponent={Link} to="/resale/market" label="Marketplace" icon={<StorefrontIcon fontSize="small" />} iconPosition="start" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: 'none', minHeight: 'auto' }} />

                                {isAdminLoggedIn && <Tab LinkComponent={Link} to="/admin/dashboard" label="Dashboard" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: 'none' }} />}

                                {!isUserLoggedIn && !isAdminLoggedIn && <Tab LinkComponent={Link} to="/auth" label="Login" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: 'none' }} />}
                            </Tabs>

                            {isUserLoggedIn && (
                                <Link to="/user" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Box textAlign="right">
                                        <Typography variant="caption" color="#aaa" display="block" fontFamily="'Poppins', sans-serif">Hello,</Typography>
                                        <Typography variant="body2" color="white" fontWeight="bold" fontFamily="'Poppins', sans-serif">{userName || "User"}</Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: "#e50914", width: 35, height: 35, fontSize: "1rem", fontWeight: "bold" }}>
                                        {userName ? userName[0] : "U"}
                                    </Avatar>
                                </Link>
                            )}
                        </Box>

                    </Toolbar>
                </AppBar>
            </HideOnScroll>

            {/* MOBILE DRAWER (Moved Outside) */}
            <Box component="nav">
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, bgcolor: '#141414', borderRight: '1px solid #333' },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>
        </>
    );
};

export default Header;