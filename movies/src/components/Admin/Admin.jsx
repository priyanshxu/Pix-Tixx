import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_URL

const AdminLogin = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Assuming your backend has this route
      const res = await axios.post(`/admin/config/login`, inputs);

      if (res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminId", res.data.id);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      alert("Invalid Admin Credentials");
      console.error(err);
    }
  };

  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ background: "linear-gradient(to right, #141e30, #243b55)" }}
    >
      <Paper elevation={10} sx={{ padding: 4, width: 350, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#e50914">
          Pix-Tix Admin
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Authorized Personnel Only
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={inputs.email}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={inputs.password}
            onChange={handleChange}
            margin="normal"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, bgcolor: "#e50914", fontWeight: "bold" }}
          >
            Access Dashboard
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminLogin;