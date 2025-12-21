import { Box, Button, Typography, Container, useTheme, useMediaQuery, IconButton, Grid, Chip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import MovieItem from './Movies/MovieItem';
import { Link, useNavigate } from 'react-router-dom';
import { getAllMovies } from '../api-helpers/api-helpers';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MovieCreationIcon from '@mui/icons-material/MovieCreation'; // Ensure @mui/icons-material is installed
import axios from 'axios';
import { GlobalLoader } from './Shared/UI/Feedback';

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [recs, setRecs] = useState([]);
    const [recReason, setRecReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        console.log("Fetching movies...");
        getAllMovies()
            .then((data) => {
                console.log("Movies API Response:", data); // DEBUG LOG
                if (data && data.movies) {
                    // Filter out any broken movie objects (nulls)
                    const validMovies = data.movies.filter(m => m && m.title);
                    setMovies(validMovies);
                } else {
                    setMovies([]);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch movies:", err);
                setMovies([]);
            })
            .finally(() => setLoading(false));
    }, []);

    // Fetch User Recommendations
    useEffect(() => {
        if (userId) {
            axios.get(`/user/recommendations/${userId}`)
                .then(res => {
                    setRecs(res.data.recommendations || []);
                    setRecReason(res.data.reason || "");
                })
                .catch(err => console.log("Recs Error:", err));
        }
    }, [userId]);

    // Carousel Auto-Scroll
    useEffect(() => {
        if (movies.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % Math.min(movies.length, 5));
        }, 6000);
        return () => clearInterval(interval);
    }, [movies]);

    const handleNext = () => setCurrentSlide((prev) => (prev + 1) % Math.min(movies.length, 5));
    const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + Math.min(movies.length, 5)) % Math.min(movies.length, 5));

    // SAFETY CHECK: Ensure we have a movie to show
    const featuredMovie = (movies && movies.length > 0) ? movies[currentSlide] : null;

    // 🛡️ HELPER: Safe Year Extractor
    const getYear = (dateString) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        return isNaN(d) ? "" : d.getFullYear();
    };

    return (
        <Box width={"100%"} minHeight={"100vh"} bgcolor={"#000000"} sx={{ overflowX: 'hidden' }}>
            <GlobalLoader open={loading} />

            {/* --- 1. EMPTY STATE (If No Movies) --- */}
            {!loading && (!movies || movies.length === 0) && (
                <Box
                    height="100vh"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    color="white"
                    textAlign="center"
                    gap={2}
                >
                    <MovieCreationIcon sx={{ fontSize: 80, color: "#333" }} />
                    <Typography variant="h4" fontWeight="bold">No Movies Scheduled</Typography>
                    <Typography color="gray">It looks like the cinema is closed today.</Typography>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => window.location.reload()}
                        sx={{ mt: 2 }}
                    >
                        Refresh Page
                    </Button>
                </Box>
            )}

            {/* --- 2. MAIN CONTENT (Only renders if we have movies) --- */}
            {!loading && featuredMovie && (
                <>
                    {/* --- HERO SLIDER SECTION --- */}
                    <Box
                        width={"100%"}
                        height={{ xs: "65vh", md: "90vh" }}
                        position="relative"
                    >
                        {/* Background Image */}
                        <Box
                            key={featuredMovie._id}
                            width={"100%"}
                            height={"100%"}
                            sx={{
                                backgroundImage: `url(${featuredMovie.featuredUrl || featuredMovie.posterUrl})`,
                                backgroundPosition: 'center top',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                animation: 'fadeIn 1s ease-in-out',
                                '@keyframes fadeIn': { '0%': { opacity: 0.6 }, '100%': { opacity: 1 } },
                            }}
                        />

                        {/* Gradient Overlay */}
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, #000 5%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.1) 100%)' }} />

                        {/* Navigation Arrows */}
                        {!isMobile && (
                            <>
                                <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 20, top: '50%', color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: '#e50914' }, zIndex: 3 }}>
                                    <ArrowBackIosNewIcon />
                                </IconButton>
                                <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 20, top: '50%', color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: '#e50914' }, zIndex: 3 }}>
                                    <ArrowForwardIosIcon />
                                </IconButton>
                            </>
                        )}

                        {/* Hero Text Content */}
                        <Container
                            maxWidth="xl"
                            sx={{
                                position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2,
                                display: "flex", flexDirection: "column", justifyContent: "flex-end",
                                alignItems: { xs: "center", md: "flex-start" }, pb: { xs: 8, md: 15 }, px: { xs: 2, md: 5 }
                            }}
                        >
                            <Box maxWidth="800px" sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Chip label={`#${currentSlide + 1} TRENDING`} sx={{ bgcolor: "#e50914", color: "white", fontWeight: "bold", mb: 2, borderRadius: 1 }} />

                                <Typography variant={isMobile ? "h4" : "h2"} fontWeight="900" color="white" sx={{ textTransform: 'uppercase', lineHeight: 1, mb: 2, textShadow: "0 4px 10px rgba(0,0,0,0.8)" }}>
                                    {featuredMovie.title}
                                </Typography>

                                {/* 🛡️ SAFE YEAR DISPLAY */}
                                <Typography variant="h6" color="#e0e0e0" sx={{ mb: 2 }}>
                                    {getYear(featuredMovie.releaseDate)}
                                </Typography>

                                <Typography variant="h6" color="#e0e0e0" sx={{ mb: 4, fontWeight: 400, fontSize: { xs: "0.9rem", md: "1.2rem" }, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: isMobile ? 3 : 2, textShadow: "0 2px 5px rgba(0,0,0,0.8)" }}>
                                    {featuredMovie.description}
                                </Typography>

                                <Box display="flex" gap={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                                    <Button onClick={() => navigate(`/movie/${featuredMovie._id}`)} variant="contained" size="large" sx={{ bgcolor: "#e50914", color: "white", fontWeight: 'bold', borderRadius: '50px', px: 4, py: 1.5, boxShadow: "0 0 20px rgba(229,9,20,0.5)", '&:hover': { bgcolor: "#b20710" } }} startIcon={<ConfirmationNumberIcon />}>
                                        Book Now
                                    </Button>
                                    {!isMobile && (
                                        <Button
                                            variant="outlined" size="large"
                                            sx={{ color: "white", borderColor: "rgba(255,255,255,0.6)", fontWeight: 'bold', borderRadius: '50px', px: 4, backdropFilter: "blur(5px)", '&:hover': { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                                            startIcon={<PlayArrowIcon />}
                                            onClick={() => {
                                                if (featuredMovie.trailerUrl) window.open(featuredMovie.trailerUrl, '_blank')
                                            }}
                                        >
                                            Trailer
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Container>
                    </Box>

                    {/* --- RECOMMENDED SECTION --- */}
                    {userId && recs.length > 0 && (
                        <Container maxWidth="xl" sx={{ pt: 8 }}>
                            <Box display="flex" alignItems="center" gap={2} mb={4} px={2}>
                                <AutoAwesomeIcon sx={{ color: "#e50914", fontSize: 30 }} />
                                <Box>
                                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700" color="white">
                                        Recommended For You
                                    </Typography>
                                    <Typography variant="body2" color="gray">
                                        {recReason}
                                    </Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={3} justifyContent="center">
                                {recs.map((movie, index) => (
                                    <Grid item key={index} xs={12} sm={6} md={3}>
                                        <MovieItem
                                            id={movie._id}
                                            title={movie.title}
                                            posterUrl={movie.posterUrl}
                                            releaseDate={movie.releaseDate}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Container>
                    )}

                    {/* --- LATEST RELEASES SECTION --- */}
                    <Container maxWidth="xl" sx={{ py: 8 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} px={2}>
                            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700" color="white" sx={{ borderLeft: "5px solid #e50914", pl: 2 }}>
                                Latest Releases
                            </Typography>
                            {!isMobile && (
                                <Button LinkComponent={Link} to="/movies" sx={{ color: "#e50914", fontWeight: 'bold' }}>
                                    See All &rarr;
                                </Button>
                            )}
                        </Box>

                        <Grid container spacing={3} justifyContent="center">
                            {movies && movies.slice(0, 4).map((movie, index) => (
                                <Grid item key={index} xs={12} sm={6} md={3}>
                                    <MovieItem
                                        id={movie._id}
                                        title={movie.title}
                                        posterUrl={movie.posterUrl}
                                        releaseDate={movie.releaseDate}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        {isMobile && (
                            <Box display="flex" justifyContent="center" mt={4}>
                                <Button LinkComponent={Link} to="/movies" variant='outlined' sx={{ color: "white", borderColor: "#444", borderRadius: 20, px: 4 }}>
                                    View All Movies
                                </Button>
                            </Box>
                        )}
                    </Container>
                </>
            )}
        </Box>
    );
};

export default HomePage;