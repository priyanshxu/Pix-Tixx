import React from 'react';
import { Container, Typography, Box, Divider, Paper } from '@mui/material';

const Privacy = () => {
    return (
        <Box bgcolor="#000" minHeight="100vh" py={8}>
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper sx={{ p: 5, bgcolor: "#111", color: "white", borderRadius: 4, border: "1px solid #333" }}>
            <Box mb={6}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>Privacy Policy</Typography>
                <Typography paragraph>
                    At <strong>Pix-Tix Pvt Ltd</strong>, we value your trust. This policy outlines how we handle your personal data when you use our website or mobile application.
                </Typography>

                <Typography variant="h6" fontWeight="bold" mt={2}>Data Collection</Typography>
                <Typography paragraph>
                    We collect basic information required to book tickets, including your Name, Email, Phone Number, and Payment Information. We do not store your full credit card details; they are processed securely by our payment gateway partners.
                </Typography>

                <Typography variant="h6" fontWeight="bold" mt={2}>Usage of Information</Typography>
                <Typography paragraph>
                    Your data is used solely for:
                    1. Processing your ticket bookings.
                    2. Sending booking confirmations (Email/SMS).
                    3. Customer support assistance.
                </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>Terms of Use</Typography>
                <Typography paragraph>
                    Welcome to Pix-Tix. By accessing our platform, you agree to the following terms:
                </Typography>

                <Typography variant="h6" fontWeight="bold" mt={2}>1. Ticket Resale</Typography>
                <Typography paragraph>
                    Unlawful resale (black marketing) of tickets purchased on Pix-Tix is strictly prohibited. We reserve the right to cancel bookings if suspicious activity is detected.
                </Typography>

                <Typography variant="h6" fontWeight="bold" mt={2}>2. Entry & Security</Typography>
                <Typography paragraph>
                    Admission rights are reserved by the Cinema Management. You must carry the m-ticket (QR Code) sent to your email/phone for entry. Pix-Tix is not responsible for entry denial due to late arrival or misbehavior at the venue.
                </Typography>

                <Typography variant="h6" fontWeight="bold" mt={2}>3. Jurisdiction</Typography>
                <Typography paragraph>
                    Any legal disputes arising from the use of Pix-Tix shall be subject to the exclusive jurisdiction of the courts in <strong>Patna, Bihar</strong>.
                </Typography>
                    </Box>
                    </Paper>
            </Container>
            </Box>
    );
};

export default Privacy;