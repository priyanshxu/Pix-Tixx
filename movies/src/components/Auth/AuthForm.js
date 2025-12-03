import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    FormLabel,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

// Define consistent styles for labels and buttons
const labelStyle = { mt: 2, mb: 1, fontWeight: 'bold', color: '#333' };
const primaryColor = "#4a90e2";

// === MODIFIED: Added handleClose prop ===
const AuthForm = ({ onSubmit, isAdmin, handleClose }) => {
    const [isSignup, setisSignup] = useState(false);
    const [inputs, setinputs] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setinputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ inputs, signup: isAdmin ? false : isSignup });
    };

    return (
        <Dialog
            // The 'open' prop should ideally be controlled by a state in the parent component
            // In this component, we keep it as 'true' to ensure it's displayed, 
            // and rely on 'handleClose' to signal the parent to close it.
            PaperProps={{
                style: {
                    borderRadius: 20,
                    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
                    padding: '20px',
                    width: '450px',
                },
            }}
            open={true}
            // If the user clicks outside the dialog, it should also close (optional)
            onClose={handleClose}
        >
            {/* Close Button at top right */}
            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                {/* === MODIFIED: Added onClick={handleClose} === */}
                <IconButton onClick={handleClose}>
                    <CloseIcon sx={{ color: '#aaa' }} />
                </IconButton>
            </Box>

            {/* Title */}
            <DialogTitle align="center" sx={{ pt: 4, pb: 2 }}>
                <Typography variant="h4" fontWeight="600" color={primaryColor}>
                    {isSignup ? "Create Account" : (isAdmin ? "Admin Login" : "User Login")}
                </Typography>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <Box
                    paddingX={4}
                    paddingY={2}
                    display={"flex"}
                    flexDirection={"column"}
                    alignContent={"center"}
                >
                    {/* Name Field (Conditional) */}
                    {!isAdmin && isSignup && (
                        <>
                            <FormLabel sx={labelStyle}>Name</FormLabel>
                            <TextField
                                value={inputs.name}
                                onChange={handleChange}
                                margin="dense"
                                variant="outlined"
                                type={"text"}
                                name="name"
                                size="small"
                                fullWidth
                            />
                        </>
                    )}

                    {/* Email Field */}
                    <FormLabel sx={labelStyle}>Email</FormLabel>
                    <TextField
                        value={inputs.email}
                        onChange={handleChange}
                        margin="dense"
                        variant="outlined"
                        type={"email"}
                        name="email"
                        size="small"
                        fullWidth
                    />

                    {/* Password Field */}
                    <FormLabel sx={labelStyle}>Password</FormLabel>
                    <TextField
                        value={inputs.password}
                        onChange={handleChange}
                        margin="dense"
                        variant="outlined"
                        type={"password"}
                        name="password"
                        size="small"
                        fullWidth
                    />

                    {/* Submit Button */}
                    <Button
                        variant="contained"
                        sx={{
                            mt: 4,
                            borderRadius: 10,
                            bgcolor: primaryColor,
                            py: 1.5,
                            '&:hover': {
                                bgcolor: '#3a77b9',
                            }
                        }}
                        type="submit"
                        fullWidth
                    >
                        {isSignup ? "Signup" : "Login"}
                    </Button>

                    {/* Switch Button (Conditional) */}
                    {!isAdmin && (
                        <Button
                            onClick={() => setisSignup(!isSignup)}
                            sx={{
                                mt: 2,
                                borderRadius: 10,
                                color: primaryColor,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    bgcolor: 'rgba(74, 144, 226, 0.08)',
                                    textDecoration: 'underline',
                                }
                            }}
                            fullWidth
                        >
                            Switch To {isSignup ? "Login" : "Signup"}
                        </Button>
                    )}
                </Box>
            </form>
        </Dialog>
    );
};

export default AuthForm;