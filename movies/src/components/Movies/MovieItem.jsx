import { Button, Card, CardActions, CardContent, Typography, Box } from '@mui/material';
import React from 'react';
import { Link } from "react-router-dom";

const MovieItem = ({ title, releaseDate, posterUrl, id }) => {
  return (
    <Card
      sx={{
        width: 260,
        borderRadius: 5,
        // GLASSMORPHISM STYLES
        background: "rgba(255, 255, 255, 0.05)", // Very sheer white
        backdropFilter: "blur(10px)",            // The "Frost" effect
        border: "1px solid rgba(255, 255, 255, 0.1)", // Subtle border
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        color: "white", // Force text white
        transition: "all 0.3s ease-in-out",
        ":hover": {
          transform: "translateY(-10px)",
          boxShadow: "0 15px 40px rgba(229, 9, 20, 0.4)", // Red glow on hover
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