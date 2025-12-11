import React, { useEffect, useState } from 'react';
import { Box, Container, Tabs, Tab, Grid, Paper, Typography, Button, Chip } from '@mui/material';
import axios from 'axios';
import { GlobalLoader, CustomSnackbar, SuccessDialog } from '../Shared/UI/Feedback';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const Marketplace = () => {
    const [tab, setTab] = useState(0);
    const [marketTickets, setMarketTickets] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "info" });
    const [successData, setSuccessData] = useState({ open: false, ticketId: null });

    const userId = localStorage.getItem("userId");

    const showAlert = (message, severity = "error") => setAlertInfo({ open: true, message, severity });

    useEffect(() => {
        fetchMarket();
    }, []);

    const fetchMarket = () => {
        setLoading(true);
        axios.get("http://localhost:5000/resale/market")
            .then(res => setMarketTickets(res.data.tickets))
            .catch(err => {
                console.error(err);
                showAlert("Failed to load marketplace.", "error");
            })
            .finally(() => setLoading(false));
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBuy = async (ticket) => {
        if (!userId) return showAlert("Please login to buy tickets", "warning");

        const amountToPay = ticket.price; // Buyer pays the listed price (Original Price in this setup)

        setLoading(true);
        const res = await loadRazorpayScript();
        if (!res) {
            setLoading(false);
            return showAlert("Razorpay SDK failed to load.", "error");
        }

        try {
            // 1. Create Order
            const orderUrl = "http://localhost:5000/payment/create-order";
            const { data: order } = await axios.post(orderUrl, { amount: amountToPay });

            const options = {
                key: "rzp_test_RmpXXAam4cVGMK",
                amount: order.amount,
                currency: order.currency,
                name: "Pix-Tix Resale",
                description: `Buying resale ticket for ${ticket.movie.title}`,
                order_id: order.id,

                // 2. Buy Resale Ticket Handler
                handler: async function (response) {
                    try {
                        const res = await axios.post("http://localhost:5000/resale/buy", {
                            bookingId: ticket._id,
                            buyerId: userId
                        });

                        // Note: Resale API should return the new booking ID, but we only show success here.
                        setSuccessData({ open: true, ticketId: res.data.booking ? res.data.booking._id : null });
                        fetchMarket();
                    } catch (err) {
                        console.error(err);
                        showAlert("Purchase Failed after payment. Contact Support.", "error");
                    } finally {
                        setLoading(false);
                    }
                },
                theme: { color: "#e50914" },
                modal: { ondismiss: () => setLoading(false) }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error(err);
            showAlert("Payment initiation failed", "error");
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setSuccessData({ ...successData, open: false });
        if (successData.ticketId) {
            // If we get the new booking ID, navigate to the new ticket page
            // navigate(`/user/ticket/${successData.ticketId}`);
        }
    };


    return (
        <Box minHeight="100vh" bgcolor="#111" color="white" py={5}>
            <GlobalLoader open={loading} />
            <CustomSnackbar open={alertInfo.open} message={alertInfo.message} severity={alertInfo.severity} onClose={() => setAlertInfo({ ...alertInfo, open: false })} />
            <SuccessDialog open={successData.open} title="Resale Ticket Purchased!" message="The new ticket has been added to your profile under My Bookings." onConfirm={handleSuccessClose} />

            <Container>
                <Typography variant="h3" fontWeight="bold" mb={4} textAlign="center" color="#e50914">Ticket Resale Market</Typography>

                <Tabs value={tab} onChange={(e, v) => setTab(v)} centered sx={{ mb: 4, "& .Mui-selected": { color: "#e50914" } }}>
                    <Tab label="Buy Tickets" sx={{ color: 'white' }} />
                    <Tab label="Sell My Tickets" sx={{ color: 'white' }} />
                </Tabs>

                {tab === 0 && (
                    <Grid container spacing={3}>
                        {marketTickets.length === 0 && !loading && (
                            <Typography textAlign="center" width="100%" color="gray">No tickets available for resale.</Typography>
                        )}
                        {marketTickets.map(ticket => (
                            <Grid item xs={12} md={6} key={ticket._id}>
                                <Paper sx={{ p: 3, bgcolor: "#222", color: "white", display: "flex", gap: 3, borderRadius: 2 }}>
                                    <img src={ticket.movie.posterUrl} style={{ width: 100, borderRadius: 5, height: 150, objectFit: 'cover' }} alt="Poster" />
                                    <Box flex={1}>
                                        <Typography variant="h5" fontWeight="bold" color="white">{ticket.movie.title}</Typography>
                                        <Typography color="gray" variant="body2">{new Date(ticket.date).toLocaleString()}</Typography>
                                        <Typography mt={1} fontWeight="bold">Seats: {ticket.seatNumber.join(", ")}</Typography>

                                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                            <Chip
                                                icon={<LocalOfferIcon />}
                                                label={`Buy for ₹${ticket.price}`}
                                                sx={{ bgcolor: '#e50914', color: 'white', fontWeight: 'bold' }}
                                            />
                                            <Button variant="contained" onClick={() => handleBuy(ticket)} sx={{ bgcolor: "#4CAF50" }}>
                                                Buy Now
                                            </Button>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {tab === 1 && (
                    <Box textAlign="center" py={5} sx={{ bgcolor: '#222', borderRadius: 2 }}>
                        <Typography variant="h6" mb={2}>List Your Tickets</Typography>
                        <Typography variant="body1" color="gray">To sell tickets, navigate to your profile and list an eligible booking.</Typography>
                        <Button variant="contained" href="/user" sx={{ mt: 3, bgcolor: "#e50914" }}>Go to Profile</Button>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default Marketplace;