import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button, Divider, Grid, Switch, FormControlLabel, Chip } from '@mui/material';
import axios from 'axios';
import { GlobalLoader, CustomSnackbar, SuccessDialog } from '../Shared/UI/Feedback';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Data passed from Booking.jsx or Marketplace.js
    const {
        showId,
        selectedSeats,
        basePrice,
        movieTitle,
        screenName,
        date,
        isResale,
        bookingId
    } = location.state || {};

    const [user, setUser] = useState(null);
    const [useWallet, setUseWallet] = useState(false);
    const [loading, setLoading] = useState(true); // Start loading here
    const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "info" });
    const [successData, setSuccessData] = useState({ open: false, ticketId: null });

    const userId = localStorage.getItem("userId");

    const TICKET_COUNT = selectedSeats ? selectedSeats.length : 0;
    const PLATFORM_FEE_PER_TICKET = 20;
    const GST_RATE = 0.18;

    const subtotal = basePrice || 0;
    const platformFee = TICKET_COUNT * PLATFORM_FEE_PER_TICKET;
    const totalBeforeTax = subtotal + platformFee;
    const gst = Math.round(totalBeforeTax * GST_RATE);
    const totalAmount = totalBeforeTax + gst;

    const showAlert = (message, severity = "error") => setAlertInfo({ open: true, message, severity });

    useEffect(() => {
        if (!location.state || (!showId && !bookingId)) {
            navigate("/");
            return;
        }
        setLoading(true);
        axios.get(`/user/${userId}`)
            .then(res => {
                setUser(res.data.user);
                setLoading(false);
            })
            .catch(err => {
                showAlert("Failed to load user data.", "error");
                setLoading(false);
            });
    }, [userId, navigate, location.state, showId, bookingId]);

    // Wallet Logic
    const walletBalance = user ? user.walletBalance || 0 : 0;
    const maxWalletDeduction = useWallet ? Math.min(walletBalance, totalAmount) : 0;
    const finalAmountToPay = totalAmount - maxWalletDeduction;

    const canUseWallet = TICKET_COUNT >= 2 && walletBalance > 0;

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);

        // 1. Check Full Wallet Payment
        if (finalAmountToPay <= 0) {
            await finalizeBooking(null, "WALLET_PAYMENT");
            return;
        }

        try {
            // 2. Hold Seats (Only for new bookings)
            let blockId = null;
            if (!isResale) {
                const holdRes = await axios.post(`/booking/hold`,{
                    show: showId, seatNumber: selectedSeats, user: userId
                });
                blockId = holdRes.data.blockId;
            }

            // 3. Razorpay Payment Setup
            const res = await loadRazorpayScript();
            if (!res) {
                setLoading(false);
                return showAlert("Razorpay SDK failed.", "error");
            }

            const orderUrl = `/payment/create-order`;
            const { data: order } = await axios.post(orderUrl, { amount: finalAmountToPay });

            const options = {
                key: "rzp_test_RmpXXAam4cVGMK",
                amount: order.amount,
                currency: "INR",
                name: "Pix-Tix Checkout",
                description: `Payment for ${movieTitle}`,
                order_id: order.id,

                handler: async function (response) {
                    await finalizeBooking(blockId, response.razorpay_payment_id);
                },
                theme: { color: "#e50914" },
                modal: { ondismiss: () => setLoading(false) }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Checkout Error:", err);
            showAlert(err.response?.data?.message || "Transaction Failed", "error");
            setLoading(false);
        }
    };

    const finalizeBooking = async (blockId, paymentId) => {
        try {
            let endpoint = isResale ? `/resale/buy` : `/booking`;

            const payload = isResale ? {
                bookingId: bookingId,
                buyerId: userId,
                paymentId,
                walletUsed: maxWalletDeduction
            } : {
                show: showId,
                user: userId,
                seatNumber: selectedSeats,
                blockId: blockId,
                price: basePrice,
                paymentId,
                walletUsed: maxWalletDeduction,
                totalPaid: totalAmount
            };

            const finalRes = await axios.post(endpoint, payload);

            if (finalRes.data && finalRes.data.booking) {
                setSuccessData({ open: true, ticketId: finalRes.data.booking._id });
            } else {
                showAlert("Booking confirmed but data missing.", "warning");
            }
        } catch (err) {
            console.error(err);
            showAlert("Booking Confirmation Failed. Seats may be lost.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        if (successData.ticketId) navigate(`/user/ticket/${successData.ticketId}`);
        else navigate("/");
    };

    if (loading || !user) return <GlobalLoader open={true} />;

    const customFont = { fontFamily: 'Poppins, sans-serif' };

    return (
        <Box minHeight="100vh" bgcolor="#111" color="white" py={5} sx={{ ...customFont }}>
            <GlobalLoader open={loading} />
            <CustomSnackbar open={alertInfo.open} message={alertInfo.message} severity={alertInfo.severity} onClose={() => setAlertInfo({ ...alertInfo, open: false })} />
            <SuccessDialog
                open={successData.open}
                title={isResale ? "Resale Purchased!" : "Booking Confirmed!"}
                message={`Your ${TICKET_COUNT} tickets for ${movieTitle} are confirmed!`}
                btnText="View Ticket"
                onConfirm={handleSuccessClose}
            />

            <Container maxWidth="md">
                <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center" color="#e50914" sx={customFont}>
                    Final Checkout
                </Typography>

                <Grid container spacing={4}>
                    {/* LEFT: Summary */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 4, bgcolor: "#1c1c1c", color: "white", borderRadius: 3, border: '1px solid #333' }}>
                            <Typography variant="h5" color="#e50914" fontWeight="bold" mb={1} sx={customFont}>{movieTitle}</Typography>
                            <Typography variant="body2" color="gray" mb={3} sx={customFont}>
                                {screenName} | {new Date(date).toLocaleString()}
                                {isResale && <Chip label="Resale" size="small" sx={{ ml: 1, bgcolor: '#0f0c29', color: '#ffcc00' }} />}
                            </Typography>
                            <Divider sx={{ bgcolor: "#444", mb: 2 }} />

                            {/* Detailed Bill */}
                            <Box display="flex" justifyContent="space-between" mb={1} sx={customFont}>
                                <Typography>Base Ticket Cost</Typography>
                                <Typography>₹{subtotal.toFixed(2)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1} color="#aaa" sx={customFont}>
                                <Typography variant="body2">Platform Fee ({TICKET_COUNT} x ₹{PLATFORM_FEE_PER_TICKET})</Typography>
                                <Typography variant="body2">₹{platformFee.toFixed(2)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={2} color="#aaa" sx={customFont}>
                                <Typography variant="body2">Taxes (GST 18%)</Typography>
                                <Typography variant="body2">₹{gst.toFixed(2)}</Typography>
                            </Box>
                            <Divider sx={{ bgcolor: "#444", mb: 2 }} />
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" fontWeight="bold" sx={customFont}>Total Payable</Typography>
                                <Typography variant="h6" color="#e50914" fontWeight="bold" sx={customFont}>₹{totalAmount.toFixed(2)}</Typography>
                            </Box>

                            {/* Deduction Line */}
                            {maxWalletDeduction > 0 && (
                                <>
                                    <Box display="flex" justifyContent="space-between" color="#4CAF50" sx={customFont}>
                                        <Typography variant="body1" fontWeight="bold">Wallet Deduction</Typography>
                                        <Typography variant="body1" fontWeight="bold">- ₹{maxWalletDeduction.toFixed(2)}</Typography>
                                    </Box>
                                    <Divider sx={{ bgcolor: "#4CAF50", mt: 2 }} />
                                </>
                            )}
                        </Paper>
                    </Grid>

                    {/* RIGHT: Payment Options */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 4, bgcolor: "#1c1c1c", color: "white", borderRadius: 3, border: '1px solid #333' }}>
                            <Typography variant="h6" mb={3} fontWeight="bold" sx={customFont}>Payment Options</Typography>

                            {/* Wallet Option */}
                            <Box bgcolor="#333" p={2} borderRadius={2} mb={3} border={useWallet ? '1px solid #4CAF50' : 'none'}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <AccountBalanceWalletIcon sx={{ color: "#4CAF50" }} />
                                        <Typography fontWeight="bold" sx={customFont}>Pix-Wallet</Typography>
                                    </Box>
                                    <Typography variant="body2" color="white" fontWeight="bold" sx={customFont}>Balance: ₹{walletBalance.toFixed(0)}</Typography>
                                </Box>

                                <Divider sx={{ bgcolor: "#444", my: 1 }} />

                                {canUseWallet ? (
                                    <>
                                        <FormControlLabel
                                            control={<Switch checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} color="success" />}
                                            label={`Apply Balance (-₹${maxWalletDeduction.toFixed(0)})`}
                                            sx={{ mt: 1, color: useWallet ? '#4CAF50' : 'white', ...customFont }}
                                        />
                                        {useWallet && maxWalletDeduction > 0 && (
                                            <Typography variant="caption" color="gray" display="block" sx={customFont}>
                                                Wallet used successfully.
                                            </Typography>
                                        )}
                                    </>
                                ) : (
                                    <Typography variant="caption" color="error" display="block" mt={1} sx={customFont}>
                                        {walletBalance === 0 ? '*Wallet is empty.' : '*Min 2 tickets required to use wallet.'}
                                    </Typography>
                                )}
                            </Box>

                            {/* Final Amount */}
                            <Box display="flex" justifyContent="space-between" mb={3} p={1}>
                                <Typography fontWeight="bold" sx={customFont}>Payable Now</Typography>
                                <Typography variant="h5" fontWeight="bold" color="#ffcc00" sx={customFont}>
                                    ₹{finalAmountToPay.toFixed(0)}
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={handlePayment}
                                disabled={loading}
                                sx={{ bgcolor: "#e50914", fontWeight: "bold", py: 1.5, '&:hover': { bgcolor: '#b20710' }, ...customFont }}
                            >
                                {finalAmountToPay <= 0 ? 'Confirm Booking (Use Wallet)' : `Pay ₹${finalAmountToPay.toFixed(0)} via Razorpay`}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Checkout;