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
    InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getAllMovies } from "../api-helpers/api-helpers";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminActions, userActions } from "../store";

import logo from "../assets/logo.png";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);
    const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);

    const [value, setValue] = useState(0);
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        getAllMovies()
            .then((data) => setMovies(data.movies))
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        const path = location.pathname;
        if (path === "/" || path === "/movies") {
            setValue(0);
        } else if (path === "/admin" && !isAdminLoggedIn) {
            setValue(1);
        } else if (path === "/auth") {
            setValue(2);
        } else if (path === "/user") {
            setValue(1);
        } else if (path === "/admin/dashboard" || path === "/admin") {
            setValue(1);
        } else if (path === "/movies/add") {
            setValue(0);
        }
    }, [location, isAdminLoggedIn, isUserLoggedIn]);

    const logout = (isAdmin) => {
        dispatch(isAdmin ? adminActions.logout() : userActions.logout());
    };

    const handleTabChange = (e, val) => {
        setValue(val);
    };

    return (
        <AppBar
            position="sticky"
            sx={{
                background: "linear-gradient(180deg, #141414 0%, #000000 100%)",
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
                                color: "#e50914",
                                display: { xs: "none", md: "block" },
                                fontFamily: "'Roboto', sans-serif"
                            }}
                        >
                            PIX-TIX
                        </Typography>
                    </Link>
                </Box>

                {/* --- 2. MODERN SEARCH BAR --- */}
                <Box width="40%">
                    <Autocomplete
                        freeSolo
                        options={movies}
                        getOptionLabel={(option) => option.title || ""}

                        // Handle Selection
                        onChange={(event, value) => {
                            if (value && value._id) {
                                navigate(`/movie/${value._id}`);
                            }
                        }}

                        // 👇 FIX: Style the Dropdown Container (Paper) to be Dark
                        componentsProps={{
                            paper: {
                                sx: {
                                    bgcolor: "#1a1a1a", // Dark Background for the whole list
                                    color: "white",     // White Text
                                    border: "1px solid #333",
                                    borderRadius: "10px",
                                    boxShadow: "0px 10px 30px rgba(0,0,0,0.8)",
                                    "& .MuiAutocomplete-listbox": {
                                        padding: 0 // Remove default padding that creates white gaps
                                    }
                                }
                            }
                        }}

                        // Custom Render for Suggestions
                        renderOption={(props, option) => (
                            <Box
                                component="li"
                                {...props}
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    alignItems: 'center',
                                    bgcolor: '#1a1a1a',
                                    color: 'white',
                                    borderBottom: '1px solid #333',
                                    padding: '10px 15px',
                                    '&:hover': { bgcolor: '#333 !important' }, // Hover effect
                                    '&[aria-selected="true"]': { bgcolor: '#333 !important' } // Keyboard selection
                                }}
                            >
                                <img
                                    src={option.posterUrl}
                                    alt={option.title}
                                    style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }}
                                />
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">{option.title}</Typography>
                                    <Typography variant="caption" color="gray">
                                        {new Date(option.releaseDate).getFullYear()} • {option.featured ? "Trending" : "Movie"}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search movies..."
                                variant="outlined"
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.15)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: "50px",
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "50px",
                                        color: "white",
                                        paddingLeft: "20px",
                                        "& fieldset": { borderColor: "transparent" },
                                        "&:hover fieldset": { borderColor: "#e50914" },
                                    }
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#aaa" }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />
                </Box>

                {/* --- 3. NAVIGATION TABS --- */}
                <Box display="flex" width="auto">
                    <Tabs
                        textColor="inherit"
                        indicatorColor="secondary"
                        value={value}
                        onChange={handleTabChange}
                        sx={{
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#e50914",
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
                                "&.Mui-selected": { color: "#e50914" }
                            }
                        }}
                    >
                        <Tab LinkComponent={Link} to="/movies" label="Movies" />

                        {!isAdminLoggedIn && !isUserLoggedIn && (
                            <>
                                <Tab LinkComponent={Link} to="/admin" label="Admin" />
                                <Tab LinkComponent={Link} to="/auth" label="Login" />
                            </>
                        )}

                        {isUserLoggedIn && (
                            <>
                                <Tab LinkComponent={Link} to="/user" label="Profile" />
                                <Tab
                                    onClick={() => logout(false)}
                                    LinkComponent={Link}
                                    to="/"
                                    label="Logout"
                                />
                            </>
                        )}

                        {isAdminLoggedIn && (
                            <>
                                <Tab LinkComponent={Link} to="/movies/add" label="Add Movie" />
                                <Tab LinkComponent={Link} to="/admin/dashboard" label="Dashboard" />
                                <Tab
                                    onClick={() => logout(true)}
                                    LinkComponent={Link}
                                    to="/"
                                    label="Logout"
                                />
                            </>
                        )}
                    </Tabs>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;