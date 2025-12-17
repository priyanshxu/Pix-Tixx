import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userActions } from "../../store";
import axios from "axios";
// Import new UI tools
import { GlobalLoader, CustomSnackbar } from "../Shared/UI/Feedback";

const BASE_URL = process.env.REACT_APP_API_URL

const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isSignup, setIsSignup] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "info" });

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    otp: ""
  });

  const showAlert = (message, severity = "error") => {
    setAlertInfo({ open: true, message, severity });
  };

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      if (!isOtpStep) handleSignup();
      else handleOtpVerification();
    } else {
      handleLogin();
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/user/signup`, {
        name: inputs.name,
        email: inputs.email,
        password: inputs.password,
      });

      if (res.data.message === "OTP_SENT") {
        setTempUserId(res.data.userId);
        setIsOtpStep(true);
        showAlert("Verification code sent to your email!", "success");
      }
    } catch (err) {
      console.log(err);
      showAlert(err.response?.data?.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/user/verify`, {
        userId: tempUserId,
        otp: inputs.otp
      });

      if (res.data.id) {
        showAlert("Verified! Welcome to Pix-Tix.", "success");
        // Small delay to let user read success message
        setTimeout(() => finalizeLogin(res.data), 1000);
      }
    } catch (err) {
      console.log(err);
      showAlert("Invalid Code. Please try again.", "error");
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/user/login`, {
        email: inputs.email,
        password: inputs.password,
      });

      if (res.data.id) {
        showAlert("Login Successful!", "success");
        setTimeout(() => finalizeLogin(res.data), 1000);
      }
    } catch (err) {
      console.log(err);
      // Custom error for wrong password usually comes as 400 or 404
      showAlert(err.response?.data?.message || "Incorrect Email or Password", "error");
      setLoading(false);
    }
  };

  const finalizeLogin = (data) => {
    localStorage.setItem("userId", data.id);
    dispatch(userActions.login());
    navigate("/");
    setLoading(false);
  };

  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
    >
      {/* Loaders and Alerts */}
      <GlobalLoader open={loading} />
      <CustomSnackbar
        open={alertInfo.open}
        message={alertInfo.message}
        severity={alertInfo.severity}
        onClose={() => setAlertInfo({ ...alertInfo, open: false })}
      />

      <Paper elevation={10} sx={{ padding: 4, borderRadius: 5, width: 350, bgcolor: "rgba(255,255,255,0.95)" }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" mb={3}>
          {isOtpStep ? "Verify Email" : isSignup ? "Create Account" : "Login"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>

            {isSignup && !isOtpStep && (
              <TextField name="name" value={inputs.name} onChange={handleChange} placeholder="Full Name" required />
            )}

            {!isOtpStep && (
              <TextField name="email" value={inputs.email} onChange={handleChange} type="email" placeholder="Email Address" required />
            )}

            {!isOtpStep && (
              <TextField name="password" value={inputs.password} onChange={handleChange} type="password" placeholder="Password" required />
            )}

            {isOtpStep && (
              <Box textAlign="center">
                <Typography variant="body2" color="textSecondary" mb={2}>
                  Enter the code sent to {inputs.email}
                </Typography>
                <TextField
                  name="otp"
                  value={inputs.otp}
                  onChange={handleChange}
                  placeholder="X X X X"
                  required
                  inputProps={{ style: { textAlign: 'center', letterSpacing: '8px', fontSize: '1.4rem' } }}
                />
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 2, borderRadius: 10, bgcolor: "#e50914", fontWeight: "bold",
                ":hover": { bgcolor: "#b20710" }
              }}
            >
              {isOtpStep ? "Verify & Join" : isSignup ? "Sign Up" : "Login"}
            </Button>

            {!isOtpStep && (
              <Button
                onClick={() => setIsSignup(!isSignup)}
                sx={{ borderRadius: 10, textTransform: "none", color: "#333" }}
              >
                {isSignup ? "Already have an account? Login" : "New to Pix-Tix? Sign Up"}
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Auth;