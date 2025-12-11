import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import logo from "../assets/logo.png"; // Reuse your logo

const Footer = () => {
    return (
        <Box bgcolor="#111" color="#aaa" py={6} borderTop="1px solid #333">
            <Container maxWidth="lg">
                <Grid container spacing={5}>

                    {/* Column 1: Brand & Bio */}
                    <Grid item xs={12} md={4}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <img src={logo} alt="Pix-Tix" style={{ height: "40px", borderRadius: "50%" }} />
                            <Typography variant="h5" fontWeight="bold" color="white" fontFamily="'Poppins', sans-serif">PIX-TIX</Typography>
                        </Box>
                        <Typography variant="body2" lineHeight={1.8} fontFamily="'Poppins', sans-serif">
                            Your ultimate destination for booking movies online. Experience the magic of cinema with seamless booking and exclusive offers.
                        </Typography>
                        <Box mt={2}>
                            <IconButton sx={{ color: "#aaa", '&:hover': { color: "#e50914" } }}><FacebookIcon /></IconButton>
                            <IconButton sx={{ color: "#aaa", '&:hover': { color: "#e50914" } }}><TwitterIcon /></IconButton>
                            <IconButton sx={{ color: "#aaa", '&:hover': { color: "#e50914" } }}><InstagramIcon /></IconButton>
                            <IconButton sx={{ color: "#aaa", '&:hover': { color: "#e50914" } }}><YouTubeIcon /></IconButton>
                        </Box>
                    </Grid>

                    {/* Column 2: Quick Links */}
                    <Grid item xs={6} md={2}>
                        <Typography variant="h6" color="white" gutterBottom fontWeight="bold" fontFamily="'Poppins', sans-serif">Company</Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Link href="#" color="inherit" underline="hover" fontFamily="'Poppins', sans-serif">About Us</Link>
                            <Link href="#" color="inherit" underline="hover" fontFamily="'Poppins', sans-serif">Careers</Link>
                            <Link href="#" color="inherit" underline="hover" fontFamily="'Poppins', sans-serif">Contact Us</Link>
                            <Link href="#" color="inherit" underline="hover" fontFamily="'Poppins', sans-serif">Press</Link>
                        </Box>
                    </Grid>

                    {/* Column 3: Support */}
                    <Grid item xs={6} md={2}>
                        <Typography variant="h6" color="white" gutterBottom fontWeight="bold" fontFamily="'Poppins', sans-serif">Support</Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Link href="#" color="inherit" underline="hover" fontFamily="'Poppins', sans-serif">Help Center</Link>
                            <Link href="#" color="inherit" underline="hover" fontFamily="'Poppins', sans-serif">Terms of Use</Link>
                            <Link href="#" color="inherit" underline="hover" fontFamily="'Poppins', sans-serif">Privacy Policy</Link>
                            <Link href="#" color="inherit" underline="hover" fontFamily="'Poppins', sans-serif">Refund Policy</Link>
                        </Box>
                    </Grid>

                    {/* Column 4: Contact */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" color="white" gutterBottom fontWeight="bold" fontFamily="'Poppins', sans-serif">Contact</Typography>
                        <Typography variant="body2" mb={1} fontFamily="'Poppins', sans-serif">Email: support@pixtix.com</Typography>
                        <Typography variant="body2" fontFamily="'Poppins', sans-serif">Phone: +91 98765 43210</Typography>
                        <Typography variant="caption" display="block" mt={2} color="#666" fontFamily="'Poppins', sans-serif">
                            123 Cinema Street, Film City, Mumbai - 400001
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, bgcolor: "#333" }} />

                <Typography variant="body2" textAlign="center" fontFamily="'Poppins', sans-serif">
                    &copy; {new Date().getFullYear()} Pix-Tix Pvt Ltd. All Rights Reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;