import { Button, Card, CardActions, CardContent, Typography, Box } from '@mui/material';
import React from 'react';
import { Link } from "react-router-dom";

const MovieItem = ({ title, releaseDate, posterUrl, id }) => {
  return (
    <Card
      sx={{
        // 1. MAKE WIDTH FLUID & CENTERED
        width: "100%",
        maxWidth: 280, // Keeps the card from getting too huge on tablets
        margin: "auto", // Centers the card in its grid cell
        borderRadius: 5,

        // GLASSMORPHISM STYLES (Kept as is)
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        color: "white",
        transition: "all 0.3s ease-in-out",
        ":hover": {
          transform: "translateY(-10px)",
          boxShadow: "0 15px 40px rgba(229, 9, 20, 0.4)",
          border: "1px solid rgba(229, 9, 20, 0.5)",
        },
      }}
    >
      <Box sx={{ height: 320, width: "100%", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <img
          src={posterUrl}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      <CardContent>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ fontWeight: 'bold', minHeight: '60px', lineHeight: 1.2, textShadow: "0 2px 5px rgba(0,0,0,0.5)" }}
        >
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
          Release: {new Date(releaseDate).toLocaleDateString()}
        </Typography>
      </CardContent>

      <CardActions sx={{ padding: 2, paddingTop: 0 }}>
        <Button
          variant="contained"
          LinkComponent={Link}
          to={`/movie/${id}`}
          fullWidth
          sx={{
            backgroundColor: "#e50914",
            borderRadius: "20px",
            fontWeight: "bold",
            boxShadow: "0 4px 15px rgba(229,9,20,0.4)",
            ":hover": {
              backgroundColor: "#b20710",
              boxShadow: "0 6px 20px rgba(229,9,20,0.6)",
            },
            textTransform: "none",
            fontSize: "1rem"
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default MovieItem;