import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, List, ListItem, ListItemText, ListItemButton, CircularProgress, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';

const CityDialog = ({ open, onClose, onSelectCity }) => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch real cities from the backend
        axios.get("http://localhost:5000/admin/config/city")
            .then(res => {
                setCities(res.data.cities || []);
                setError(null);
            })
            .catch(err => {
                console.error("Error fetching cities:", err);
                setError("Could not load cities. Ensure backend is running.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleSelect = (city) => {
        // Store the REAL MongoDB ID
        localStorage.setItem("userCityId", city._id);
        // Store the name for display
        localStorage.setItem("userCityName", city.name);

        window.dispatchEvent(new Event("cityUpdated"));

        onSelectCity(city._id);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={() => { }} // Prevent closing without selection
            PaperProps={{
                sx: { borderRadius: 3, padding: 2, minWidth: '320px', textAlign: 'center' }
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#e50914' }}>
                <LocationOnIcon /> Select City
            </DialogTitle>

            {loading ? (
                <div style={{ padding: 40 }}><CircularProgress size={30} sx={{ color: '#e50914' }} /></div>
            ) : error ? (
                <Typography color="error" p={2}>{error}</Typography>
            ) : (
                <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
                    {cities.length === 0 ? (
                        <Typography p={2} color="textSecondary">No cities added yet.</Typography>
                    ) : (
                        cities.map((city) => (
                            <ListItem disablePadding key={city._id}>
                                <ListItemButton onClick={() => handleSelect(city)} sx={{ borderRadius: 2, '&:hover': { bgcolor: '#f5f5f5' } }}>
                                    <ListItemText primary={city.name} sx={{ textAlign: 'center' }} />
                                </ListItemButton>
                            </ListItem>
                        ))
                    )}
                </List>
            )}
        </Dialog>
    );
};

export default CityDialog;