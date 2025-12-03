import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, IconButton, Paper, Grid } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ChairIcon from '@mui/icons-material/Chair'; // Make sure to install @mui/icons-material

const SeatConfigurator = ({ onConfigurationChange }) => {
    const [rows, setRows] = useState([]);
    const [newRow, setNewRow] = useState({ label: "A", count: 10, price: 250 });

    // Sync with parent component
    useEffect(() => {
        onConfigurationChange(rows);
    }, [rows, onConfigurationChange]);

    const handleAddRow = () => {
        if (!newRow.label || newRow.count <= 0) return;

        // 1 = Seat, 0 = Aisle
        const seatsArray = Array(parseInt(newRow.count)).fill(1);

        setRows([...rows, {
            rowLabel: newRow.label.toUpperCase(),
            seats: seatsArray,
            price: parseInt(newRow.price)
        }]);

        // Auto-increment Label (A -> B -> C)
        const nextChar = String.fromCharCode(newRow.label.charCodeAt(0) + 1);
        setNewRow({ ...newRow, label: nextChar });
    };

    const toggleSeat = (rIndex, sIndex) => {
        const updated = [...rows];
        // Toggle between 1 (Seat) and 0 (Gap)
        updated[rIndex].seats[sIndex] = updated[rIndex].seats[sIndex] === 1 ? 0 : 1;
        setRows(updated);
    };

    const removeRow = (index) => {
        const updated = [...rows];
        updated.splice(index, 1);
        setRows(updated);
    };

    return (
        <Paper variant="outlined" sx={{ padding: 2, mt: 2, bgcolor: "#f9f9f9" }}>
            <Typography variant="h6" color="primary" gutterBottom>
                Step 2: Design Seat Map
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Add rows, then click on green seats to turn them into empty aisles.
            </Typography>

            {/* Input Controls */}
            <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 3, alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                    label="Row Label" size="small" sx={{ width: 80 }}
                    value={newRow.label} onChange={e => setNewRow({ ...newRow, label: e.target.value })}
                />
                <TextField
                    label="Seats" type="number" size="small" sx={{ width: 80 }}
                    value={newRow.count} onChange={e => setNewRow({ ...newRow, count: e.target.value })}
                />
                <TextField
                    label="Price (₹)" type="number" size="small" sx={{ width: 100 }}
                    value={newRow.price} onChange={e => setNewRow({ ...newRow, price: e.target.value })}
                />
                <Button variant="contained" onClick={handleAddRow} sx={{ bgcolor: "#222" }}>
                    Add Row
                </Button>
            </Box>

            {/* Visual Preview */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: "300px", overflowY: "auto" }}>
                {rows.map((row, rIndex) => (
                    <Box key={rIndex} display="flex" alignItems="center" gap={2}>
                        <Typography fontWeight="bold" width={30}>{row.rowLabel}</Typography>

                        <Box display="flex" gap={0.5}>
                            {row.seats.map((status, sIndex) => (
                                <Box
                                    key={sIndex}
                                    onClick={() => toggleSeat(rIndex, sIndex)}
                                    sx={{
                                        width: 20, height: 20,
                                        bgcolor: status === 1 ? "#4CAF50" : "#ddd", // Green vs Gray
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        border: status === 0 ? "1px dashed #999" : "none",
                                        "&:hover": { opacity: 0.8 }
                                    }}
                                    title={status === 1 ? "Click to make Gap" : "Seat"}
                                />
                            ))}
                        </Box>

                        <Typography variant="caption">₹{row.price}</Typography>
                        <IconButton size="small" color="error" onClick={() => removeRow(rIndex)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

export default SeatConfigurator;