import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Seatmap from './Seatmap';

const Booking = () => {
  const [inputs, setInputs] = useState({ date: "" });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const id = useParams().id;
  const movieId = id;
  const userId = localStorage.getItem("userId");

  // Load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "date") {
      setSelectedSeats([]);
      setTotalPrice(0);
    }
  };

  const handleSeatData = (seatsArray, newTotal) => {
    setSelectedSeats(seatsArray);
    setTotalPrice(newTotal);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!userId) return alert("Please Login first!");
    if (!inputs.date) return alert("Please select a date first");
    if (selectedSeats.length === 0) return alert("Please select at least one seat");

    const res = await loadRazorpayScript();
    if (!res) return alert("Razorpay SDK failed to load.");

    try {
      // 1. Create Order
      const orderUrl = "http://localhost:5000/payment/create-order";
      const { data: order } = await axios.post(orderUrl, { amount: totalPrice });

      // 2. Initialize Options
      const options = {
        // ⚠️ CRITICAL: THIS KEY MUST MATCH YOUR BACKEND .ENV KEY_ID
        key: "rzp_test_YOUR_ACTUAL_KEY_HERE",
        amount: order.amount,
        currency: order.currency,
        name: "Pix-Tix Cinema",
        description: `Booking for ${selectedSeats.length} tickets`,
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log("Payment Success. Verifying with Backend...");
            const bookingUrl = "http://localhost:5000/booking";
            const bookingData = {
              movie: movieId,
              user: userId,
              date: inputs.date,
              seatNumber: selectedSeats,
            };

            const res = await axios.post(bookingUrl, bookingData);
            console.log("Backend Response:", res.data); // Debug Log

            // 👇 SAFETY CHECK: Ensure booking exists before reading _id
            if (res.data && res.data.booking) {
              const newBookingId = res.data.booking._id;
              alert("Payment Successful! Generating Ticket...");
              window.location.href = `/user/ticket/${newBookingId}`;
            } else {
              // Handle unexpected success response
              console.error("Missing booking object:", res.data);
              alert("Payment received, but ticket data is missing. Check your profile.");
              window.location.href = "/user"; // Fallback redirect
            }

          } catch (err) {
            console.error("Booking API Error:", err);
            const msg = err.response?.data?.message || "Booking creation failed";
            alert(`Error: ${msg}`);
          }
        },
        theme: { color: "#e50914" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.log("Payment Init Error:", err);
      alert("Error initiating payment. Check console.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Book Tickets</h2>
      <form onSubmit={handleBooking} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Select Date</label>
          <input type="date" name="date" value={inputs.date} onChange={handleChange} required style={styles.input} />
        </div>

        {inputs.date && movieId ? (
          <Seatmap movieId={movieId} selectedDate={inputs.date} onSeatSelect={handleSeatData} />
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>Select a date to view available seats.</p>
        )}

        <div style={styles.summary}>
          <p>Selected: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</p>
          <p style={styles.totalPrice}>Total Price: ₹{totalPrice}</p>
        </div>

        <button
          type="submit"
          style={{ ...styles.button, opacity: selectedSeats.length > 0 ? 1 : 0.5 }}
          disabled={selectedSeats.length === 0}
        >
          Pay ₹{totalPrice} & Book Now
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '50px auto', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderRadius: '8px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', textAlign: 'left', maxWidth: '300px', margin: '0 auto' },
  input: { padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '15px', backgroundColor: '#e50914', color: 'white', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', width: '100%' },
  summary: { textAlign: 'center', padding: '15px', backgroundColor: '#f1f1f1', borderRadius: '8px' },
  totalPrice: { fontSize: '20px', fontWeight: 'bold', color: '#2c3e50', margin: '10px 0 0 0' }
};

export default Booking;