import { Box, Typography, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getAllMovies } from '../../api-helpers/api-helpers';
import MovieItem from './MovieItem';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllMovies()
      .then((data) => setMovies(data.movies))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#000000", // Pure Black
        paddingBottom: 5,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="center"
        paddingTop={6}
        marginBottom={4}
      >
        <Typography
          variant="h4"
          sx={{
            // Glassy Header Style - Darker for Black BG
            background: "rgba(20, 20, 20, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(50, 50, 50, 0.5)",
            borderBottom: "4px solid #e50914", // Red Underline accent
            color: "white",
            width: { xs: "90%", md: "40%" },
            borderRadius: "50px",
            textAlign: "center",
            padding: "15px 0",
            boxShadow: "0px 10px 30px rgba(229, 9, 20, 0.2)", // Red Glow
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "3px",
          }}
        >
          Now Showing
        </Typography>
      </Box>

      {/* Movies Grid */}
      <Box
        width={"90%"}
        margin={"auto"}
        display={'flex'}
        justifyContent={"center"}
        flexWrap={"wrap"}
        gap={5}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" marginTop={10}>
            <CircularProgress sx={{ color: "#e50914" }} />
          </Box>
        ) : (
          movies &&
          movies.map((movie, index) => (
            <MovieItem
              key={index}
              id={movie._id}
              posterUrl={movie.posterUrl}
              releaseDate={movie.releaseDate}
              title={movie.title}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default Movies;