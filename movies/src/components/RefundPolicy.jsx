import React from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';

const RefundPolicy = () => {
    return (
        <Box bgcolor="#000" minHeight="100vh" py={8}>
            <Container maxWidth="md">
                <Paper sx={{ p: 5, bgcolor: "#111", color: "white", borderRadius: 4, border: "1px solid #333" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom color="#e50914">Cancellation & Refund Policy</Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>Last Updated: December 2025</Typography>

                <Box mt={3}>
                    <Typography variant="h6" fontWeight="bold">1. Ticket Cancellation</Typography>
                    <Typography paragraph>
                        Pix-Tix offers a flexible cancellation policy. Tickets can be cancelled up to <strong>20 minutes before the showtime</strong>.
                    </Typography>
                    <List dense>
                        <ListItem><ListItemText primary="• 75% refund if cancelled 2 hours prior to showtime." /></ListItem>
                        <ListItem><ListItemText primary="• 50% refund if cancelled between 2 hours to 20 mins prior." /></ListItem>
                        <ListItem><ListItemText primary="• No refund is applicable if cancelled within 20 minutes of the show start." /></ListItem>
                    </List>
                </Box>

                <Box mt={3}>
                    <Typography variant="h6" fontWeight="bold">2. Refund Process</Typography>
                    <Typography paragraph>
                        Refunds will be credited to your <strong>Pix-Tix Wallet</strong> instantly. If you requested a refund to the original payment source (Bank/UPI), it may take <strong>5-7 business days</strong> depending on your bank's processing time.
                    </Typography>
                </Box>

                <Box mt={3}>
                    <Typography variant="h6" fontWeight="bold">3. Show Cancellations</Typography>
                    <Typography paragraph>
                        In the rare event that a cinema cancels a show due to technical issues, a <strong>100% full refund</strong> will be initiated automatically to your original payment method.
                    </Typography>
                </Box>
            </Paper>
            </Container>
            </Box>
    );
};

export default RefundPolicy;