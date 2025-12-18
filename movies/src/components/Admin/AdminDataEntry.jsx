import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, Container, Paper, Tabs, Tab,
    MenuItem, Select, InputLabel, FormControl, Grid, Divider, Chip
} from '@mui/material';
import axios from 'axios';
import SeatConfigurator from './SeatConfigurator';
import { CustomSnackbar } from '../Shared/UI/Feedback'; // Import the custom feedback component

// Icons
import LocationCityIcon from '@mui/icons-material/LocationCity';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import ChairIcon from '@mui/icons-material/Chair';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';

const AdminDataEntry = () => {
    const [tab, setTab] = useState(0);

    // --- ALERT STATE (Replaces window.alert) ---
    const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "info" });

    // --- STATE FOR DATA FETCHING ---
    const [cities, setCities] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [screens, setScreens] = useState([]);
    const [movies, setMovies] = useState([]);

    // --- FORM STATES ---
    const [cityForm, setCityForm] = useState({ name: "", code: "" });
    const [theatreForm, setTheatreForm] = useState({ name: "", location: "", cityId: "" });
    const [screenForm, setScreenForm] = useState({ name: "", theatreId: "" });
    const [seatConfig, setSeatConfig] = useState([]);
    const [showForm, setShowForm] = useState({ movieId: "", screenId: "", startTime: "", price: "" });

    // --- INITIAL DATA LOAD ---
    useEffect(() => {
        fetchCities();
        fetchMovies();
    }, []);

    const fetchCities = () => axios.get(`/admin/config/city`).then(res => setCities(res.data.cities || []));
    const fetchMovies = () => axios.get(`/movie`).then(res => setMovies(res.data.movies || []));

    const fetchTheatres = (cityId) => {
        if (cityId) {
            axios.get(`/admin/config/city/${cityId}/theatres`)
                .then(res => setTheatres(res.data.theatres || []))
                .catch(err => console.error("Error fetching theatres:", err));
        } else {
            setTheatres([]);
        }
    };

    // --- HELPER: SHOW ALERT ---
    const showAlert = (message, severity = "success") => {
        setAlertInfo({ open: true, message, severity });
    };

    const handleCloseAlert = () => {
        setAlertInfo({ ...alertInfo, open: false });
    };

    // --- HANDLERS (Updated to use showAlert) ---
    const handleAddCity = async () => {
        try {
            await axios.post(`/admin/config/city`, cityForm);
            showAlert("City Added Successfully!", "success");
            fetchCities();
            setCityForm({ name: "", code: "" });
        } catch (err) {
            showAlert("Error adding city. Please try again.", "error");
        }
    };

    const handleAddTheatre = async () => {
        if (!theatreForm.cityId) return showAlert("Please select a city.", "warning");
        try {
            await axios.post(`/admin/config/theatre`, theatreForm);
            showAlert("Theatre Added Successfully!", "success");
            setTheatreForm({ name: "", location: "", cityId: "" });
        } catch (err) {
            showAlert("Error adding theatre.", "error");
        }
    };

    const handleAddScreen = async () => {
        if (!screenForm.theatreId) return showAlert("Please select a theatre.", "warning");
        if (seatConfig.length === 0) return showAlert("Please configure the seat layout.", "warning");
        try {
            await axios.post(`/admin/config/screen`, {
                ...screenForm,
                seatConfiguration: seatConfig
            });
            showAlert("Screen & Seat Layout Added!", "success");
            setScreenForm({ name: "", theatreId: "" });
            setSeatConfig([]);
        } catch (err) {
            showAlert("Error adding screen.", "error");
        }
    };

    const handleAddShow = async () => {
        if (!showForm.screenId || !showForm.movieId) return showAlert("Movie and Screen are required.", "warning");
        if (!showForm.startTime) return showAlert("Show time is required.", "warning");
        try {
            await axios.post(`/admin/config/show`, showForm);
            showAlert("Show Schedule Published Successfully!", "success");
            setShowForm({ movieId: "", screenId: "", startTime: "", price: "" });
        } catch (err) {
            showAlert("Error creating show.", "error");
        }
    };

    const handleCitySelect = (e) => {
        const selectedId = e.target.value;
        setTheatreForm({ ...theatreForm, cityId: selectedId });
        fetchTheatres(selectedId);
    };

    const handleScreenCitySelect = (e) => {
        fetchTheatres(e.target.value);
    };

    // --- DARK MODE INPUT STYLE HELPERS ---
    const inputStyle = {
        "& .MuiInputLabel-root": { color: "#aaa" },
        "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#444" },
            "&:hover fieldset": { borderColor: "#888" },
            "&.Mui-focused fieldset": { borderColor: "#e50914" },
            color: "white"
        },
        "& .MuiSelect-icon": { color: "white" },
        "& input[type='datetime-local']::-webkit-calendar-picker-indicator": {
            filter: "invert(1)"
        }
    };

    return (
        <Box minHeight="100vh" bgcolor="#0a0a0a" py={5} fontFamily="'Poppins', sans-serif">
            {/* Inject the Custom Snackbar Here */}
            <CustomSnackbar
                open={alertInfo.open}
                message={alertInfo.message}
                severity={alertInfo.severity}
                onClose={handleCloseAlert}
            />

            <Container maxWidth="lg">
                <Box textAlign="center" mb={5}>
                    <Typography variant="h3" fontWeight="bold" color="#e50914" sx={{ textShadow: "0 0 10px rgba(229, 9, 20, 0.4)" }}>
                        Cinema Configuration
                    </Typography>
                    <Typography variant="body1" color="gray">
                        Setup Cities, Theatres, Screens, and Show Schedules.
                    </Typography>
                </Box>

                {/* --- NAVIGATION TABS --- */}
                <Paper
                    elevation={4}
                    sx={{
                        bgcolor: "#1a1a1a",
                        borderRadius: 3,
                        mb: 4,
                        border: "1px solid #333",
                        p: 1
                    }}
                >
                    <Tabs
                        value={tab}
                        onChange={(e, v) => setTab(v)}
                        variant="fullWidth"
                        TabIndicatorProps={{ style: { backgroundColor: "#e50914", height: 4 } }}
                        textColor="inherit"
                        sx={{
                            "& .MuiTab-root": {
                                color: "#888", fontWeight: "bold", fontSize: "1rem", textTransform: "none", py: 3,
                                "&.Mui-selected": { color: "white", bgcolor: "rgba(255,255,255,0.05)" }
                            }
                        }}
                    >
                        <Tab icon={<LocationCityIcon />} label="1. Cities" />
                        <Tab icon={<TheaterComedyIcon />} label="2. Theatres" />
                        <Tab icon={<ChairIcon />} label="3. Screens" />
                        <Tab icon={<MovieFilterIcon />} label="4. Shows" />
                    </Tabs>
                </Paper>

                {/* --- CONTENT AREA --- */}
                <Paper sx={{ p: { xs: 3, md: 5 }, bgcolor: "#1a1a1a", color: "white", borderRadius: 3, border: "1px solid #333", minHeight: "400px" }}>

                    {/* --- TAB 1: ADD CITY --- */}
                    {tab === 0 && (
                        <Box maxWidth="600px" mx="auto">
                            <Typography variant="h5" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                                <AddCircleIcon sx={{ color: "#e50914" }} /> Add New City
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <TextField label="City Name" value={cityForm.name} onChange={e => setCityForm({ ...cityForm, name: e.target.value })} fullWidth sx={inputStyle} />
                                <TextField label="City Code (e.g., MUM)" value={cityForm.code} onChange={e => setCityForm({ ...cityForm, code: e.target.value })} fullWidth sx={inputStyle} />
                                <Button variant="contained" size="large" onClick={handleAddCity} sx={{ bgcolor: "#e50914", fontWeight: "bold", py: 1.5, "&:hover": { bgcolor: "#b20710" } }}>
                                    Save City
                                </Button>

                                <Divider sx={{ bgcolor: "#333", my: 2 }} />
                                <Box>
                                    <Typography variant="subtitle2" color="gray" mb={1}>Existing Cities:</Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap">
                                        {cities.map(c => <Chip key={c._id} label={c.name} sx={{ bgcolor: "#333", color: "white" }} />)}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* --- TAB 2: ADD THEATRE --- */}
                    {tab === 1 && (
                        <Box maxWidth="600px" mx="auto">
                            <Typography variant="h5" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                                <AddCircleIcon sx={{ color: "#e50914" }} /> Add Theatre
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <FormControl fullWidth sx={inputStyle}>
                                    <InputLabel>Select City</InputLabel>
                                    <Select value={theatreForm.cityId} label="Select City" onChange={handleCitySelect}>
                                        {cities.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <TextField label="Theatre Name" value={theatreForm.name} onChange={e => setTheatreForm({ ...theatreForm, name: e.target.value })} fullWidth sx={inputStyle} />
                                <TextField label="Location / Address" value={theatreForm.location} onChange={e => setTheatreForm({ ...theatreForm, location: e.target.value })} fullWidth sx={inputStyle} />

                                <Button variant="contained" size="large" onClick={handleAddTheatre} sx={{ bgcolor: "#e50914", fontWeight: "bold", py: 1.5, "&:hover": { bgcolor: "#b20710" } }}>
                                    Save Theatre
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* --- TAB 3: ADD SCREEN (Seat Map) --- */}
                    {tab === 2 && (
                        <Box>
                            <Typography variant="h5" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                                <ChairIcon sx={{ color: "#e50914" }} /> Configure Screen & Seats
                            </Typography>

                            <Grid container spacing={3} mb={3}>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth sx={inputStyle}>
                                        <InputLabel>1. Select City</InputLabel>
                                        <Select label="1. Select City" onChange={handleScreenCitySelect} defaultValue="">
                                            {cities.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth sx={inputStyle}>
                                        <InputLabel>2. Select Theatre</InputLabel>
                                        <Select value={screenForm.theatreId} label="2. Select Theatre" onChange={e => setScreenForm({ ...screenForm, theatreId: e.target.value })} defaultValue="">
                                            {theatres.map(t => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField label="3. Screen Name (e.g. Audi 1)" value={screenForm.name} onChange={e => setScreenForm({ ...screenForm, name: e.target.value })} fullWidth sx={inputStyle} />
                                </Grid>
                            </Grid>

                            <Divider sx={{ bgcolor: "#333", my: 3 }} />

                            <Typography variant="h6" color="#e50914" gutterBottom>Seat Layout Designer:</Typography>
                            <Box border="1px dashed #555" p={2} borderRadius={2} bgcolor="#000">
                                <SeatConfigurator onConfigurationChange={setSeatConfig} />
                            </Box>

                            <Box mt={3} textAlign="right">
                                <Button variant="contained" size="large" onClick={handleAddScreen} startIcon={<SaveIcon />} sx={{ bgcolor: "#e50914", fontWeight: "bold", px: 4, py: 1.5, "&:hover": { bgcolor: "#b20710" } }}>
                                    Save Screen Configuration
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* --- TAB 4: ADD SHOW --- */}
                    {tab === 3 && (
                        <Box maxWidth="700px" mx="auto">
                            <Typography variant="h5" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                                <MovieFilterIcon sx={{ color: "#e50914" }} /> Schedule a Show
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <FormControl fullWidth sx={inputStyle}>
                                    <InputLabel>Select Movie</InputLabel>
                                    <Select value={showForm.movieId} label="Select Movie" onChange={e => setShowForm({ ...showForm, movieId: e.target.value })}>
                                        {movies.map(m => <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>)}
                                    </Select>
                                </FormControl>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth sx={inputStyle}>
                                            <InputLabel>Filter by City</InputLabel>
                                            <Select label="Filter by City" onChange={handleScreenCitySelect}>
                                                {cities.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth sx={inputStyle}>
                                            <InputLabel>Select Theatre</InputLabel>
                                            <Select label="Select Theatre" onChange={e => {
                                                const t = theatres.find(th => th._id === e.target.value);
                                                setScreens(t ? t.screens : []);
                                            }}>
                                                {theatres.map(t => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <FormControl fullWidth sx={inputStyle}>
                                    <InputLabel>Select Screen</InputLabel>
                                    <Select value={showForm.screenId} label="Select Screen" onChange={e => setShowForm({ ...showForm, screenId: e.target.value })}>
                                        {screens.map(s => <MenuItem key={s._id} value={s._id}>{s.name || "Screen"}</MenuItem>)}
                                    </Select>
                                </FormControl>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            type="datetime-local"
                                            label="Show Time"
                                            InputLabelProps={{ shrink: true }}
                                            value={showForm.startTime}
                                            onChange={e => setShowForm({ ...showForm, startTime: e.target.value })}
                                            fullWidth
                                            sx={inputStyle}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            type="number"
                                            label="Ticket Price (₹)"
                                            value={showForm.price}
                                            onChange={e => setShowForm({ ...showForm, price: e.target.value })}
                                            fullWidth
                                            required
                                            sx={inputStyle}
                                        />
                                    </Grid>
                                </Grid>

                                <Button variant="contained" size="large" onClick={handleAddShow} sx={{ bgcolor: "#e50914", fontWeight: "bold", py: 1.5, mt: 2, "&:hover": { bgcolor: "#b20710" } }}>
                                    Publish Show Schedule
                                </Button>
                            </Box>
                        </Box>
                    )}

                </Paper>
            </Container>
        </Box>
    );
};

export default AdminDataEntry;