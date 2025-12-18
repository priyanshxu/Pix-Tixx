import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider, TextField, Button } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SendIcon from '@mui/icons-material/Send';
import logo from "../assets/logo.png";
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink to prevent page refresh

const Footer = () => {
    return (
        <Box bgcolor="#0a0a0a" color="#aaa" pt={8} pb={4} borderTop="1px solid #222">
            <Container maxWidth="lg">
                <Grid container spacing={5}>

                    {/* Column 1: Brand */}
                    <Grid item xs={12} md={4}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <img src={logo} alt="Pix-Tix" style={{ height: "40px", borderRadius: "50%", border: '1px solid #e50914' }} />
                            <Typography variant="h5" fontWeight="bold" color="white" fontFamily="'Poppins', sans-serif">PIX-TIX</Typography>
                        </Box>
                        <Typography variant="body2" lineHeight={1.8} fontFamily="'Poppins', sans-serif" sx={{ mb: 2 }}>
                            Your ultimate destination for booking movies online. Experience the magic of cinema with seamless booking and exclusive offers.
                        </Typography>
                        <Box>
                            <IconButton sx={{ color: "#aaa", transition: '0.3s', '&:hover': { color: "#e50914", transform: 'translateY(-3px)' } }}><FacebookIcon /></IconButton>
                            <IconButton sx={{ color: "#aaa", transition: '0.3s', '&:hover': { color: "#e50914", transform: 'translateY(-3px)' } }}><TwitterIcon /></IconButton>
                            <IconButton sx={{ color: "#aaa", transition: '0.3s', '&:hover': { color: "#e50914", transform: 'translateY(-3px)' } }}><InstagramIcon /></IconButton>
                            <IconButton sx={{ color: "#aaa", transition: '0.3s', '&:hover': { color: "#e50914", transform: 'translateY(-3px)' } }}><YouTubeIcon /></IconButton>
                        </Box>
                    </Grid>

                    {/* Column 2: Quick Links (Restored) */}
                    <Grid item xs={6} md={2}>
                        <Typography variant="h6" color="white" gutterBottom fontWeight="bold" fontFamily="'Poppins', sans-serif">Company</Typography>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                            <Link component={RouterLink} to="/about" color="inherit" underline="none" sx={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', '&:hover': { color: "#e50914" } }}>About Us</Link>
                            <Link component={RouterLink} to="#" color="inherit" underline="none" sx={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', '&:hover': { color: "#e50914" } }}>Careers</Link>
                            <Link component={RouterLink} to="/contact" color="inherit" underline="none" sx={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', '&:hover': { color: "#e50914" } }}>Contact Us</Link>
                            <Link component={RouterLink} to="#" color="inherit" underline="none" sx={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', '&:hover': { color: "#e50914" } }}>Press</Link>
                        </Box>
                    </Grid>

                    {/* Column 3: Support (Restored) */}
                    <Grid item xs={6} md={2}>
                        <Typography variant="h6" color="white" gutterBottom fontWeight="bold" fontFamily="'Poppins', sans-serif">Support</Typography>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                            <Link component={RouterLink} to="#" color="inherit" underline="none" sx={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', '&:hover': { color: "#e50914" } }}>Help Center</Link>
                            <Link component={RouterLink} to="#" color="inherit" underline="none" sx={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', '&:hover': { color: "#e50914" } }}>Terms of Use</Link>
                            <Link component={RouterLink} to="/privacy" color="inherit" underline="none" sx={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', '&:hover': { color: "#e50914" } }}>Privacy Policy</Link>
                            <Link component={RouterLink} to="/refund-policy" color="inherit" underline="none" sx={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', '&:hover': { color: "#e50914" } }}>Refund Policy</Link>
                        </Box>
                    </Grid>

                    {/* Column 4: Newsletter */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" color="white" gutterBottom fontWeight="bold" fontFamily="'Poppins', sans-serif">Subscribe</Typography>
                        <Typography variant="body2" mb={2} fontFamily="'Poppins', sans-serif">
                            Get the latest movie updates and offers.
                        </Typography>
                        <Box component="form" display="flex" gap={1}>
                            <TextField
                                variant="outlined"
                                placeholder="Email Address"
                                size="small"
                                sx={{
                                    bgcolor: '#1a1a1a',
                                    borderRadius: 1,
                                    width: '100%',
                                    input: { color: 'white', fontFamily: "'Poppins', sans-serif" }
                                }}
                            />
                            <Button variant="contained" sx={{ bgcolor: '#e50914', '&:hover': { bgcolor: '#b20710' } }}>
                                <SendIcon fontSize="small" />
                            </Button>
                        </Box>
                        <Typography variant="caption" display="block" mt={2} color="#555" fontFamily="'Poppins', sans-serif">
                            RK Nagar, Patna, Bihar - 800020
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, bgcolor: "#222" }} />

                <Typography variant="body2" textAlign="center" fontFamily="'Poppins', sans-serif" color="#666">
                    &copy; {new Date().getFullYear()} Pix-Tix Pvt Ltd. All Rights Reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;