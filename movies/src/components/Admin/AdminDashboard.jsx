import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions, Grid, IconButton, Container, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieIcon from '@mui/icons-material/Movie';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);

    const fetchMovies = () => {
        axios.get(`/movie`)
            .then(res => setMovies(res.data.movies))
            .catch(err => console.log(err));
    };

    useEffect(() => {
        if (!localStorage.getItem("adminToken")) navigate("/admin");
        fetchMovies();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this movie? This cannot be undone.")) return;

        try {
            await axios.delete(`/movie/${id}`);
            fetchMovies();
        } catch (err) {
            alert("Error deleting movie");
        }
    };

    return (
        <Box minHeight="100vh" bgcolor="#0a0a0a" color="white" py={5} fontFamily="'Poppins', sans-serif">
            <Container maxWidth="xl">

                {/* --- HEADER SECTION --- */}
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={6} gap={2}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: '#e50914', letterSpacing: 1 }}>
                            Admin Dashboard
                        </Typography>
                        <Typography variant="body2" color="gray">
                            Manage your movies, shows, and theatre configurations.
                        </Typography>
                    </Box>

                    {/* Quick Stats Chip */}
                    <Chip
                        icon={<MovieIcon style={{ color: 'white' }} />}
                        label={`Total Movies: ${movies.length}`}
                        sx={{ bgcolor: '#333', color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2.5, px: 1 }}
                    />

                    <Box display="flex" gap={2}>
                        <Button
                            variant="outlined"
                            startIcon={<SettingsSuggestIcon />}
                            onClick={() => navigate("/admin/config")}
                            sx={{
                                color: "white", borderColor: "#555", borderRadius: 2, px: 3,
                                '&:hover': { borderColor: "#e50914", color: "#e50914" }
                            }}
                        >
                            Manage Shows
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => navigate("/admin/add")}
                            sx={{
                                bgcolor: "#e50914", fontWeight: 'bold', borderRadius: 2, px: 3,
                                '&:hover': { bgcolor: "#b20710" }
                            }}
                        >
                            Add Movie
                        </Button>
                    </Box>
                </Box>

                {/* --- MOVIE GRID SECTION --- */}
                <Typography variant="h5" fontWeight="600" mb={3} borderLeft="4px solid #e50914" pl={2}>
                    Movie Library
                </Typography>

                {movies.length === 0 ? (
                    <Box textAlign="center" py={10} color="#555">
                        <MovieIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6">No movies added yet.</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {movies.map((movie) => (
                            <Grid item xs={12} sm={6} md={3} key={movie._id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        bgcolor: "#1a1a1a",
                                        color: "white",
                                        borderRadius: 3,
                                        border: "1px solid #333",
                                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                        '&:hover': {
                                            transform: "translateY(-5px)",
                                            boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
                                            border: "1px solid #555"
                                        }
                                    }}
                                >
                                    <Box position="relative">
                                        <img
                                            src={movie.posterUrl}
                                            alt={movie.title}
                                            style={{ width: "100%", height: "320px", objectFit: "cover" }}
                                        />
                                        <Box
                                            position="absolute" top={10} right={10}
                                            bgcolor="rgba(0,0,0,0.7)" borderRadius={1} px={1} py={0.5}
                                            display="flex" alignItems="center" gap={0.5}
                                        >
                                            <CalendarMonthIcon sx={{ fontSize: 14, color: "#e50914" }} />
                                            <Typography variant="caption" fontWeight="bold">
                                                {new Date(movie.releaseDate).getFullYear()}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                                        <Typography variant="h6" fontWeight="bold" noWrap title={movie.title}>
                                            {movie.title}
                                        </Typography>
                                        <Typography variant="caption" color="gray" display="block" mb={1}>
                                            Released: {new Date(movie.releaseDate).toLocaleDateString()}
                                        </Typography>
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0 }}>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => navigate(`/admin/config/edit/${movie._id}`)}
                                            sx={{
                                                color: "#aaa",
                                                textTransform: 'none',
                                                '&:hover': { color: "white" }
                                            }}
                                        >
                                            Edit Details
                                        </Button>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(movie._id)}
                                            sx={{
                                                color: "#e50914",
                                                bgcolor: 'rgba(229, 9, 20, 0.1)',
                                                '&:hover': { bgcolor: "#e50914", color: "white" }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default AdminDashboard;