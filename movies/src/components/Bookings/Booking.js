import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button, Divider, Grid } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SeatMap from './Seatmap';
import { GlobalLoader, CustomSnackbar, SuccessDialog } from '../Shared/UI/Feedback';

const Booking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showDetails, setShowDetails] = useState(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "info" });
  const [successData, setSuccessData] = useState({ open: false, ticketId: null });

  const { id } = useParams(); // SHOW ID
  const showId = id;
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const showAlert = (message, severity = "error") => setAlertInfo({ open: true, message, severity });

  // 1. Fetch Show Details
  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/show/${showId}`);
        if (res.data.show) {
          setShowDetails(res.data.show);
        } else {
          showAlert("Show data is empty.", "error");
        }
      } catch (err) {
        console.error("Error fetching show:", err);
        showAlert("Failed to load show details.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchShowDetails();
    else {
      setLoading(false);
      showAlert("Please Login to book tickets", "warning");
      setTimeout(() => navigate("/auth"), 2000);
    }
  }, [showId, userId, navigate]);

  const handleSeatData = (seatsArray) => {
    setSelectedSeats(seatsArray);
    if (showDetails) {
      setTotalPrice(seatsArray.length * showDetails.price);
    }
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

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!userId) return showAlert("Please Login first!", "warning");
    if (selectedSeats.length === 0) return showAlert("Select at least one seat", "warning");

    setLoading(true);

    try {
      // --- STEP 1: HOLD SEATS ---
      const holdRes = await axios.post("http://localhost:5000/booking/hold", {
        show: showId,
        seatNumber: selectedSeats,
        user: userId
      });

      const blockId = holdRes.data.blockId;

      // --- STEP 2: LOAD RAZORPAY ---
      const res = await loadRazorpayScript();

      if (!res) {
        setLoading(false);
        return showAlert("Razorpay SDK failed to load.", "error");
      }

      const orderUrl = "http://localhost:5000/payment/create-order";
      const { data: order } = await axios.post(orderUrl, { amount: totalPrice });

      const options = {
        key: "rzp_test_RmpXXAam4cVGMK",
        amount: order.amount,
        currency: order.currency,
        name: "Pix-Tix Cinema",
        description: `Booking for ${selectedSeats.length} tickets`,
        order_id: order.id,

        // --- STEP 3: CONFIRM BOOKING AFTER PAYMENT ---
        handler: async function (response) {
          try {
            const bookingUrl = "http://localhost:5000/booking";
            const bookingData = {
              show: showId,
              user: userId,
              seatNumber: selectedSeats,
              blockId: blockId,
              price: totalPrice // PRICE SENT
            };

            const finalRes = await axios.post(bookingUrl, bookingData);

            if (finalRes.data && finalRes.data.booking) {
              // THIS IS WHERE THE CRASH OCCURS
              setSuccessData({ open: true, ticketId: finalRes.data.booking._id });
            } else {
              showAlert("Payment received, but ticket data is missing.", "warning");
            }
          } catch (err) {
            console.error("Booking Finalization Error:", err);
            alert("Booking confirmation failed. Please contact support with Payment ID: " + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },
        theme: { color: "#e50914" },
        modal: { ondismiss: () => setLoading(false) }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Booking Error:", err);

      if (err.response && err.response.status === 409) {
        showAlert("Seats just got taken! Please select others.", "error");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showAlert("Error processing booking.", "error");
      }
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    if (successData.ticketId) navigate(`/user/ticket/${successData.ticketId}`);
    else navigate("/user");
  };

  if (loading && !showDetails) return <GlobalLoader open={true} />;

  if (!showDetails) return (
    <Box textAlign="center" py={10} bgcolor="#000" minHeight="100vh" color="white">
      <Typography variant="h5">Show details unavailable.</Typography>
    </Box>
  );

  const formattedTime = new Date(showDetails.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = new Date(showDetails.startTime).toLocaleDateString();

  return (
    <Box
      width="100%"
      minHeight="100vh"
      sx={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
      py={5}
    >
      <Container maxWidth="md">
        <GlobalLoader open={loading} />
        <CustomSnackbar open={alertInfo.open} message={alertInfo.message} severity={alertInfo.severity} onClose={() => setAlertInfo({ ...alertInfo, open: false })} />
        {/* SuccessDialog instance that is crashing */}
        <SuccessDialog open={successData.open} title="Tickets Booked!" message="Your seats are confirmed. Check your email for the ticket." btnText="View Ticket" onConfirm={handleSuccessClose} />

        <Paper
          elevation={10}
          sx={{
            p: 0, borderRadius: 4, overflow: "hidden",
            bgcolor: "rgba(30, 30, 30, 0.9)", // Dark Card BG
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white"
          }}
        >
          {/* HEADER - MOVIE INFO */}
          <Box p={4} sx={{ background: "linear-gradient(to right, #1a1a1a, #2c2c2c)", borderBottom: "1px solid #333" }}>
            <Typography variant="h4" fontWeight="bold" color="#e50914" gutterBottom>
              {showDetails.movie.title}
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Box display="flex" alignItems="center" gap={1} color="#ccc">
                  <LocationOnIcon fontSize="small" color="primary" />
                  <Typography variant="body1">{showDetails.screen.theatre.name} | {showDetails.screen.name}</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box display="flex" alignItems="center" gap={1} color="#ccc">
                  <AccessTimeIcon fontSize="small" color="primary" />
                  <Typography variant="body1">
                    {formattedDate} at {formattedTime}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* SEAT MAP AREA */}
          <Box p={3} display="flex" justifyContent="center" bgcolor="#000">
            <SeatMap
              layout={showDetails.screen.seatConfiguration}
              showId={showId}
              price={showDetails.price}
              onSeatSelect={handleSeatData}
            />
          </Box>

          {/* FOOTER - SUMMARY & PAY */}
          <Box p={3} bgcolor="#1a1a1a" borderTop="1px solid #333">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="#888" mb={0.5}>SELECTED SEATS</Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <EventSeatIcon sx={{ color: '#e50914' }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                  </Typography>
                </Box>
              </Box>

              <Box textAlign="right">
                <Typography variant="body2" color="#888" mb={0.5}>TOTAL PRICE</Typography>
                <Typography variant="h4" fontWeight="bold" color="white">
                  ₹{totalPrice}
                </Typography>
              </Box>
            </Box>

            <Button
              onClick={handleBooking}
              variant="contained"
              fullWidth
              size="large"
              endIcon={<ConfirmationNumberIcon />}
              sx={{
                mt: 3,
                bgcolor: "#e50914",
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                transition: '0.3s',
                boxShadow: '0 0 20px rgba(229,9,20,0.4)',
                opacity: selectedSeats.length > 0 ? 1 : 0.6,
                '&:hover': { bgcolor: '#b20710', transform: 'scale(1.02)' }
              }}
              disabled={selectedSeats.length === 0}
            >
              Proceed to Payment
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Booking;