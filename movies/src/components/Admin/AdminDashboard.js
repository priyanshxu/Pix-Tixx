import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        // Check Auth
        if (!localStorage.getItem("adminToken")) {
            navigate("/admin");
        }
        // Fetch Movies
        axios.get("http://localhost:5000/movie")
            .then(res => setMovies(res.data.movies))
            .catch(err => console.log(err));
    }, [navigate]);

    return (
        <Box padding={4} bgcolor="#f4f6f8" minHeight="100vh">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Admin Dashboard</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => navigate("/admin/add")}
                    sx={{ bgcolor: "#e50914" }}
                >
                    Add New Movie
                </Button>
            </Box>

            {/* Stats Overview */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: "#222", color: "white" }}>
                        <CardContent>
                            <Typography variant="h6">Active Movies</Typography>
                            <Typography variant="h3">{movies.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {/* You can add more cards for Total Bookings, Revenue, etc */}
            </Grid>

            <Typography variant="h5" mb={2}>Movie Management</Typography>
            <Grid container spacing={2}>
                {movies.map((movie) => (
                    <Grid item xs={12} sm={6} md={3} key={movie._id}>
                        <Card>
                            <img src={movie.posterUrl} alt={movie.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                            <CardContent>
                                <Typography variant="h6" noWrap>{movie.title}</Typography>
                                <Typography variant="caption">Release: {new Date(movie.releaseDate).toLocaleDateString()}</Typography>
                                {/* Add Edit/Delete Buttons here if needed */}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default AdminDashboard;