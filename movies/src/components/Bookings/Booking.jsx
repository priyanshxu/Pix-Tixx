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

  // --- NEW: Handle Navigation to Checkout ---
  const handleProceedToCheckout = () => {
    if (!userId) return showAlert("Please Login first!", "warning");
    if (selectedSeats.length === 0) return showAlert("Select at least one seat", "warning");

    navigate('/checkout', {
      state: {
        showId,
        selectedSeats,
        basePrice: totalPrice, // Total price of seats only (Base for calculation)
        movieTitle: showDetails.movie.title,
        screenName: `${showDetails.screen.theatre.name} | ${showDetails.screen.name}`,
        date: showDetails.startTime,
        isResale: false
      }
    });
  };
  // --- END NEW HANDLER ---

  // Removed loadRazorpayScript and handleBooking as they are moved to Checkout.js

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
        <SuccessDialog open={successData.open} title="Tickets Booked!" message="Your seats are confirmed. Check your email for the ticket." btnText="View Ticket" onConfirm={() => navigate(`/user/ticket/${successData.ticketId}`)} />

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
              onClick={handleProceedToCheckout} // <<< NEW HANDLER
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
              Proceed to Checkout
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Booking;