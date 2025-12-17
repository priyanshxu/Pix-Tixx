import React from 'react';
import { Box, Container, Grid, Typography, TextField, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

// Custom dark text field styles
const textFieldStyles = {
    input: { color: 'white', fontFamily: "'Poppins', sans-serif" },
    label: { color: '#888', fontFamily: "'Poppins', sans-serif" },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#333' },
        '&:hover fieldset': { borderColor: '#e50914' },
        '&.Mui-focused fieldset': { borderColor: '#e50914' },
    },
};

const ContactItem = ({ icon, title, text }) => (
    <Box display="flex" alignItems="flex-start" gap={2} mb={4}>
        <Box sx={{ p: 1.5, bgcolor: "rgba(229, 9, 20, 0.1)", borderRadius: "12px", color: "#e50914" }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="subtitle1" fontWeight="bold" fontFamily="'Poppins', sans-serif" color="white">
                {title}
            </Typography>
            <Typography variant="body2" color="#aaa" fontFamily="'Poppins', sans-serif">
                {text}
            </Typography>
        </Box>
    </Box>
);

const Contact = () => {
    return (
        <Box sx={{ bgcolor: "#000", minHeight: "100vh", py: 8, display: "flex", alignItems: "center" }}>
            <Container maxWidth="lg">
                <Grid container spacing={6}>

                    {/* Left Side: Contact Info */}
                    <Grid item xs={12} md={5}>
                        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
                            <Typography variant="h3" fontWeight="800" fontFamily="'Poppins', sans-serif" color="white" gutterBottom>
                                Let's Talk
                            </Typography>
                            <Typography variant="body1" color="#888" fontFamily="'Poppins', sans-serif" mb={6}>
                                Have a question about a booking? Interested in partnering with us? Reach out directly.
                            </Typography>

                            <ContactItem icon={<LocationOnIcon />} title="Visit Us" text="RK Nagar, Patna, Bihar - 800020" />
                            <ContactItem icon={<PhoneIcon />} title="Call Us" text="+91 88407 05812" />
                            <ContactItem icon={<EmailIcon />} title="Email Us" text="support@pixtix.com" />
                        </motion.div>
                    </Grid>

                    {/* Right Side: Dark Form */}
                    <Grid item xs={12} md={7}>
                        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 5,
                                    bgcolor: "#111",
                                    borderRadius: 4,
                                    border: "1px solid #222"
                                }}
                            >
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Your Name" variant="outlined" sx={textFieldStyles} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Phone Number" variant="outlined" sx={textFieldStyles} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Email Address" variant="outlined" sx={textFieldStyles} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Message" multiline rows={4} variant="outlined" sx={textFieldStyles} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                fullWidth
                                                sx={{
                                                    bgcolor: "#e50914",
                                                    fontFamily: "'Poppins', sans-serif",
                                                    fontWeight: "bold",
                                                    py: 1.5,
                                                    fontSize: "1rem",
                                                    '&:hover': { bgcolor: "#ff1f1f" }
                                                }}
                                            >
                                                Send Message
                                            </Button>
                                        </motion.div>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </motion.div>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
};

export default Contact;