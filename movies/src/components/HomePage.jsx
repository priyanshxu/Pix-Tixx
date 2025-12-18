import { Box, Button, Typography, Container, useTheme, useMediaQuery, IconButton, Grid, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import MovieItem from './Movies/MovieItem';
import { Link, useNavigate } from 'react-router-dom';
import { getAllMovies } from '../api-helpers/api-helpers';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { GlobalLoader } from './Shared/UI/Feedback';

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Changed breakpoint check
    const navigate = useNavigate();

    useEffect(() => {
        getAllMovies()
            .then((data) => setMovies(data.movies))
            .catch((err) => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    // --- CAROUSEL LOGIC ---
    useEffect(() => {
        if (movies.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % Math.min(movies.length, 5));
        }, 6000);
        return () => clearInterval(interval);
    }, [movies]);

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(movies.length, 5));
    };

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev - 1 + Math.min(movies.length, 5)) % Math.min(movies.length, 5));
    };

    const featuredMovie = movies.length > 0 ? movies[currentSlide] : null;

    return (
        <Box width={"100%"} minHeight={"100vh"} bgcolor={"#000000"}>
            <GlobalLoader open={loading} />

            {!loading && featuredMovie && (
                <>
                    {/* --- HERO SLIDER SECTION --- */}
                    <Box
                        width={"100%"}
                        height={{ xs: "70vh", md: "90vh" }} // Smaller height on mobile
                        position="relative"
                        sx={{ overflow: 'hidden' }}
                    >
                        {/* Background Image */}
                        <Box
                            key={featuredMovie._id}
                            width={"100%"}
                            height={"100%"}
                            sx={{
                                backgroundImage: `url(${featuredMovie ? (featuredMovie.featuredUrl || featuredMovie.posterUrl) : 'https://wallpaperaccess.com/full/3658622.jpg'})`,
                                backgroundPosition: 'center top',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                animation: 'fadeIn 1s ease-in-out',
                                '@keyframes fadeIn': {
                                    '0%': { opacity: 0.4, transform: 'scale(1.05)' },
                                    '100%': { opacity: 1, transform: 'scale(1)' },
                                },
                            }}
                        />

                        {/* Stronger Gradient Overlay for Readability */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0, left: 0, width: '100%', height: '100%',
                                background: 'linear-gradient(to top, #000000 5%, rgba(0,0,0,0.9) 25%, rgba(0,0,0,0.1) 100%)'
                            }}
                        />

                        {/* Navigation Arrows (Hidden on Mobile) */}
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

                        {/* Text Content */}
                        <Container
                            maxWidth="lg"
                            sx={{
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                zIndex: 2,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: { xs: "center", md: "flex-start" }, // Center on mobile
                                height: "100%"
                            }}
                        >
                            <Box maxWidth="700px" sx={{ ml: { xs: 0, md: 4 }, textAlign: { xs: 'center', md: 'left' }, px: 2 }}>
                                <Typography
                                    variant="overline"
                                    color="#e50914"
                                    fontWeight="bold"
                                    letterSpacing={2}
                                    sx={{
                                        mb: 1,
                                        borderLeft: { xs: 0, md: "4px solid #e50914" },
                                        pl: { xs: 0, md: 2 },
                                        background: "rgba(0,0,0,0.6)",
                                        backdropFilter: "blur(4px)",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        display: "inline-block"
                                    }}
                                >
                                    #{currentSlide + 1} TRENDING
                                </Typography>

                                <Typography
                                    variant={isMobile ? "h4" : "h2"}
                                    fontWeight="900"
                                    color="white"
                                    sx={{
                                        textTransform: 'uppercase',
                                        lineHeight: 1,
                                        mb: 2,
                                        textShadow: "0 10px 30px rgba(0,0,0,0.9)",
                                        fontFamily: "'Poppins', sans-serif"
                                    }}
                                >
                                    {featuredMovie.title}
                                </Typography>

                                <Typography
                                    variant="h6"
                                    color="#ccc"
                                    sx={{
                                        opacity: 0.9,
                                        mb: 3,
                                        fontSize: { xs: "0.9rem", md: "1.2rem" },
                                        fontWeight: 300,
                                        display: '-webkit-box',
                                        overflow: 'hidden',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 3,
                                        fontFamily: "'Poppins', sans-serif"
                                    }}
                                >
                                    {featuredMovie.description}
                                </Typography>

                                <Box display="flex" gap={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                                    <Button
                                        onClick={() => navigate(`/movie/${featuredMovie._id}`)}
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            bgcolor: "#e50914",
                                            color: "white",
                                            fontWeight: 'bold',
                                            borderRadius: '50px',
                                            px: 4,
                                            boxShadow: "0 0 20px rgba(229,9,20,0.6)",
                                            '&:hover': { bgcolor: "#b20710" }
                                        }}
                                        startIcon={<ConfirmationNumberIcon />}
                                    >
                                        Book Now
                                    </Button>

                                    {!isMobile && (
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            sx={{
                                                color: "white",
                                                borderColor: "white",
                                                fontWeight: 'bold',
                                                borderRadius: '50px',
                                                px: 4,
                                                '&:hover': { borderColor: "#e50914", color: "#e50914" }
                                            }}
                                            startIcon={<PlayArrowIcon />}
                                        >
                                            Trailer
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Container>
                    </Box>

                    {/* --- LATEST RELEASES SECTION --- */}
                    <Container maxWidth="xl" sx={{ paddingY: 6, bgcolor: '#000' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={4} px={{ xs: 1, md: 3 }}>
                            <Typography
                                variant={isMobile ? "h5" : "h4"}
                                fontWeight="700"
                                color="white"
                                sx={{ borderLeft: "5px solid #e50914", pl: 2, fontFamily: "'Poppins', sans-serif" }}
                            >
                                Latest Releases
                            </Typography>

                            <Button
                                LinkComponent={Link}
                                to="/movies"
                                sx={{ color: "#e50914", fontWeight: 'bold', textTransform: 'none', fontFamily: "'Poppins', sans-serif" }}
                            >
                                View All &rarr;
                            </Button>
                        </Box>

                        {/* RESPONSIVE GRID SYSTEM */}
                        <Grid container spacing={3} justifyContent="center">
                            {movies && movies.slice(0, 8).map((movie, index) => (
                                <Grid item key={index} xs={6} sm={4} md={3} lg={2.4}>
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
                </>
            )}
        </Box>
    );
};

export default HomePage;