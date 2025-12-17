import React from 'react';
import { Box, Container, Grid, Typography, Avatar, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import ceoImg from "../assets/ceo.png";
import mdImg from "../assets/md.png";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

const TeamMember = ({ name, role, img, bio, delay }) => (
    <MotionCard
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(229, 9, 20, 0.3)" }} // Red glow on hover
        sx={{
            height: '100%',
            bgcolor: "#1e1e1e", // Dark Card Background
            color: "white",
            borderRadius: 4,
            border: "1px solid #333",
            textAlign: 'center',
            p: 4,
            position: 'relative',
            overflow: 'visible'
        }}
    >
        <Avatar
            src={img}
            alt={name}
            sx={{
                width: 160,
                height: 160,
                margin: '-80px auto 20px', // Pull avatar up
                border: "4px solid #111",
                boxShadow: "0 0 20px rgba(0,0,0,0.8)"
            }}
        />
        <CardContent>
            <Typography variant="h5" fontWeight="700" fontFamily="'Poppins', sans-serif" gutterBottom>
                {name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#e50914", fontWeight: "600", fontFamily: "'Poppins', sans-serif", mb: 2 }}>
                {role}
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa", lineHeight: 1.8, fontFamily: "'Poppins', sans-serif" }}>
                {bio}
            </Typography>
        </CardContent>
    </MotionCard>
);

const About = () => {
    return (
        <Box sx={{ bgcolor: "#000", color: "white", minHeight: "100vh", py: 10, overflowX: "hidden" }}>
            <Container maxWidth="lg">

                {/* Hero Text */}
                <MotionBox
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    textAlign="center"
                    mb={12}
                >
                    <Typography variant="h2" fontWeight="800" fontFamily="'Poppins', sans-serif" gutterBottom sx={{ background: "linear-gradient(45deg, #e50914, #ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        The Visionaries
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#888", maxWidth: "700px", mx: "auto", fontFamily: "'Poppins', sans-serif" }}>
                        Pix-Tix is bridging the gap between small-town cinema lovers and world-class technology. Born in Patna, built for India.
                    </Typography>
                </MotionBox>

                {/* Leadership Grid */}
                <Grid container spacing={8} justifyContent="center" alignItems="stretch">
                    <Grid item xs={12} md={5}>
                        <TeamMember
                            name="Priyanshu Kumar Singh"
                            role="Chief Executive Officer (CEO)"
                            img={ceoImg}
                            delay={0.2}
                            bio="The architect behind the platform. Priyanshu combines technical expertise with a deep understanding of Tier-2 markets to create a seamless, glitch-free booking experience."
                        />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <TeamMember
                            name="Sanjay Kumar Singh"
                            role="Managing Director (MD)"
                            img={mdImg}
                            delay={0.4}
                            bio="The strategic backbone of Pix-Tix. Sanjay brings decades of operational leadership, ensuring that our growth is robust, sustainable, and focused on customer satisfaction."
                        />
                    </Grid>
                </Grid>

            </Container>
        </Box>
    );
};

export default About;