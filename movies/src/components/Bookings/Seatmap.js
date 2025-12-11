import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import "./Seatmap.css";
// Note: Assuming the CSS is in src/components/SeatMap.css or similar relative path

// CHANGE PROPS: Now expects layout (from Show/Screen) and showId (for booked seats)
const SeatMap = ({ layout, showId, price, onSeatSelect }) => {
    // layout is now passed in as a prop: [{ rowLabel: "A", seats: [1, 0, 1], price: 200 }, ...]

    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);

    // 1. Fetch Booked Seats ONLY (Runs when showId changes)
    useEffect(() => {
        const fetchBookedSeats = async () => {
            try {
                if (!showId) return;

                // API Call to get seats booked for THIS specific show
                // We will update the backend to support this dedicated showId query
                const bookedRes = await axios.get(
                    `http://localhost:5000/booking/booked?showId=${showId}`
                );
                setBookedSeats(bookedRes.data.bookedSeats || []);

            } catch (err) {
                console.error("Error loading booked seats for show:", err);
            }
        };
        fetchBookedSeats();
    }, [showId]);

    // Helper to calculate total price (simplified as price is now uniform per row)
    const calculateTotal = (selectedIds, currentLayout) => {
        let total = 0;
        selectedIds.forEach(id => {
            // Extract row label (e.g., "A" from "A1")
            const rowLabel = id.replace(/[0-9]/g, '');
            const row = currentLayout.find(r => r.rowLabel === rowLabel);
            // Use the row's price from the layout, if available
            if (row && row.price) total += row.price;
            // Fallback: If price prop was passed (not currently used, but good practice)
            else if (price) total += price;
        });
        return total;
    };

    const handleSeatClick = (rowLabel, seatIndex) => {
        const seatId = `${rowLabel}${seatIndex + 1}`;

        if (bookedSeats.includes(seatId)) return;

        let newSelected = [...selectedSeats];

        if (newSelected.includes(seatId)) {
            // Unselect
            newSelected = newSelected.filter((s) => s !== seatId);
        } else {
            // Select
            if (newSelected.length >= 6) {
                alert("Max 6 seats allowed");
                return;
            }
            newSelected.push(seatId);
        }

        setSelectedSeats(newSelected);

        // Calculate and send the new total price to the parent (Booking.jsx)
        const newTotal = calculateTotal(newSelected, layout);
        onSeatSelect(newSelected, newTotal);
    };

    if (!layout || layout.length === 0) {
        return (
            <Box textAlign="center" py={5}>
                <Typography color="error">Seat map configuration missing for this screen.</Typography>
                <Typography variant="caption">Please check Admin Data Entry (Step 3: Add Screen).</Typography>
            </Box>
        );
    }

    return (
        <div className="cinema-container">
            <div className="screen">SCREEN THIS WAY</div>

            <div className="seats-grid">
                {layout.map((row, rowIndex) => (
                    <div key={rowIndex} className="seat-row">
                        <span className="row-label">{row.rowLabel}</span>

                        {row.seats.map((status, seatIndex) => {
                            const seatId = `${row.rowLabel}${seatIndex + 1}`;

                            // 0 = Aisle/Gap
                            if (status === 0) return <div key={seatIndex} className="seat-gap"></div>;

                            const isBooked = bookedSeats.includes(seatId);
                            const isSelected = selectedSeats.includes(seatId);

                            return (
                                <button
                                    key={seatId}
                                    className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
                                    onClick={(e) => { e.preventDefault(); handleSeatClick(row.rowLabel, seatIndex); }}
                                    disabled={isBooked}
                                >
                                    {seatIndex + 1}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="legend">
                <div className="item"><span className="seat"></span> Available</div>
                <div className="item"><span className="seat selected"></span> Selected</div>
                <div className="item"><span className="seat booked"></span> Booked</div>
            </div>
        </div>
    );
};

export default SeatMap;