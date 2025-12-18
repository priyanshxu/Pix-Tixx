import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container, Grid, Chip } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import { GlobalLoader } from '../Shared/UI/Feedback';

const ShowSelection = () => {
    const { id } = useParams(); // Movie ID
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [shows, setShows] = useState({}); // Grouped by Theatre
    const [loading, setLoading] = useState(false);

    const cityId = localStorage.getItem("userCityId");
    const cityName = localStorage.getItem("userCityName");

    // Helper: Compare two dates ignoring time
    const isSameDate = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // 1. Fetch Shows on Mount & Date Change
    useEffect(() => {
        if (!cityId) return;

        setLoading(true);
        // Ensure we send YYYY-MM-DD
        const dateStr = selectedDate.toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format consistently

        // This endpoint should also return total seat count for the screen
        axios.get(`/admin/config/shows?movieId=${id}&date=${dateStr}&cityId=${cityId}`)
            .then(res => {
                const grouped = {};
                const now = new Date();

                res.data.shows.forEach(show => {
                    const showTime = new Date(show.startTime);

                    // Filter: Must be in future AND match selected date
                    // Note: The backend filter might be enough, but client-side check ensures correctness
                    if (showTime > now && isSameDate(showTime, selectedDate)) {
                        if (show.screen && show.screen.theatre) {
                            const theatreName = show.screen.theatre.name;
                            if (!grouped[theatreName]) {
                                grouped[theatreName] = {
                                    name: theatreName,
                                    location: show.screen.theatre.location,
                                    showtimes: []
                                };
                            }
                            // Calculate Availability
                            const totalSeats = show.screen.seatConfiguration.reduce((count, row) =>
                                count + row.seats.filter(s => s === 1).length, 0);
                            const bookedCount = show.bookings ? show.bookings.length : 0;
                            const available = totalSeats - bookedCount;

                            grouped[theatreName].showtimes.push({ ...show, availableSeats: available, totalSeats });
                        }
                    }
                });

                // Sort showtimes by time
                Object.keys(grouped).forEach(key => {
                    grouped[key].showtimes.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                });

                setShows(grouped);
            })
            .catch(err => {
                console.error("Error fetching shows:", err);
                setShows({});
            })
            .finally(() => setLoading(false));
    }, [id, selectedDate, cityId]);

    // Helper to determine Chip color based on availability
    const getAvailabilityColor = (available, total) => {
        const ratio = available / total;
        if (ratio >= 0.7) return { label: "High", color: "#4CAF50" }; // Green
        if (ratio >= 0.3) return { label: "Medium", color: "#FFC107" }; // Yellow
        return { label: "Low", color: "#F44336" }; // Red
    };

    // Simple Date Generators (Next 7 days)
    const dates = [0, 1, 2, 3, 4, 5, 6].map(days => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d;
    });

    const handleShowClick = (showId) => {
        navigate(`/booking/show/${showId}`);
    };

    // Formatting Helper for Display (DD-MM-YYYY)

    const formatDisplayDate = (date) => {
        return date.toLocaleDateString('en-GB'); // Forces DD/MM/YYYY
    };

    return (
        <Box minHeight="100vh" bgcolor="#000000" color="white" pb={5}>
            <GlobalLoader open={loading} />

            {/* Header: Date Selection & City Context */}
            <Box bgcolor="#1a1a1a" py={3} boxShadow={3} borderBottom="3px solid #e50914">
                <Container>
                    <Typography variant="h6" fontWeight="300" color="#aaa" mb={1}>
                        {cityName ? `Showing in ${cityName}` : "Select City"}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                        Select Showtime
                    </Typography>

                    {/* Date Tabs */}
                    <Box display="flex" gap={1} mt={3} sx={{ overflowX: 'auto', paddingBottom: '10px' }}>
                        {dates.map((date, index) => {
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            return (
                                <Paper
                                    key={index}
                                    onClick={() => setSelectedDate(date)}
                                    elevation={isSelected ? 3 : 1}
                                    sx={{
                                        p: 1, px: 2, cursor: 'pointer', textAlign: 'center', minWidth: '70px',
                                        bgcolor: isSelected ? '#e50914' : '#333',
                                        color: isSelected ? 'white' : '#ccc',
                                        borderRadius: 2,
                                        border: isSelected ? '1px solid white' : 'none'
                                    }}
                                >
                                    <Typography variant="caption" display="block">{date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</Typography>
                                    <Typography fontWeight="bold" fontSize="1.1rem">{date.getDate()}</Typography>
                                </Paper>
                            )
                        })}
                    </Box>
                </Container>
            </Box>

            {/* Theatres List */}
            <Container sx={{ mt: 4 }}>
                {Object.keys(shows).length === 0 && !loading ? (
                    <Box textAlign="center" py={10}>
                        <CalendarTodayIcon sx={{ fontSize: 80, color: "#333", mb: 2 }} />
                        <Typography variant="h6" color="#888">
                            No upcoming shows for {formatDisplayDate(selectedDate)} in {cityName}.
                        </Typography>
                    </Box>
                ) : (
                    Object.entries(shows).map(([theatreName, data]) => (
                        <Paper key={theatreName} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "rgba(30,30,30,0.6)", border: "1px solid #333" }}>
                            <Grid container alignItems="center" spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="h5" fontWeight="bold" color="#e50914">{theatreName}</Typography>
                                    <Typography variant="body2" color="#ccc">{data.location}</Typography>
                                    <Box display="flex" gap={1} mt={1}>
                                        <Chip label="M-Ticket" size="small" sx={{ bgcolor: "#e50914", color: "white" }} />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Box display="flex" flexWrap="wrap" gap={2}>
                                        {data.showtimes.map(show => {
                                            const availability = getAvailabilityColor(show.availableSeats, show.totalSeats);
                                            return (
                                                <Button
                                                    key={show._id}
                                                    variant="outlined"
                                                    onClick={() => handleShowClick(show._id)}
                                                    sx={{
                                                        borderColor: availability.color, color: availability.color, borderRadius: 2,
                                                        minWidth: '110px', p: 1, textTransform: 'none',
                                                        bgcolor: 'rgba(0,0,0,0.3)',
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: '#fff' }
                                                    }}
                                                >
                                                    <Box textAlign="center">
                                                        <Typography variant="body1" fontWeight="bold" color={availability.color}>
                                                            {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                        <Typography variant="caption" display="block" fontSize="0.7rem" color="#888">
                                                            {show.screen.name}
                                                        </Typography>
                                                    </Box>
                                                </Button>
                                            );
                                        })}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))
                )}
            </Container>
        </Box>
    );
};

export default ShowSelection;