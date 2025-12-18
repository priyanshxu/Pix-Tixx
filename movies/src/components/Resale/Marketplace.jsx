import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Tabs, Tab, Grid, Paper, Typography, Button, Chip, Divider } from '@mui/material';
import axios from 'axios';
import { GlobalLoader, CustomSnackbar, SuccessDialog } from '../Shared/UI/Feedback';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SellIcon from '@mui/icons-material/Sell';

const BASE_URL = process.env.REACT_APP_API_URL;

const Marketplace = () => {
    const [tab, setTab] = useState(0);
    const [marketTickets, setMarketTickets] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "info" });
    const [successData, setSuccessData] = useState({ open: false, ticketId: null });

    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    const showAlert = (message, severity = "error") => setAlertInfo({ open: true, message, severity });

    useEffect(() => {
        fetchMarket();
    }, []);

    const fetchMarket = () => {
        setLoading(true);
        axios.get(`/resale/market`)
            .then(res => setMarketTickets(res.data.tickets))
            .catch(err => {
                console.error(err);
                showAlert("Failed to load marketplace.", "error");
            })
            .finally(() => setLoading(false));
    };

    const handleProceedToCheckout = (ticket) => {
        if (!userId) return showAlert("Please login to buy tickets", "warning");
        if (ticket.user === userId) return showAlert("You cannot buy your own ticket.", "warning");

        navigate('/checkout', {
            state: {
                bookingId: ticket._id,
                basePrice: ticket.price,
                movieTitle: ticket.movie.title,
                screenName: `${ticket.show.screen.theatre.name} | ${ticket.show.screen.name}`,
                date: ticket.show.date,
                selectedSeats: ticket.seatNumber,
                isResale: true
            }
        });
    };

    const handleSuccessClose = () => {
        setSuccessData({ ...successData, open: false });
    };
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
    const getOwnerId = (ticket) => {
        if (!ticket.user) return null;
        // If populated (object), return _id; otherwise return the string itself
        return typeof ticket.user === 'object' ? ticket.user._id : ticket.user;
    };

    // --- FIX START ---
    // Filter tickets based on tab AND check if 'ticket.movie' exists.
    // If 'ticket.movie' is null (deleted movie), we skip it to prevent the white screen crash.
    const buyableTickets = marketTickets.filter(t => t.movie && getOwnerId(t) !== userId);
    const myListings = marketTickets.filter(t => t.movie && getOwnerId(t) === userId);
    // --- FIX END ---

    const TicketCard = ({ ticket, isMyListing }) => (
        <Grid item xs={12} md={6} lg={4} key={ticket._id}>
            <Paper
                elevation={6}
                sx={{
                    p: 0, borderRadius: 3, overflow: 'hidden',
                    bgcolor: "rgba(30, 30, 30, 0.8)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: '0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.5)' }
                }}
            >
                {/* Header Image Area */}
                <Box sx={{
                    height: 140,
                    // Safe Check with Optional Chaining (just in case)
                    backgroundImage: `url(${ticket.movie?.posterUrl || "https://via.placeholder.com/300x150?text=No+Image"})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                }}>
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0), #1e1e1e)'
                    }} />
                    <Chip
                        label={isMyListing ? "Your Listing" : "Resale"}
                        size="small"
                        color={isMyListing ? "info" : "warning"}
                        sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 'bold' }}
                    />
                </Box>

                {/* Content Area */}
                <Box p={2.5}>
                    <Typography variant="h6" fontWeight="bold" color="white" noWrap mb={0.5}>
                        {ticket.movie?.title || "Unknown Movie"}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} mb={1} color="#aaa">
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2">
                            {formatDate(ticket)}
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={2} color="#aaa">
                        <EventSeatIcon fontSize="small" />
                        <Typography variant="body2" color="white" fontWeight="bold">
                            {ticket.seatNumber.join(", ")}
                        </Typography>
                    </Box>

                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight="bold" color="#e50914">
                            ₹{ticket.price}
                        </Typography>

                        {!isMyListing ? (
                            <Button
                                variant="contained"
                                startIcon={<LocalOfferIcon />}
                                onClick={() => handleProceedToCheckout(ticket)}
                                sx={{ bgcolor: "#4CAF50", fontWeight: 'bold', borderRadius: 20, px: 3, '&:hover': { bgcolor: '#388E3C' } }}
                            >
                                Buy Now
                            </Button>
                        ) : (
                            <Typography variant="caption" color="orange" fontStyle="italic">
                                Waiting for buyer...
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Grid>
    );

    return (
        <Box minHeight="100vh" bgcolor="#111" color="white" py={5} sx={{ fontFamily: 'Poppins, sans-serif' }}>
            <GlobalLoader open={loading} />
            <CustomSnackbar open={alertInfo.open} message={alertInfo.message} severity={alertInfo.severity} onClose={() => setAlertInfo({ ...alertInfo, open: false })} />
            <SuccessDialog open={successData.open} title="Resale Ticket Purchased!" message="Added to your bookings." onConfirm={handleSuccessClose} />

            <Container maxWidth="lg">
                <Typography variant="h3" fontWeight="bold" mb={4} textAlign="center" color="#e50914" sx={{ textShadow: '0 0 20px rgba(229,9,20,0.5)' }}>
                    Ticket Marketplace
                </Typography>

                <Tabs
                    value={tab}
                    onChange={(e, v) => setTab(v)}
                    centered
                    sx={{
                        mb: 5,
                        "& .MuiTabs-indicator": { bgcolor: "#e50914" },
                        "& .MuiTab-root": { color: "#888", fontWeight: 'bold', fontSize: '1rem', "&.Mui-selected": { color: "white" } }
                    }}
                >
                    <Tab label={`Buy Tickets (${buyableTickets.length})`} />
                    <Tab label={`My Listings (${myListings.length})`} />
                </Tabs>

                {/* --- TAB 0: BUY --- */}
                {tab === 0 && (
                    <Grid container spacing={3}>
                        {buyableTickets.length === 0 && !loading && (
                            <Box width="100%" textAlign="center" py={10}>
                                <Typography variant="h5" color="gray">No tickets available right now.</Typography>
                                <Typography color="white">Check back later for deals!</Typography>
                            </Box>
                        )}
                        {buyableTickets.map(ticket => (
                            <TicketCard key={ticket._id} ticket={ticket} isMyListing={false} />
                        ))}
                    </Grid>
                )}

                {/* --- TAB 1: SELL (MY LISTINGS) --- */}
                {tab === 1 && (
                    <Box>
                        {myListings.length > 0 ? (
                            <Grid container spacing={3}>
                                {myListings.map(ticket => (
                                    <TicketCard key={ticket._id} ticket={ticket} isMyListing={true} />
                                ))}
                            </Grid>
                        ) : (
                            <Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#1c1c1c', borderRadius: 3, border: '1px dashed #444' }}>
                                <SellIcon sx={{ fontSize: 60, color: '#e50914', mb: 2 }} />
                                <Typography variant="h5" color="white" gutterBottom>You have no active listings.</Typography>
                                <Typography color="gray" mb={3}>
                                    Want to sell a ticket? Go to your Profile, view a booking, and select "Sell Ticket".
                                </Typography>
                                <Button variant="outlined" href="/user" sx={{ color: "#e50914", borderColor: "#e50914", borderRadius: 20, px: 4 }}>
                                    Go to Profile
                                </Button>
                            </Paper>
                        )}
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default Marketplace;