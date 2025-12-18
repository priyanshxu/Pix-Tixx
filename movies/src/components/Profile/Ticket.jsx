import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Button, Paper, CircularProgress } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import HomeIcon from '@mui/icons-material/Home';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SellIcon from '@mui/icons-material/Sell';

const BASE_URL = process.env.REACT_APP_API_URL

const Ticket = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch this specific booking
        axios
            .get(`/booking/${id}`)
            .then((res) => {
                setBooking(res.data.booking);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, [id]);

    // Helper to safely format dates
    const getTicketDate = (b) => {
        // 1. Try booking date
        if (b.date) return new Date(b.date).toDateString();
        // 2. Try show start time (fallback)
        if (b.show && b.show.startTime) return new Date(b.show.startTime).toDateString();
        return "Date N/A";
    };

    const getTicketTime = (b) => {
        // 1. Try booking date (if it stores full datetime)
        if (b.date) return new Date(b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // 2. Try show time
        if (b.show && b.show.startTime) return new Date(b.show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return "Time N/A";
    };

    // --- SELL TICKET HANDLER ---
    const handleSellTicket = async () => {
        const confirmSell = window.confirm("Are you sure you want to list this ticket for resale? \n\nNote: A platform fee will be deducted from the final payout.");
        if (!confirmSell) return;

        try {
            const userId = localStorage.getItem("userId");
            // Call the Resale API
            const res = await axios.post(`/resale/sell`, {
                bookingId: booking._id,
                userId: userId
            });

            alert(`Success! ${res.data.message}\nEstimated Payout: ₹${res.data.payout}`);
            window.location.reload(); // Reload to update status
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to list ticket for resale.";
            alert(msg);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{ color: "#e50914" }} /></Box>;
    if (!booking) return <Typography textAlign="center" mt={5}>Ticket Not Found</Typography>;

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="90vh"
            bgcolor="#1a1a1a" // Dark cinema background
            p={2}
        >
            {/* TICKET CONTAINER */}
            <Paper
                elevation={20}
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    width: "800px",
                    borderRadius: "20px",
                    overflow: "hidden",
                    bgcolor: "#fff"
                }}
            >
                {/* LEFT SIDE: Movie Poster (Visuals) */}
                <Box
                    flex={1.5}
                    sx={{
                        position: "relative",
                        // Fallback image if poster is missing
                        backgroundImage: `url(${booking.movie ? booking.movie.posterUrl : "https://via.placeholder.com/300x450"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        minHeight: "300px",
                        "::after": {
                            content: '""',
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: "linear-gradient(to right, rgba(0,0,0,0.7), transparent)",
                        }
                    }}
                >
                    <Box position="relative" zIndex={2} p={4} color="white">
                        <Typography variant="h4" fontWeight="bold">
                            {booking.movie ? booking.movie.title : "Unknown Movie"}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                            {getTicketDate(booking)}
                        </Typography>
                    </Box>
                </Box>

                {/* RIGHT SIDE: Details (The Actual Ticket) */}
                <Box flex={2} p={4} position="relative" display="flex" flexDirection="column" justifyContent="space-between">
                    {/* Perforated Edge Effect */}
                    <Box
                        sx={{
                            position: "absolute",
                            left: "-10px", top: "10px", bottom: "10px",
                            borderLeft: "4px dotted #ccc",
                            display: { xs: "none", md: "block" }
                        }}
                    />

                    <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="overline" color="gray" fontWeight="bold">TICKET DETAILS</Typography>

                            {/* STATUS BADGE */}
                            {booking.status === 'resale_listed' && (
                                <Typography variant="caption" sx={{ bgcolor: 'orange', color: 'white', px: 1, borderRadius: 1, fontWeight: 'bold' }}>
                                    LISTED FOR RESALE
                                </Typography>
                            )}
                            {booking.status === 'resold' && (
                                <Typography variant="caption" sx={{ bgcolor: 'gray', color: 'white', px: 1, borderRadius: 1, fontWeight: 'bold' }}>
                                    SOLD
                                </Typography>
                            )}
                        </Box>

                        <Box display="flex" justifyContent="space-between" mt={2}>
                            <Box>
                                <Typography color="text.secondary" variant="caption">DATE</Typography>
                                <Typography fontWeight="bold">{getTicketDate(booking)}</Typography>
                            </Box>
                            <Box>
                                <Typography color="text.secondary" variant="caption">TIME</Typography>
                                <Typography fontWeight="bold">{getTicketTime(booking)}</Typography>
                            </Box>
                            <Box>
                                <Typography color="text.secondary" variant="caption">SCREEN</Typography>
                                <Typography fontWeight="bold">
                                    {booking.show && booking.show.screen ? booking.show.screen.name : "N/A"}
                                </Typography>
                            </Box>
                        </Box>

                        <Box mt={3}>
                            <Typography color="text.secondary" variant="caption">SEATS</Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {booking.seatNumber && booking.seatNumber.length > 0 ? (
                                    booking.seatNumber.map((seat, i) => (
                                        <Typography
                                            key={i}
                                            sx={{
                                                bgcolor: "#e50914",
                                                color: "white",
                                                px: 1.5, py: 0.5,
                                                borderRadius: "4px",
                                                fontWeight: "bold",
                                                fontSize: "0.9rem"
                                            }}
                                        >
                                            {seat}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography fontWeight="bold">N/A</Typography>
                                )}
                            </Box>
                        </Box>

                        <Box mt={3}>
                            <Typography color="text.secondary" variant="caption">BOOKING ID</Typography>
                            <Typography fontFamily="monospace" fontSize="1.1rem">{booking._id}</Typography>
                        </Box>
                    </Box>

                    {/* Actions Section */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={4}>
                        <Box textAlign="center">
                            <QrCode2Icon sx={{ fontSize: 80, color: "#333" }} />
                            <Typography variant="caption" display="block">Scan at Entry</Typography>
                        </Box>

                        <Box display="flex" gap={1} flexDirection="column" alignItems="flex-end">
                            <Box display="flex" gap={1}>
                                <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate("/")} size="small">
                                    Home
                                </Button>
                                <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => window.print()} sx={{ bgcolor: "#e50914" }} size="small">
                                    Print
                                </Button>
                            </Box>

                            {/* SELL BUTTON - Only if active */}
                            {(!booking.status || booking.status === 'booked') && (
                                <Button
                                    variant="outlined"
                                    startIcon={<SellIcon />}
                                    onClick={handleSellTicket}
                                    color="error"
                                    size="small"
                                    sx={{ width: '100%', borderColor: '#d32f2f', color: '#d32f2f', '&:hover': { bgcolor: '#ffebee', borderColor: '#d32f2f' } }}
                                >
                                    Sell Ticket
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default Ticket;