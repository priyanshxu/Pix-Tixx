import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Button, Avatar, Container, Chip } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DateRangeIcon from '@mui/icons-material/DateRange';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GlobalLoader } from "../Shared/UI/Feedback"; // Use your existing loader

const UserProfile = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            navigate("/auth");
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch User Details AND Bookings in parallel
                const [userRes, bookingRes] = await Promise.all([
                    axios.get(`http://localhost:5000/user/${userId}`),
                    axios.get(`http://localhost:5000/user/bookings/${userId}`)
                ]);

                setUser(userRes.data.user);
                setBookings(bookingRes.data.bookings);
            } catch (err) {
                console.error("Profile Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    return (
        <Box
            width="100%"
            minHeight="100vh"
            // Cinematic Gradient Background
            sx={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
            py={5}
        >
            <GlobalLoader open={loading} />

            {!loading && user && (
                <Container maxWidth="lg">

                    {/* --- 1. GLASS PROFILE HEADER --- */}
                    <Paper
                        elevation={10}
                        sx={{
                            p: 4, mb: 6, borderRadius: 4,
                            display: "flex",
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: "center", gap: 4,
                            // Glassmorphism Style
                            background: "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white"
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 100, height: 100,
                                bgcolor: "#e50914",
                                fontSize: "2.5rem", fontWeight: "bold",
                                boxShadow: "0 0 20px rgba(229, 9, 20, 0.5)"
                            }}
                        >
                            {user.name ? user.name[0].toUpperCase() : <AccountCircleIcon fontSize="large" />}
                        </Avatar>

                        <Box textAlign={{ xs: 'center', md: 'left' }}>
                            <Typography variant="h6" color="#aaa" gutterBottom>
                                Welcome Back,
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" sx={{ textShadow: "0 5px 15px rgba(0,0,0,0.5)" }}>
                                {user.name}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.7, mt: 1 }}>
                                {user.email}
                            </Typography>
                        </Box>

                        <Box sx={{ ml: { md: "auto" }, textAlign: "center" }}>
                            <Paper sx={{ bgcolor: "rgba(0,0,0,0.3)", p: 2, borderRadius: 3, minWidth: "150px" }}>
                                <Typography variant="h4" color="#e50914" fontWeight="bold">
                                    {bookings.length}
                                </Typography>
                                <Typography variant="caption" color="#ccc">
                                    Tickets Booked
                                </Typography>
                            </Paper>
                        </Box>
                    </Paper>

                    {/* --- 2. BOOKINGS SECTION --- */}
                    <Box mb={3} display="flex" alignItems="center" gap={2}>
                        <ConfirmationNumberIcon sx={{ color: "#e50914", fontSize: 30 }} />
                        <Typography variant="h4" fontWeight="bold" color="white">
                            My Bookings
                        </Typography>
                    </Box>

                    {bookings.length === 0 ? (
                        // EMPTY STATE
                        <Box textAlign="center" py={10} sx={{ background: "rgba(255,255,255,0.02)", borderRadius: 4 }}>
                            <ConfirmationNumberIcon sx={{ fontSize: 80, color: "#444", mb: 2 }} />
                            <Typography variant="h6" color="#888" mb={3}>
                                You haven't booked any movies yet.
                            </Typography>
                            <Button
                                variant="outlined"
                                sx={{ color: "#e50914", borderColor: "#e50914", borderRadius: 20, px: 4 }}
                                onClick={() => navigate("/movies")}
                            >
                                Explore Movies
                            </Button>
                        </Box>
                    ) : (
                        // BOOKINGS GRID
                        <Grid container spacing={3}>
                            {bookings.map((booking) => (
                                <Grid item xs={12} md={6} lg={4} key={booking._id}>
                                    <Paper
                                        elevation={5}
                                        sx={{
                                            p: 0, borderRadius: 3, overflow: "hidden", cursor: "pointer",
                                            background: "rgba(30, 30, 30, 0.6)",
                                            backdropFilter: "blur(10px)",
                                            border: "1px solid rgba(255,255,255,0.05)",
                                            transition: "0.3s",
                                            ":hover": {
                                                transform: "translateY(-5px)",
                                                boxShadow: "0 10px 30px rgba(229, 9, 20, 0.3)",
                                                border: "1px solid rgba(229, 9, 20, 0.4)"
                                            }
                                        }}
                                        onClick={() => navigate(`/user/ticket/${booking._id}`)}
                                    >
                                        <Box display="flex" height="160px">
                                            {/* Left: Mini Poster */}
                                            <Box
                                                sx={{
                                                    width: "110px",
                                                    backgroundImage: `url(${booking.movie?.posterUrl})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                }}
                                            />

                                            {/* Right: Info */}
                                            <Box p={2} display="flex" flexDirection="column" justifyContent="space-between" width="100%">
                                                <Box>
                                                    <Typography variant="h6" color="white" fontWeight="bold" noWrap>
                                                        {booking.movie?.title || "Unknown Movie"}
                                                    </Typography>

                                                    <Box display="flex" alignItems="center" gap={1} mt={1} color="#aaa">
                                                        <DateRangeIcon fontSize="small" />
                                                        <Typography variant="body2">
                                                            {new Date(booking.date).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>

                                                    <Box display="flex" alignItems="center" gap={1} mt={0.5} color="#aaa">
                                                        <EventSeatIcon fontSize="small" />
                                                        <Typography variant="body2" noWrap>
                                                            {booking.seatNumber.join(", ")}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                                    <Chip
                                                        label="Confirmed"
                                                        size="small"
                                                        sx={{ bgcolor: "rgba(76, 175, 80, 0.2)", color: "#4caf50", fontWeight: "bold" }}
                                                    />
                                                    <Typography variant="caption" color="#e50914" fontWeight="bold">
                                                        VIEW TICKET &rarr;
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            )}
        </Box>
    );
};

export default UserProfile;