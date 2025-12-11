import React from 'react';
import { Backdrop, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const GlobalLoader = ({ open }) => (
    <Backdrop sx={{ color: '#e50914', zIndex: 9999 }} open={open}>
        <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress color="inherit" />
            <Typography variant="h6" color="white" mt={2}>Loading...</Typography>
        </Box>
    </Backdrop>
);

export const CustomSnackbar = ({ open, message, severity, onClose }) => (
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>{message}</Alert>
    </Snackbar>
);

export const SuccessDialog = ({ open, title, message, onConfirm, btnText }) => (
    <Dialog open={open} onClose={onConfirm}>
        <Box p={3} textAlign="center">
            {/* FIX: Ensure explicit font size is used for SVG icon */}
            <CheckCircleIcon sx={{ fontSize: '60px', color: "#4CAF50" }} />
            <DialogTitle>{title}</DialogTitle>
            <DialogContent><Typography>{message}</Typography></DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
                <Button onClick={onConfirm} variant="contained" sx={{ bgcolor: "#e50914" }}>{btnText || "OK"}</Button>
            </DialogActions>
        </Box>
    </Dialog>
);