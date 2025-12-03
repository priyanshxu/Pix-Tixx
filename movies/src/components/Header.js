import React, { useEffect, useState } from "react";
import {
    AppBar,
    Autocomplete,
    Box,
    Tab,
    Tabs,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getAllMovies } from "../api-helpers/api-helpers";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useDispatch, useSelector } from "react-redux";
import { adminActions, userActions } from "../store";

// Ensure this path is correct
import logo from "../assets/logo.png";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // Hook to track URL changes

    const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);
    const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);

    const [value, setValue] = useState(0); // 0 = Movies
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        getAllMovies()
            .then((data) => setMovies(data.movies))
            .catch((err) => console.log(err));
    }, []);

    // 🔴 FIX: Sync Tab Highlight with URL Path
    useEffect(() => {
        const path = location.pathname;

        if (path === "/" || path === "/movies") {
            setValue(0);
        } else if (path === "/admin" && !isAdminLoggedIn) {
            setValue(1);
        } else if (path === "/auth") {
            setValue(2);
        } else if (path === "/user") {
            setValue(1); // User Profile
        } else if (path === "/admin/dashboard" || path === "/admin") {
            setValue(1); // Admin Profile
        } else if (path === "/movies/add") {
            setValue(0); // Add Movie (Admin)
        }
    }, [location, isAdminLoggedIn, isUserLoggedIn]);

    const logout = (isAdmin) => {
        dispatch(isAdmin ? adminActions.logout() : userActions.logout());
    };

    const handleTabChange = (e, val) => {
        setValue(val);
    };

    // --- STYLES ---
    const searchStyle = {
        width: "300px",
        backgroundColor: "rgba(255, 255, 255, 0.15)", // Slightly lighter glass
        backdropFilter: "blur(10px)",
        borderRadius: "50px", // Full pill shape
        padding: "6px 20px",
        display: "flex",
        alignItems: "center",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            width: "320px" // Subtle expansion on hover
        }
    };

    return (
        <AppBar
            position="sticky"
            sx={{
                background: "linear-gradient(180deg, #141414 0%, #000000 100%)", // Premium Dark Theme
                boxShadow: "0px 10px 30px rgba(0,0,0,0.7)",
                borderBottom: "1px solid #333",
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1.5 }}>

                {/* --- 1. BRANDING / LOGO --- */}
                <Box display="flex" alignItems="center" gap={2} width="25%">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img
                            src={logo}
                            alt="Pix-Tix Logo"
                            style={{ height: "45px", borderRadius: "50%", border: "2px solid #e50914" }}
                        />
                        <Typography
                            variant="h5"
                            sx={{
                                ml: 1.5,
                                fontWeight: "800",
                                letterSpacing: "1px",
                                color: "#e50914", // Solid Brand Red looks cleaner than gradient on dark
                                display: { xs: "none", md: "block" },
                                fontFamily: "'Roboto', sans-serif"
                            }}
                        >
                            PIX-TIX
                        </Typography>
                    </Link>
                </Box>

                {/* --- 2. MODERN SEARCH BAR --- */}
                <Box width="40%" display="flex" justifyContent="center">
                    <Autocomplete
                        freeSolo
                        options={movies && movies.map((option) => option.title)}
                        onChange={(event, newValue) => {
                            const movie = movies.find(m => m.title === newValue);
                            if (movie) navigate(`/booking/${movie._id}`);
                        }}
                        renderInput={(params) => (
                            <Box sx={searchStyle}>
                                <SearchIcon sx={{ color: "#aaa", mr: 1 }} />
                                <TextField
                                    {...params}
                                    variant="standard"
                                    placeholder="Search for movies..."
                                    InputProps={{
                                        ...params.InputProps,
                                        disableUnderline: true,
                                        style: { color: "white", fontSize: "0.95rem" },
                                    }}
                                />
                            </Box>
                        )}
                    />
                </Box>

                {/* --- 3. NAVIGATION TABS --- */}
                <Box display="flex" width="auto">
                    <Tabs
                        textColor="inherit"
                        indicatorColor="secondary" // We override this via sx below
                        value={value}
                        onChange={handleTabChange}
                        sx={{
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#e50914", // THE RED LINE
                                height: "3px",
                                borderRadius: "2px"
                            },
                            "& .MuiTab-root": {
                                fontWeight: "600",
                                fontSize: "0.95rem",
                                textTransform: "none",
                                color: "#aaa",
                                minWidth: "80px",
                                transition: "0.3s",
                                "&:hover": { color: "white" },
                                "&.Mui-selected": { color: "#e50914" } // Active text becomes Red
                            }
                        }}
                    >
                        {/* 0: Movies (Always Visible) */}
                        <Tab LinkComponent={Link} to="/movies" label="Movies" />

                        {/* Guest View */}
                        {!isAdminLoggedIn && !isUserLoggedIn && (
                            <Tab LinkComponent={Link} to="/admin" label="Admin" />
                        )}
                        {!isAdminLoggedIn && !isUserLoggedIn && (
                            <Tab LinkComponent={Link} to="/auth" label="Login" />
                        )}

                        {/* User View */}
                        {isUserLoggedIn && (
                            <Tab LinkComponent={Link} to="/user" label="Profile" />
                        )}
                        {isUserLoggedIn && (
                            <Tab
                                onClick={() => logout(false)}
                                LinkComponent={Link}
                                to="/"
                                label="Logout"
                            />
                        )}

                        {/* Admin View */}
                        {isAdminLoggedIn && (
                            <Tab LinkComponent={Link} to="/movies/add" label="Add Movie" />
                        )}
                        {isAdminLoggedIn && (
                            <Tab LinkComponent={Link} to="/admin/dashboard" label="Dashboard" />
                        )}
                        {isAdminLoggedIn && (
                            <Tab
                                onClick={() => logout(true)}
                                LinkComponent={Link}
                                to="/"
                                label="Logout"
                            />
                        )}
                    </Tabs>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;