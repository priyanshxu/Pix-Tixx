import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, Container, Paper, Tabs, Tab,
    MenuItem, Select, InputLabel, FormControl, Grid
} from '@mui/material';
import axios from 'axios';
import SeatConfigurator from './SeatConfigurator'; // Re-use your seat tool!

const AdminDataEntry = () => {
    const [tab, setTab] = useState(0);

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

    const fetchCities = () => axios.get("http://localhost:5000/admin/config/city").then(res => setCities(res.data.cities || []));
    const fetchMovies = () => axios.get("http://localhost:5000/movie").then(res => setMovies(res.data.movies || []));

    const fetchTheatres = (cityId) => {
        if (cityId) {
            axios.get(`http://localhost:5000/admin/config/city/${cityId}/theatres`)
                .then(res => setTheatres(res.data.theatres || []))
                .catch(err => console.error("Error fetching theatres:", err));
        } else {
            setTheatres([]);
        }
    };

    // --- HANDLERS ---

    const handleAddCity = async () => {
        try {
            await axios.post("http://localhost:5000/admin/config/city", cityForm);
            alert("City Added!");
            fetchCities();
            setCityForm({ name: "", code: "" });
        } catch (err) { alert("Error adding city"); }
    };

    const handleAddTheatre = async () => {
        if (!theatreForm.cityId) return alert("Please select a city.");
        try {
            await axios.post("http://localhost:5000/admin/config/theatre", theatreForm);
            alert("Theatre Added!");
            setTheatreForm({ name: "", location: "", cityId: "" });
        } catch (err) { alert("Error adding theatre"); }
    };

    const handleAddScreen = async () => {
        if (!screenForm.theatreId) return alert("Please select a theatre.");
        if (seatConfig.length === 0) return alert("Please configure seats");
        try {
            await axios.post("http://localhost:5000/admin/config/screen", {
                ...screenForm,
                seatConfiguration: seatConfig
            });
            alert("Screen & Layout Added!");
            setScreenForm({ name: "", theatreId: "" });
            setSeatConfig([]);
        } catch (err) { alert("Error adding screen"); }
    };

    const handleAddShow = async () => {
        if (!showForm.screenId || !showForm.movieId) return alert("Movie and Screen are required.");
        if (!showForm.startTime) return alert("Show time is required.");
        try {
            await axios.post("http://localhost:5000/admin/config/show", showForm);
            alert("Show Created Successfully!");
            setShowForm({ movieId: "", screenId: "", startTime: "", price: "" });
        } catch (err) { alert("Error creating show"); }
    };

    // Helper to handle City selection properly
    const handleCitySelect = (e) => {
        const selectedId = e.target.value;
        setTheatreForm({ ...theatreForm, cityId: selectedId }); // Use for Theatre Form
        fetchTheatres(selectedId);
    };

    const handleScreenCitySelect = (e) => {
        fetchTheatres(e.target.value);
    };

    return (
        <Box minHeight="100vh" bgcolor="#f4f6f8" py={5}>
            <Container maxWidth="md">
                <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
                    Cinema Configuration
                </Typography>

                <Paper square sx={{ mb: 2 }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)} centered indicatorColor="secondary" textColor="inherit">
                        <Tab label="1. Add City" />
                        <Tab label="2. Add Theatre" />
                        <Tab label="3. Add Screen" />
                        <Tab label="4. Add Show" />
                    </Tabs>
                </Paper>

                <Paper sx={{ p: 4 }}>

                    {/* --- TAB 1: ADD CITY --- */}
                    {tab === 0 && (
                        <Box display="flex" flexDirection="column" gap={3}>
                            <Typography variant="h6">Create a City</Typography>
                            <TextField label="City Name" value={cityForm.name} onChange={e => setCityForm({ ...cityForm, name: e.target.value })} fullWidth />
                            <TextField label="City Code (e.g., MUM)" value={cityForm.code} onChange={e => setCityForm({ ...cityForm, code: e.target.value })} fullWidth />
                            <Button variant="contained" onClick={handleAddCity} sx={{ bgcolor: "#2b2d42" }}>Add City</Button>

                            <Typography variant="subtitle2" mt={2} color="textSecondary">
                                Existing Cities: {cities.map(c => c.name).join(", ") || "None"}
                            </Typography>
                        </Box>
                    )}

                    {/* --- TAB 2: ADD THEATRE --- */}
                    {tab === 1 && (
                        <Box display="flex" flexDirection="column" gap={3}>
                            <Typography variant="h6">Add Theatre to City</Typography>

                            <FormControl fullWidth>
                                <InputLabel>Select City</InputLabel>
                                <Select
                                    value={theatreForm.cityId}
                                    label="Select City"
                                    onChange={handleCitySelect}
                                    defaultValue=""
                                >
                                    {cities.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <TextField label="Theatre Name" value={theatreForm.name} onChange={e => setTheatreForm({ ...theatreForm, name: e.target.value })} fullWidth />
                            <TextField label="Location" value={theatreForm.location} onChange={e => setTheatreForm({ ...theatreForm, location: e.target.value })} fullWidth />

                            <Button variant="contained" onClick={handleAddTheatre} sx={{ bgcolor: "#2b2d42" }}>Add Theatre</Button>
                        </Box>
                    )}

                    {/* --- TAB 3: ADD SCREEN (Seat Map) --- */}
                    {tab === 2 && (
                        <Box display="flex" flexDirection="column" gap={3}>
                            <Typography variant="h6">Add Screen & Layout</Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select City First</InputLabel>
                                        <Select label="Select City First" onChange={handleScreenCitySelect} defaultValue="">
                                            {cities.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select Theatre</InputLabel>
                                        <Select value={screenForm.theatreId} label="Select Theatre" onChange={e => setScreenForm({ ...screenForm, theatreId: e.target.value })} defaultValue="">
                                            {theatres.map(t => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <TextField label="Screen Name (e.g. Audi 1)" value={screenForm.name} onChange={e => setScreenForm({ ...screenForm, name: e.target.value })} fullWidth />

                            <Typography variant="subtitle2" color="primary">Design Seat Map:</Typography>
                            <SeatConfigurator onConfigurationChange={setSeatConfig} />

                            <Button variant="contained" onClick={handleAddScreen} sx={{ bgcolor: "#2b2d42" }}>Save Screen</Button>
                        </Box>
                    )}

                    {/* --- TAB 4: ADD SHOW --- */}
                    {tab === 3 && (
                        <Box display="flex" flexDirection="column" gap={3}>
                            <Typography variant="h6">Schedule a Show</Typography>

                            {/* Movie Select */}
                            <FormControl fullWidth>
                                <InputLabel>Select Movie</InputLabel>
                                <Select value={showForm.movieId} label="Select Movie" onChange={e => setShowForm({ ...showForm, movieId: e.target.value })} defaultValue="">
                                    {movies.map(m => <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>)}
                                </Select>
                            </FormControl>

                            {/* City / Theatre / Screen Selection */}
                            <Typography variant="caption">Select City {'>'} Theatre to find Screens</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Filter by City</InputLabel>
                                        <Select label="Filter by City" onChange={handleScreenCitySelect} defaultValue="">
                                            {cities.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select Theatre</InputLabel>
                                        <Select label="Select Theatre" onChange={e => {
                                            const t = theatres.find(th => th._id === e.target.value);
                                            setScreens(t ? t.screens : []);
                                        }} defaultValue="">
                                            {theatres.map(t => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <FormControl fullWidth>
                                <InputLabel>Select Screen</InputLabel>
                                <Select value={showForm.screenId} label="Select Screen" onChange={e => setShowForm({ ...showForm, screenId: e.target.value })} defaultValue="">
                                    {screens.map(s => <MenuItem key={s._id} value={s._id}>{s.name || "Screen"}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <TextField
                                type="datetime-local"
                                label="Show Time"
                                InputLabelProps={{ shrink: true }}
                                value={showForm.startTime}
                                onChange={e => setShowForm({ ...showForm, startTime: e.target.value })}
                                fullWidth
                            />

                            <TextField
                                type="number"
                                label="Ticket Price (Base Price)"
                                value={showForm.price}
                                onChange={e => setShowForm({ ...showForm, price: e.target.value })}
                                fullWidth
                                required
                            />

                            <Button variant="contained" onClick={handleAddShow} sx={{ bgcolor: "#e50914" }}>Publish Show</Button>
                        </Box>
                    )}

                </Paper>
            </Container>
        </Box>
    );
};

export default AdminDataEntry;