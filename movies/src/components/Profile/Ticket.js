import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Button, Paper, CircularProgress } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import HomeIcon from '@mui/icons-material/Home';
import QrCode2Icon from '@mui/icons-material/QrCode2';

const Ticket = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch this specific booking
        axios
            .get(`http://localhost:5000/booking/${id}`)
            .then((res) => {
                setBooking(res.data.booking);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
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
                        backgroundImage: `url(${booking.movie.posterUrl})`,
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
                        <Typography variant="h4" fontWeight="bold">{booking.movie.title}</Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                            {new Date(booking.date).toDateString()}
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
                        <Typography variant="overline" color="gray" fontWeight="bold">TICKET DETAILS</Typography>

                        <Box display="flex" justifyContent="space-between" mt={2}>
                            <Box>
                                <Typography color="text.secondary" variant="caption">DATE</Typography>
                                <Typography fontWeight="bold">{new Date(booking.date).toLocaleDateString()}</Typography>
                            </Box>
                            <Box>
                                <Typography color="text.secondary" variant="caption">TIME</Typography>
                                <Typography fontWeight="bold">07:00 PM</Typography> {/* Static for now, or add time to backend */}
                            </Box>
                            <Box>
                                <Typography color="text.secondary" variant="caption">SCREEN</Typography>
                                <Typography fontWeight="bold">AUDI 03</Typography>
                            </Box>
                        </Box>

                        <Box mt={3}>
                            <Typography color="text.secondary" variant="caption">SEATS</Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {booking.seatNumber.map((seat, i) => (
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
                                ))}
                            </Box>
                        </Box>

                        <Box mt={3}>
                            <Typography color="text.secondary" variant="caption">BOOKING ID</Typography>
                            <Typography fontFamily="monospace" fontSize="1.1rem">{booking._id}</Typography>
                        </Box>
                    </Box>

                    {/* QR Code Section */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={4}>
                        <Box textAlign="center">
                            <QrCode2Icon sx={{ fontSize: 80, color: "#333" }} />
                            <Typography variant="caption" display="block">Scan at Entry</Typography>
                        </Box>

                        <Box display="flex" gap={2}>
                            <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate("/")}>
                                Home
                            </Button>
                            <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => window.print()} sx={{ bgcolor: "#e50914" }}>
                                Print
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default Ticket;