import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, Avatar, TextField, Rating, Paper, Chip, IconButton, Divider } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import axios from 'axios';
import { GlobalLoader } from '../Shared/UI/Feedback';

const MoviePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [vibe, setVibe] = useState(null);
    const [loading, setLoading] = useState(true);

    // Review State
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);

    useEffect(() => {
        axios.get(`/movie/${id}`)
            .then(res => {
                setMovie(res.data.movie);
                setVibe(res.data.vibe);
            })
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmitReview = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return alert("Please login to review");
        if (!comment.trim() || rating === 0) return alert("Please add a rating and comment.");

        try {
            await axios.post(`/movie/review/${id}`, { userId, rating, comment });
            window.location.reload();
        } catch (err) {
            console.log(err);
            alert("Failed to post review");
        }
    };

    if (loading) return <GlobalLoader open={true} />;
    if (!movie) return <Box p={10} textAlign="center"><Typography variant="h4" color="white">Movie Not Found</Typography></Box>;

    return (
        <Box width="100%" minHeight="100vh" bgcolor="#0a0a0a" color="white" pb={10} sx={{ overflowX: 'hidden' }}>

            {/* --- 1. HERO SECTION --- */}
            <Box
                width="100%"
                height={{ xs: "65vh", md: "85vh" }}
                position="relative"
                sx={{
                    backgroundImage: `url(${movie.featuredUrl || movie.posterUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                }}
            >
                {/* Dark Gradient Overlay */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, #0a0a0a 10%, rgba(10,10,10,0.9) 30%, rgba(0,0,0,0.2) 100%)' }} />

                <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "flex-end", pb: { xs: 5, md: 10 } }}>
                    <Grid container spacing={4} alignItems="flex-end">

                        {/* Poster (Desktop Only) */}
                        <Grid item md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Paper
                                elevation={10}
                                sx={{
                                    borderRadius: 4, overflow: 'hidden', border: "1px solid rgba(255,255,255,0.2)",
                                    boxShadow: "0 20px 50px rgba(0,0,0,0.8)", transform: "rotate(-2deg)"
                                }}
                            >
                                <img src={movie.posterUrl} alt={movie.title} style={{ width: "100%", display: "block" }} />
                            </Paper>
                        </Grid>

                        {/* Content */}
                        <Grid item xs={12} md={9}>
                            {/* Genre Chips (Alag Alag) */}
                            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                                {movie.genre && movie.genre.map((g, index) => (
                                    <Chip
                                        key={index}
                                        label={g}
                                        sx={{ bgcolor: "#e50914", color: "white", fontWeight: "bold", textTransform: "uppercase" }}
                                    />
                                ))}
                            </Box>

                            <Typography
                                variant="h1"
                                fontWeight="900"
                                sx={{
                                    fontSize: { xs: "2.5rem", md: "5rem" },
                                    textTransform: "uppercase",
                                    lineHeight: 0.9,
                                    mb: 2,
                                    textShadow: "0 4px 20px rgba(0,0,0,0.8)"
                                }}
                            >
                                {movie.title}
                            </Typography>

                            {/* Meta Data */}
                            <Box display="flex" flexWrap="wrap" alignItems="center" gap={3} mb={4}>
                                <Typography variant="h6" color="#4CAF50" fontWeight="bold">98% Match</Typography>
                                <Typography variant="h6" color="gray">{new Date(movie.releaseDate).getFullYear()}</Typography>
                                <Chip label={movie.censorRating || "U/A"} variant="outlined" sx={{ color: "white", borderColor: "gray" }} />

                                <Box display="flex" alignItems="center" gap={0.5} color="gray">
                                    <AccessTimeIcon fontSize="small" />
                                    <Typography>{movie.runtime ? `${movie.runtime} min` : "N/A"}</Typography>
                                </Box>

                                <Box display="flex" alignItems="center" gap={0.5} color="gray">
                                    <LanguageIcon fontSize="small" />
                                    <Typography>{movie.language || "English"}</Typography>
                                </Box>
                            </Box>

                            {/* Buttons */}
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<ConfirmationNumberIcon />}
                                    sx={{
                                        bgcolor: "#e50914", color: "white", borderRadius: "50px", px: 4, py: 1.5, fontSize: "1.1rem", fontWeight: "bold",
                                        '&:hover': { bgcolor: "#b20710" }
                                    }}
                                    onClick={() => navigate(`/movie/${id}/shows`)}
                                >
                                    Book Tickets
                                </Button>
                                {movie.trailerUrl && (
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<PlayCircleOutlineIcon />}
                                        sx={{
                                            color: "white", borderColor: "rgba(255,255,255,0.5)", borderRadius: "50px", px: 4, py: 1.5,
                                            '&:hover': { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" }
                                        }}
                                        onClick={() => window.open(movie.trailerUrl, '_blank')}
                                    >
                                        Trailer
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 8 }}>

                {/* --- 2. DETAILS GRID --- */}
                <Grid container spacing={6}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" fontWeight="bold" color="white" mb={2} sx={{ borderLeft: "4px solid #e50914", pl: 2 }}>
                            The Story
                        </Typography>
                        <Typography variant="body1" color="#ccc" fontSize="1.1rem" lineHeight={1.8} mb={4}>
                            {movie.description}
                        </Typography>

                        {/* Cast */}
                        <Typography variant="h5" fontWeight="bold" color="white" mb={3} sx={{ borderLeft: "4px solid #e50914", pl: 2 }}>
                            Top Cast
                        </Typography>
                        <Box display="flex" gap={3} sx={{ overflowX: 'auto', pb: 2 }}>
                            {movie.cast?.map((actor, i) => (
                                <Box key={i} minWidth="100px" textAlign="center">
                                    <Avatar
                                        src={actor.imageUrl}
                                        sx={{ width: 80, height: 80, mb: 1, mx: "auto", border: "2px solid #333" }}
                                    />
                                    <Typography variant="body2" fontWeight="bold" color="white">{actor.name}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, borderRadius: 4, bgcolor: "#151515", border: "1px solid #333" }}>
                            <Typography variant="h6" color="white" gutterBottom fontWeight="bold">Movie Info</Typography>
                            <Divider sx={{ bgcolor: "#333", mb: 2 }} />

                            <Box mb={2}>
                                <Typography color="gray" variant="caption">DIRECTOR</Typography>
                                <Typography color="white" fontWeight="bold">
                                    {movie.director || "Unknown Director"}
                                </Typography>
                            </Box>
                            <Box mb={2}>
                                <Typography color="gray" variant="caption">RUNTIME</Typography>
                                <Typography color="white">{movie.runtime ? `${movie.runtime} minutes` : "N/A"}</Typography>
                            </Box>
                            <Box>
                                <Typography color="gray" variant="caption">RELEASE DATE</Typography>
                                <Typography color="white">{new Date(movie.releaseDate).toDateString()}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* --- 3. REVIEWS & AI VERDICT --- */}
                <Box mt={10}>
                    {/* AI Vibe Card */}
                    {vibe && vibe.total > 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3, mb: 6, borderRadius: 3,
                                background: "linear-gradient(135deg, rgba(229, 9, 20, 0.15) 0%, rgba(0,0,0,0) 100%)",
                                border: "1px solid rgba(229, 9, 20, 0.3)",
                                display: "flex", flexDirection: { xs: 'column', md: 'row' }, alignItems: "center", gap: 3
                            }}
                        >
                            <Avatar sx={{ bgcolor: "#e50914", width: 50, height: 50 }}>
                                <AutoAwesomeIcon />
                            </Avatar>
                            <Box flex={1}>
                                <Typography variant="overline" color="#e50914" fontWeight="bold">AI AUDIENCE VERDICT</Typography>
                                <Typography variant="h5" fontWeight="bold" color="white">{vibe.verdict}</Typography>
                                <Typography variant="body2" color="gray">Based on {vibe.total} reviews</Typography>
                            </Box>
                        </Paper>
                    )}

                    <Typography variant="h4" fontWeight="bold" color="white" mb={4}>
                        Audience Reviews ({movie.reviews?.length || 0})
                    </Typography>

                    <Grid container spacing={4}>
                        {/* Write Review */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, bgcolor: "#151515", borderRadius: 3, border: "1px solid #333" }}>
                                <Typography variant="h6" color="white" mb={2}>Rate this movie</Typography>

                                {/* FIX: STARS VISIBILITY ON BLACK BG */}
                                <Rating
                                    value={rating}
                                    onChange={(e, v) => setRating(v)}
                                    size="large"
                                    sx={{
                                        color: "#e50914",
                                        mb: 3,
                                        "& .MuiRating-iconEmpty": { color: "gray" }
                                    }}
                                />

                                <TextField
                                    fullWidth multiline rows={4}
                                    placeholder="Write your review here..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    sx={{
                                        bgcolor: "#222", borderRadius: 2, mb: 2,
                                        "& .MuiOutlinedInput-root": { color: "white" }
                                    }}
                                />
                                <Button
                                    fullWidth variant="contained"
                                    onClick={handleSubmitReview}
                                    sx={{ bgcolor: "#e50914", fontWeight: "bold", '&:hover': { bgcolor: "#b20710" } }}
                                >
                                    Post Review
                                </Button>
                            </Paper>
                        </Grid>

                        {/* Reviews List */}
                        <Grid item xs={12} md={8}>
                            <Box sx={{ maxHeight: "500px", overflowY: "auto", pr: 1 }}>
                                {movie.reviews && movie.reviews.length > 0 ? (
                                    movie.reviews.map((rev, i) => (
                                        <Paper
                                            key={i}
                                            sx={{
                                                p: 3, mb: 2, bgcolor: "#111",
                                                border: "1px solid #333", borderRadius: 3
                                            }}
                                        >
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar sx={{ bgcolor: "#333", color: "white" }}>{rev.userName[0]}</Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="bold" color="white">{rev.userName}</Typography>

                                                        {/* FIX: READ-ONLY STARS VISIBILITY */}
                                                        <Rating
                                                            value={rev.rating}
                                                            readOnly
                                                            size="small"
                                                            sx={{
                                                                color: "#e50914",
                                                                "& .MuiRating-iconEmpty": { color: "#444" }
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" color="#ccc" sx={{ ml: 7 }}>"{rev.comment}"</Typography>
                                        </Paper>
                                    ))
                                ) : (
                                    <Box textAlign="center" py={5} color="gray">
                                        <Typography>No reviews yet.</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default MoviePage;