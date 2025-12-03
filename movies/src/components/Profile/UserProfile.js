import React, { useEffect, useState } from "react";
import { getAllMovies, getBookingsOfUser } from "../../api-helpers/api-helpers"; // Ensure this helper exists
import { Box, Typography, Paper, Grid, Button, Avatar, Container } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [user, setUser] = useState({ name: "User", email: "" }); // Can fetch user details if needed

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            navigate("/auth");
            return;
        }

        // 1. Fetch Bookings
        axios.get(`http://localhost:5000/user/bookings/${userId}`)
            .then((res) => {
                setBookings(res.data.bookings);
            })
            .catch((err) => console.log(err));

    }, [navigate]);

    const handleDelete = (id) => {
        // Add delete logic here if needed
        axios.delete(`http://localhost:5000/booking/${id}`)
            .then(() => {
                alert("Booking Cancelled");
                window.location.reload();
            })
            .catch(err => console.log(err));
    };

    return (
        <Box width="100%" minHeight="100vh" bgcolor="#000000ff" py={5}>
            <Container maxWidth="lg">

                {/* HEADER PROFILE CARD */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4, mb: 5, borderRadius: 4,
                        display: "flex", alignItems: "center", gap: 3,
                        background: "linear-gradient(to right, #2b2d42, #141e30)",
                        color: "white"
                    }}
                >
                    <Avatar sx={{ width: 80, height: 80, bgcolor: "#e50914" }}>
                        <AccountCircleIcon sx={{ fontSize: 50 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">My Profile</Typography>
                        {/* If you store Name in localStorage, display it here */}
                        <Typography variant="body1" sx={{ opacity: 0.8 }}>Member since 2024</Typography>
                    </Box>
                </Paper>

                {/* BOOKINGS SECTION */}
                <Typography variant="h5" fontWeight="bold" mb={3} color="#333">
                    My Bookings ({bookings.length})
                </Typography>

                {bookings.length === 0 ? (
                    // EMPTY STATE
                    <Box textAlign="center" py={10}>
                        <ConfirmationNumberIcon sx={{ fontSize: 100, color: "#ccc", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" mb={3}>
                            You haven't booked any tickets yet.
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ bgcolor: "#e50914", px: 4, py: 1.5 }}
                            onClick={() => navigate("/movies")}
                        >
                            Book a Movie Now
                        </Button>
                    </Box>
                ) : (
                    // BOOKINGS GRID
                    <Grid container spacing={3}>
                        {bookings.map((booking) => (
                            <Grid item xs={12} sm={6} md={4} key={booking._id}>
                                <Paper
                                    elevation={4}
                                    sx={{
                                        p: 2, borderRadius: 3, overflow: "hidden", cursor: "pointer",
                                        transition: "0.3s", ":hover": { transform: "translateY(-5px)", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }
                                    }}
                                    onClick={() => navigate(`/user/ticket/${booking._id}`)} // GO TO TICKET
                                >
                                    <Box display="flex" gap={2}>
                                        {/* Mini Poster */}
                                        <img
                                            src={booking.movie.posterUrl}
                                            alt={booking.movie.title}
                                            style={{ width: "80px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                                        />
                                        <Box flex={1}>
                                            <Typography variant="h6" fontWeight="bold" noWrap>
                                                {booking.movie.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Date: {new Date(booking.date).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Seats: {booking.seatNumber.join(", ")}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: "inline-block", mt: 1,
                                                    bgcolor: "#e1f5fe", color: "#0288d1",
                                                    px: 1, borderRadius: 1
                                                }}
                                            >
                                                View Ticket
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default UserProfile;