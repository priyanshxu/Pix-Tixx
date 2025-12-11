import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Grid, Button, Avatar, Container, Chip, Divider } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DateRangeIcon from '@mui/icons-material/DateRange';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // New Wallet Icon
import axios from "axios";
import { GlobalLoader } from "../Shared/UI/Feedback";

const UserProfile = () => {
    const navigate = useNavigate();
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [pastBookings, setPastBookings] = useState([]);
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
                    // Note: Ensure your backend populates the walletBalance field here
                    axios.get(`http://localhost:5000/user/${userId}`),
                    axios.get(`http://localhost:5000/user/bookings/${userId}`),
                ]);

                setUser(userRes.data.user);

                const allBookings = bookingRes.data.bookings || [];

                // 1. FILTER: Remove 'unknown' bookings (where movie is null)
                const validBookings = allBookings.filter(b => b.movie);

                // 2. SEPARATE: Upcoming vs Past
                const upcoming = [];
                const past = [];
                const now = new Date();

                validBookings.forEach(booking => {
                    // Normalize date: Check 'date' field first, fallback to 'show.startTime'
                    const dateStr = booking.date || (booking.show && booking.show.startTime);
                    const bookingDate = new Date(dateStr);

                    if (bookingDate >= now) {
                        upcoming.push(booking);
                    } else {
                        past.push(booking);
                    }
                });

                // 3. SORT
                // Upcoming: Nearest future date first (Ascending)
                upcoming.sort((a, b) => {
                    const dateA = new Date(a.date || a.show?.startTime);
                    const dateB = new Date(b.date || b.show?.startTime);
                    return dateA - dateB;
                });

                // Past: Most recent past date first (Descending)
                past.sort((a, b) => {
                    const dateA = new Date(a.date || a.show?.startTime);
                    const dateB = new Date(b.date || b.show?.startTime);
                    return dateB - dateA;
                });

                setUpcomingBookings(upcoming);
                setPastBookings(past);

            } catch (err) {
                console.error("Profile Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Helper to safely format dates
    const formatDate = (booking) => {
        const dateStr = booking.date || (booking.show && booking.show.startTime);

        if (!dateStr) {
            return "Date N/A";
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }

        return date.toDateString();
    };

    // Reusable Card Component
    const BookingCard = ({ booking }) => (
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
                    <Box
                        sx={{
                            width: "110px",
                            backgroundImage: `url(${booking.movie.posterUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}
                    />
                    <Box p={2} display="flex" flexDirection="column" justifyContent="space-between" width="100%">
                        <Box>
                            <Typography variant="h6" color="white" fontWeight="bold" noWrap>
                                {booking.movie.title}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1} color="#aaa">
                                <DateRangeIcon fontSize="small" />
                                <Typography variant="body2">
                                    {formatDate(booking)}
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
                                label="View Ticket"
                                size="small"
                                sx={{ bgcolor: "rgba(229, 9, 20, 0.1)", color: "#e50914", fontWeight: "bold", cursor: "pointer" }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Grid>
    );

    return (
        <Box
            width="100%"
            minHeight="100vh"
            sx={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
            py={5}
        >
            <GlobalLoader open={loading} />

            {!loading && user && (
                <Container maxWidth="lg">
                    {/* --- HEADER (PROFILE & BALANCE) --- */}
                    <Paper
                        elevation={10}
                        sx={{
                            p: 4, mb: 6, borderRadius: 4,
                            display: "flex", flexWrap: 'wrap',
                            alignItems: "center", gap: 4,
                            background: "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white"
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 100, height: 100, bgcolor: "#e50914",
                                fontSize: "2.5rem", fontWeight: "bold",
                                boxShadow: "0 0 20px rgba(229, 9, 20, 0.5)"
                            }}
                        >
                            {user.name ? user.name[0].toUpperCase() : <AccountCircleIcon fontSize="large" />}
                        </Avatar>
                        <Box textAlign={{ xs: 'center', md: 'left' }}>
                            <Typography variant="h6" color="#aaa" gutterBottom>Welcome Back,</Typography>
                            <Typography variant="h3" fontWeight="bold" sx={{ textShadow: "0 5px 15px rgba(0,0,0,0.5)" }}>
                                {user.name}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.7, mt: 1 }}>{user.email}</Typography>
                        </Box>

                        {/* --- WALLET BALANCE (New Section) --- */}
                        <Box sx={{ ml: { md: "auto" }, textAlign: "center", minWidth: 200 }}>
                            <Paper sx={{
                                bgcolor: "rgba(0,0,0,0.3)", p: 2, borderRadius: 3,
                                border: '1px solid #4CAF50',
                                boxShadow: "0 0 10px rgba(76, 175, 80, 0.5)"
                            }}>
                                <AccountBalanceWalletIcon sx={{ color: '#4CAF50', fontSize: 30 }} />
                                <Typography variant="caption" color="#ccc" display="block">WALLET BALANCE</Typography>
                                <Typography variant="h4" color="#4CAF50" fontWeight="bold" mt={1}>
                                    ₹{user.walletBalance ? user.walletBalance.toFixed(0) : 0}
                                </Typography>
                            </Paper>
                            <Button
                                size="small"
                                variant="text"
                                sx={{ color: '#e50914', mt: 1, textTransform: 'none' }}
                                onClick={() => alert("Withdrawal/Use Balance feature coming soon!")}
                            >
                                Withdraw / Use Balance
                            </Button>
                        </Box>

                        {/* --- TOTAL BOOKINGS COUNT --- */}
                        <Box sx={{ textAlign: "center" }}>
                            <Paper sx={{ bgcolor: "rgba(0,0,0,0.3)", p: 2, borderRadius: 3, minWidth: "150px" }}>
                                <Typography variant="h4" color="#e50914" fontWeight="bold">
                                    {upcomingBookings.length + pastBookings.length}
                                </Typography>
                                <Typography variant="caption" color="#ccc">Total Bookings</Typography>
                            </Paper>
                        </Box>

                    </Paper>

                    {/* --- UPCOMING BOOKINGS --- */}
                    {upcomingBookings.length > 0 && (
                        <Box mb={6}>
                            <Box mb={3} display="flex" alignItems="center" gap={2}>
                                <ConfirmationNumberIcon sx={{ color: "#4caf50", fontSize: 30 }} />
                                <Typography variant="h4" fontWeight="bold" color="white">
                                    Upcoming Shows
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                {upcomingBookings.map((booking) => (
                                    <BookingCard key={booking._id} booking={booking} />
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* --- PREVIOUS BOOKINGS --- */}
                    {pastBookings.length > 0 && (
                        <Box mb={6}>
                            {upcomingBookings.length > 0 && <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 4 }} />}

                            <Box mb={3} display="flex" alignItems="center" gap={2}>
                                <HistoryIcon sx={{ color: "#aaa", fontSize: 30 }} />
                                <Typography variant="h4" fontWeight="bold" color="#ccc">
                                    Previous Bookings
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                {pastBookings.map((booking) => (
                                    <BookingCard key={booking._id} booking={booking} />
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* --- NO BOOKINGS STATE --- */}
                    {upcomingBookings.length === 0 && pastBookings.length === 0 && (
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
                    )}
                </Container>
            )}
        </Box>
    );
};

export default UserProfile;