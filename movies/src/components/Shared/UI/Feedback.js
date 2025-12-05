import React from 'react';
import { Backdrop, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// 1. Full Screen Loading Spinner
export const GlobalLoader = ({ open }) => (
    <Backdrop
        sx={{ color: '#e50914', zIndex: (theme) => theme.zIndex.drawer + 999 }}
        open={open}
    >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" color="white" fontWeight="bold" sx={{ textShadow: "0 2px 4px black" }}>
                Loading Pix-Tix...
            </Typography>
        </Box>
    </Backdrop>
);

// 2. Toast Notification (Replaces simple Alerts)
export const CustomSnackbar = ({ open, message, severity, onClose }) => (
    <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
        <Alert onClose={onClose} severity={severity} sx={{ width: '100%', boxShadow: 3, fontWeight: 'bold' }}>
            {message}
        </Alert>
    </Snackbar>
);

// 3. Success Dialog (For Booking Confirmation)
export const SuccessDialog = ({ open, title, message, onConfirm, btnText }) => (
    <Dialog
        open={open}
        onClose={onConfirm}
        PaperProps={{
            sx: {
                borderRadius: 3,
                padding: 2,
                textAlign: "center",
                minWidth: "300px"
            }
        }}
    >
        <Box display="flex" justifyContent="center" mt={2}>
            <CheckCircleIcon sx={{ fontSize: 60, color: "#4CAF50" }} />
        </Box>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>{title}</DialogTitle>
        <DialogContent>
            <Typography variant="body1" color="text.secondary">
                {message}
            </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 1 }}>
            <Button
                onClick={onConfirm}
                variant="contained"
                sx={{ bgcolor: "#e50914", fontWeight: "bold", borderRadius: 20, px: 4 }}
            >
                {btnText || "OK"}
            </Button>
        </DialogActions>
    </Dialog>
);