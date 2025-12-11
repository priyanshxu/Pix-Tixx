import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, Avatar, TextField, Rating, Paper } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import axios from 'axios';
import { GlobalLoader } from '../Shared/UI/Feedback';

const MoviePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    // Review State
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);

    useEffect(() => {
        axios.get(`http://localhost:5000/movie/${id}`)
            .then(res => setMovie(res.data.movie))
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmitReview = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return alert("Please login to review");

        try {
            await axios.post(`http://localhost:5000/movie/review/${id}`, { userId, rating, comment });
            alert("Review added!");
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    };

    if (loading) return <GlobalLoader open={true} />;
    if (!movie) return <Typography>Movie Not Found</Typography>;

    return (
        <Box width="100%" minHeight="100vh" bgcolor="#000" color="white" pb={10}>

            {/* 1. TRAILER HERO SECTION (Youtube Embed) */}
            <Box width="100%" height="70vh" bgcolor="black" position="relative">
                {movie.trailerUrl ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${movie.trailerUrl.split('v=')[1]?.split('&')[0]}?autoplay=1&mute=1&loop=1`}
                        title="Trailer"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        style={{ opacity: 0.6 }} // Dim it slightly so text pops
                    />
                ) : (
                    <img src={movie.featuredUrl || movie.posterUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                )}

                {/* Overlay Content */}
                <Box position="absolute" bottom={0} left={0} width="100%" p={5} sx={{ background: 'linear-gradient(to top, #000, transparent)' }}>
                    <Container>
                        <Typography variant="h2" fontWeight="bold" sx={{ textShadow: "0 0 20px black" }}>{movie.title}</Typography>
                        <Box display="flex" gap={2} mt={3}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<ConfirmationNumberIcon />}
                                sx={{ bgcolor: "#e50914", fontWeight: "bold", fontSize: "1.2rem", px: 4 }}
                                onClick={() => navigate(`/movie/${id}/shows`)}
                            >
                                Book Tickets
                            </Button>
                        </Box>
                    </Container>
                </Box>
            </Box>

            <Container sx={{ mt: 5 }}>
                {/* 2. DESCRIPTION & DETAILS */}
                <Grid container spacing={5}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" fontWeight="bold" color="#e50914" gutterBottom>SYNOPSIS</Typography>
                        <Typography variant="body1" color="#ccc" fontSize="1.1rem" lineHeight={1.8}>
                            {movie.description}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, bgcolor: "#1a1a1a", color: "white", borderRadius: 2 }}>
                            <Typography variant="subtitle1" color="gray">RELEASE DATE</Typography>
                            <Typography variant="h6" mb={2}>{new Date(movie.releaseDate).toDateString()}</Typography>

                            <Typography variant="subtitle1" color="gray">GENRE</Typography>
                            <Typography variant="h6">Action, Thriller</Typography> {/* Add genre to backend if needed */}
                        </Paper>
                    </Grid>
                </Grid>

                {/* 3. CAST SECTION */}
                <Box mt={8}>
                    <Typography variant="h5" fontWeight="bold" color="#e50914" gutterBottom>TOP CAST</Typography>
                    <Grid container spacing={2} mt={1}>
                        {movie.cast && movie.cast.length > 0 ? movie.cast.map((actor, i) => (
                            <Grid item xs={6} sm={4} md={2} key={i}>
                                <Box textAlign="center">
                                    <Avatar
                                        src={actor.imageUrl || "https://via.placeholder.com/150"}
                                        sx={{ width: 120, height: 120, margin: "auto", mb: 2, border: "2px solid #333" }}
                                    />
                                    <Typography fontWeight="bold">{actor.name}</Typography>
                                </Box>
                            </Grid>
                        )) : (
                            <Typography color="gray">Cast details updated soon.</Typography>
                        )}
                    </Grid>
                </Box>

                {/* 4. REVIEWS SECTION */}
                <Box mt={10} pt={5} borderTop="1px solid #333">
                    <Typography variant="h5" fontWeight="bold" color="white" gutterBottom>AUDIENCE REVIEWS</Typography>

                    {/* Add Review Form */}
                    <Box mb={5} bgcolor="#111" p={3} borderRadius={2}>
                        <Typography mb={1}>Leave a review</Typography>
                        <Rating value={rating} onChange={(e, val) => setRating(val)} sx={{ mb: 2 }} />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Write your thoughts..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            sx={{ bgcolor: "#222", borderRadius: 1, input: { color: "white" } }}
                            InputProps={{ style: { color: 'white' } }}
                        />
                        <Button onClick={handleSubmitReview} variant="contained" sx={{ mt: 2, bgcolor: "#e50914" }}>Post Review</Button>
                    </Box>

                    {/* Review List */}
                    {movie.reviews && movie.reviews.map((rev, i) => (
                        <Box key={i} mb={3} p={2} bgcolor="#111" borderRadius={2}>
                            <Box display="flex" alignItems="center" gap={2} mb={1}>
                                <Avatar sx={{ bgcolor: "#e50914", width: 30, height: 30, fontSize: "0.9rem" }}>{rev.userName[0]}</Avatar>
                                <Typography fontWeight="bold">{rev.userName}</Typography>
                                <Rating value={rev.rating} readOnly size="small" />
                            </Box>
                            <Typography color="#ccc" fontSize="0.95rem">{rev.comment}</Typography>
                        </Box>
                    ))}
                </Box>

            </Container>
        </Box>
    );
};

export default MoviePage;