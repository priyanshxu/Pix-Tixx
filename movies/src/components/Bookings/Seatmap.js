import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import "./Seatmap.css";

const SeatMap = ({ movieId, selectedDate, onSeatSelect }) => {
    const [layout, setLayout] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // FIX: Don't call API if movieId is undefined
                if (!movieId) return;

                // 1. Get Movie Layout
                const movieRes = await axios.get(`http://localhost:5000/movie/${movieId}`);
                // Ensure seatConfiguration exists, default to empty array
                const seatConfig = movieRes.data.movie.seatConfiguration || [];
                setLayout(seatConfig);

                // 2. Get Booked Seats (Only if date is selected)
                if (selectedDate) {
                    const bookedRes = await axios.get(
                        `http://localhost:5000/booking/booked?movieId=${movieId}&date=${selectedDate}`
                    );
                    setBookedSeats(bookedRes.data.bookedSeats || []);
                }
            } catch (err) {
                console.error("Error loading seat map", err);
            }
        };
        fetchData();
    }, [movieId, selectedDate]);

    // Helper to calculate total price of all selected seats
    const calculateTotal = (selectedIds, currentLayout) => {
        let total = 0;
        selectedIds.forEach(id => {
            // Extract row label (e.g., "A" from "A1")
            const rowLabel = id.replace(/[0-9]/g, '');
            const row = currentLayout.find(r => r.rowLabel === rowLabel);
            if (row) total += row.price;
        });
        return total;
    };

    const handleSeatClick = (rowLabel, seatIndex, price) => {
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

        // FIX: Send the ABSOLUTE TOTAL price, not just the difference.
        // This ensures the Booking page displays the correct amount.
        const newTotal = calculateTotal(newSelected, layout);
        onSeatSelect(newSelected, newTotal);
    };

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
                                    onClick={(e) => { e.preventDefault(); handleSeatClick(row.rowLabel, seatIndex, row.price); }}
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