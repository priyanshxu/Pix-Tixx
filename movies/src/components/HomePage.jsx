import { Box, Button, Typography, Container, useTheme, useMediaQuery, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import MovieItem from './Movies/MovieItem';
import { Link, useNavigate } from 'react-router-dom';
import { getAllMovies } from '../api-helpers/api-helpers';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { GlobalLoader } from './Shared/UI/Feedback'; // Assuming you have this from previous steps

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    useEffect(() => {
        getAllMovies()
            .then((data) => setMovies(data.movies))
            .catch((err) => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    // --- CAROUSEL LOGIC ---
    // Auto-slide every 5 seconds
    useEffect(() => {
        if (movies.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % Math.min(movies.length, 5)); // Cycle top 5 movies
        }, 6000);
        return () => clearInterval(interval);
    }, [movies]);

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(movies.length, 5));
    };

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev - 1 + Math.min(movies.length, 5)) % Math.min(movies.length, 5));
    };

    // Get the movie to display based on current slide index
    const featuredMovie = movies.length > 0 ? movies[currentSlide] : null;

    return (
        <Box width={"100%"} minHeight={"100vh"} bgcolor={"#000000"}>
            <GlobalLoader open={loading} />

            {!loading && featuredMovie && (
                <>
                    {/* --- HERO SLIDER SECTION --- */}
                    <Box
                        width={"100%"}
                        height={"90vh"}
                        position="relative"
                        sx={{
                            overflow: 'hidden', // Hide scrollbars during transition
                        }}
                    >
                        {/* Background Image with Transition */}
                        <Box
                            key={featuredMovie._id} // Key triggers re-render animation
                            width={"100%"}
                            height={"100%"}
                            sx={{
                                backgroundImage: `url(${featuredMovie ? (featuredMovie.featuredUrl || featuredMovie.posterUrl) : 'https://wallpaperaccess.com/full/3658622.jpg'})`,
                                backgroundPosition: 'center top',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                animation: 'fadeIn 1s ease-in-out', // Smooth Fade In
                                '@keyframes fadeIn': {
                                    '0%': { opacity: 0.4, transform: 'scale(1.05)' },
                                    '100%': { opacity: 1, transform: 'scale(1)' },
                                },
                            }}
                        />

                        {/* Gradient Overlay */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0, left: 0, width: '100%', height: '100%',
                                background: 'linear-gradient(to top, #000000 10%, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.2) 100%)'
                            }}
                        />

                        {/* Navigation Arrows (Desktop Only) */}
                        {!isMobile && (
                            <>
                                <IconButton
                                    onClick={handlePrev}
                                    sx={{
                                        position: 'absolute', left: 20, top: '50%', color: 'white',
                                        bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: '#e50914' },
                                        zIndex: 3
                                    }}
                                >
                                    <ArrowBackIosNewIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handleNext}
                                    sx={{
                                        position: 'absolute', right: 20, top: '50%', color: 'white',
                                        bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: '#e50914' },
                                        zIndex: 3
                                    }}
                                >
                                    <ArrowForwardIosIcon />
                                </IconButton>
                            </>
                        )}

                        {/* Slide Indicators (Dots) */}
                        <Box
                            position="absolute"
                            bottom={30}
                            width="100%"
                            display="flex"
                            justifyContent="center"
                            gap={1}
                            zIndex={3}
                        >
                            {movies.slice(0, 5).map((_, index) => (
                                <Box
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    sx={{
                                        width: index === currentSlide ? 30 : 10,
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: index === currentSlide ? '#e50914' : 'rgba(255,255,255,0.5)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </Box>

                        {/* Text Content */}
                        <Container
                            maxWidth="lg"
                            sx={{
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                zIndex: 2,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center"
                            }}
                        >
                            <Box maxWidth="700px" sx={{ ml: { xs: 0, md: 4 }, textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography
                                    variant="overline"
                                    color="#e50914"
                                    fontWeight="bold"
                                    letterSpacing={2}
                                    sx={{
                                        mb: 2,
                                        borderLeft: { xs: 0, md: "4px solid #e50914" },
                                        pl: { xs: 0, md: 2 },
                                        background: "rgba(0,0,0,0.6)",
                                        backdropFilter: "blur(4px)",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        display: "inline-block"
                                    }}
                                >
                                    #{currentSlide + 1} FEATURED MOVIE
                                </Typography>

                                <Typography
                                    variant={isMobile ? "h4" : "h2"}
                                    fontWeight="900"
                                    color="white"
                                    sx={{
                                        textTransform: 'uppercase',
                                        lineHeight: 0.9,
                                        mb: 3,
                                        textShadow: "0 10px 30px rgba(0,0,0,0.9)",
                                        animation: "slideUp 0.8s ease-out",
                                        '@keyframes slideUp': {
                                            '0%': { transform: 'translateY(20px)', opacity: 0 },
                                            '100%': { transform: 'translateY(0)', opacity: 1 }
                                        }
                                    }}
                                >
                                    {featuredMovie.title}
                                </Typography>

                                <Typography
                                    variant="h6"
                                    color="#ccc"
                                    sx={{
                                        opacity: 0.9,
                                        mb: 4,
                                        fontWeight: 300,
                                        textShadow: "2px 2px 4px black",
                                        display: '-webkit-box',
                                        overflow: 'hidden',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 3,
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
                                            padding: '12px 35px',
                                            borderRadius: '50px',
                                            boxShadow: "0 0 20px rgba(229,9,20,0.6)",
                                            transition: "0.3s",
                                            '&:hover': { bgcolor: "#b20710", transform: "scale(1.05)" }
                                        }}
                                        startIcon={<ConfirmationNumberIcon />}
                                    >
                                        Book Ticket
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        size="large"
                                        sx={{
                                            color: "white",
                                            borderColor: "white",
                                            fontWeight: 'bold',
                                            padding: '12px 30px',
                                            borderRadius: '50px',
                                            backdropFilter: "blur(5px)",
                                            '&:hover': { borderColor: "#e50914", color: "#e50914" }
                                        }}
                                        startIcon={<PlayArrowIcon />}
                                    >
                                        Trailer
                                    </Button>
                                </Box>
                            </Box>
                        </Container>
                    </Box>

                    {/* --- LATEST RELEASES SECTION --- */}
                    <Container maxWidth="xl" sx={{ paddingY: 8 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={5} px={2}>
                            <Typography
                                variant="h4"
                                fontWeight="700"
                                color="white"
                                sx={{
                                    borderLeft: "5px solid #e50914",
                                    pl: 2,
                                    textShadow: "0 0 10px rgba(255,255,255,0.1)"
                                }}
                            >
                                Latest Releases
                            </Typography>

                            {!isMobile && (
                                <Button
                                    LinkComponent={Link}
                                    to="/movies"
                                    sx={{ color: "#e50914", fontWeight: 'bold', fontSize: "1rem" }}
                                >
                                    View All Movies &rarr;
                                </Button>
                            )}
                        </Box>

                        <Box
                            display="flex"
                            justifyContent="center"
                            flexWrap="wrap"
                            gap={5}
                        >
                            {movies && movies.slice(0, 4).map((movie, index) => (
                                <MovieItem
                                    key={index}
                                    id={movie._id}
                                    title={movie.title}
                                    posterUrl={movie.posterUrl}
                                    releaseDate={movie.releaseDate}
                                />
                            ))}
                        </Box>

                        {isMobile && (
                            <Box display="flex" justifyContent="center" marginTop={6}>
                                <Button
                                    LinkComponent={Link}
                                    to="/movies"
                                    variant='outlined'
                                    sx={{ color: "white", borderColor: "white", borderRadius: 20, px: 4 }}
                                >
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