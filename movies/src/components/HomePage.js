import { Box, Button, Typography, Container, useTheme, useMediaQuery } from '@mui/material';
import React, { useEffect, useState } from 'react';
import MovieItem from './Movies/MovieItem';
import { Link, useNavigate } from 'react-router-dom';
import { getAllMovies } from '../api-helpers/api-helpers';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    useEffect(() => {
        getAllMovies()
            .then((data) => setMovies(data.movies))
            .catch((err) => console.log(err));
    }, []);

    const featuredMovie = movies && movies.length > 0 ? movies[0] : null;

    return (
        <Box width={"100%"} minHeight={"100vh"} bgcolor={"#000000"}> {/* Pure Black */}

            {/* HERO SECTION */}
            <Box
                width={"100%"}
                height={"85vh"}
                position="relative"
                sx={{
                    backgroundImage: `url(${featuredMovie ? featuredMovie.posterUrl : 'https://wallpaperaccess.com/full/3658622.jpg'})`,
                    backgroundPosition: 'center top',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Gradient Overlay - Fades into Black */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        background: 'linear-gradient(to top, #000000 10%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.4) 100%)'
                    }}
                />

                <Container maxWidth="lg" sx={{ height: "100%", position: "relative", zIndex: 2 }}>
                    <Box
                        height="100%"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        maxWidth="600px"
                    >
                        <Typography
                            variant="overline"
                            color="#e50914"
                            fontWeight="bold"
                            letterSpacing={2}
                            sx={{
                                mb: 1, borderLeft: "4px solid #e50914", pl: 2,
                                background: "rgba(0,0,0,0.6)",
                                backdropFilter: "blur(5px)",
                                pr: 1
                            }}
                        >
                            #1 TRENDING TODAY
                        </Typography>

                        <Typography
                            variant={isMobile ? "h3" : "h1"}
                            fontWeight="900"
                            color="white"
                            sx={{ textTransform: 'uppercase', lineHeight: 0.9, mb: 2, textShadow: "0 10px 30px rgba(0,0,0,0.9)" }}
                        >
                            {featuredMovie ? featuredMovie.title : "Loading..."}
                        </Typography>

                        <Typography
                            variant="h6"
                            color="#bbb"
                            sx={{ opacity: 0.9, mb: 4, fontWeight: 300, textShadow: "0 2px 5px black" }}
                        >
                            {featuredMovie ? featuredMovie.description.slice(0, 150) + "..." : "Experience the best cinema."}
                        </Typography>

                        <Box display="flex" gap={2}>
                            <Button
                                onClick={() => featuredMovie && navigate(`/booking/${featuredMovie._id}`)}
                                variant="contained"
                                size="large"
                                sx={{
                                    bgcolor: "#e50914",
                                    color: "white",
                                    fontWeight: 'bold',
                                    padding: '12px 30px',
                                    borderRadius: '50px',
                                    boxShadow: "0 0 20px rgba(229,9,20,0.5)", // Red Glow
                                    '&:hover': { bgcolor: "#b20710" }
                                }}
                                startIcon={<ConfirmationNumberIcon />}
                            >
                                Book Ticket
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* LATEST RELEASES */}
            <Container maxWidth="xl" sx={{ paddingY: 8 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={5} px={2}>
                    <Typography
                        variant="h4"
                        fontWeight="700"
                        color="white"
                        sx={{
                            borderLeft: "5px solid #e50914", pl: 2,
                        }}
                    >
                        Latest Releases
                    </Typography>

                    {!isMobile && (
                        <Button
                            LinkComponent={Link}
                            to="/movies"
                            sx={{ color: "#e50914", fontWeight: 'bold' }}
                        >
                            View All Movies &rarr;
                        </Button>
                    )}
                </Box>

                <Box display="flex" justifyContent="center" flexWrap="wrap" gap={5}>
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
        </Box>
    );
};

export default HomePage;