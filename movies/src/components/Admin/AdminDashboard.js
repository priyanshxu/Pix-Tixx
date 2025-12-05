import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions, Grid, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);

    const fetchMovies = () => {
        axios.get("http://localhost:5000/movie")
            .then(res => setMovies(res.data.movies))
            .catch(err => console.log(err));
    };

    useEffect(() => {
        if (!localStorage.getItem("adminToken")) navigate("/admin");
        fetchMovies();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this movie?")) return;

        try {
            await axios.delete(`http://localhost:5000/movie/${id}`);
            fetchMovies(); // Refresh list
            alert("Movie Deleted");
        } catch (err) {
            alert("Error deleting movie");
        }
    };

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

            <Typography variant="h5" mb={2}>Movie Management</Typography>
            <Grid container spacing={2}>
                {movies.map((movie) => (
                    <Grid item xs={12} sm={6} md={3} key={movie._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <img src={movie.posterUrl} alt={movie.title} style={{ width: "100%", height: "250px", objectFit: "cover" }} />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" noWrap>{movie.title}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {new Date(movie.releaseDate).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                <Button
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => navigate(`/admin/edit/${movie._id}`)}
                                    sx={{ color: "#2b2d42" }}
                                >
                                    Edit
                                </Button>
                                <IconButton
                                    color="error"
                                    onClick={() => handleDelete(movie._id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default AdminDashboard;