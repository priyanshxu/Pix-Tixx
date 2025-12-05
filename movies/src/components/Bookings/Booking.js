import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import SeatMap from './Seatmap';
// Import UI Tools
import { GlobalLoader, CustomSnackbar, SuccessDialog } from '../Shared/UI/Feedback';

const Booking = () => {
  const [inputs, setInputs] = useState({ date: "" });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // UI States
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: "", severity: "info" });
  const [successData, setSuccessData] = useState({ open: false, ticketId: null });

  const id = useParams().id;
  const movieId = id;
  const userId = localStorage.getItem("userId");

  const showAlert = (message, severity = "error") => setAlertInfo({ open: true, message, severity });

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

    if (!userId) return showAlert("Please Login first!", "warning");
    if (!inputs.date) return showAlert("Please select a date first", "warning");
    if (selectedSeats.length === 0) return showAlert("Please select at least one seat", "warning");

    setLoading(true); // Start Loading
    const res = await loadRazorpayScript();

    if (!res) {
      setLoading(false);
      return showAlert("Razorpay SDK failed to load.", "error");
    }

    try {
      const orderUrl = "http://localhost:5000/payment/create-order";
      const { data: order } = await axios.post(orderUrl, { amount: totalPrice });

      const options = {
        key: "rzp_test_RmpXXAam4cVGMK",
        amount: order.amount,
        currency: order.currency,
        name: "Pix-Tix Cinema",
        description: `Booking for ${selectedSeats.length} tickets`,
        order_id: order.id,
        handler: async function (response) {
          // Keep loader on while verifying
          setLoading(true);
          try {
            const bookingUrl = "http://localhost:5000/booking";
            const bookingData = {
              movie: movieId,
              user: userId,
              date: inputs.date,
              seatNumber: selectedSeats,
            };

            const res = await axios.post(bookingUrl, bookingData);

            if (res.data && res.data.booking) {
              // Show Success Dialog instead of Alert
              setSuccessData({ open: true, ticketId: res.data.booking._id });
            } else {
              showAlert("Payment received, but ticket data is missing.", "warning");
              window.location.href = "/user";
            }
          } catch (err) {
            console.error("Booking API Error:", err);
            showAlert("Payment successful, but server verification failed.", "error");
          } finally {
            setLoading(false);
          }
        },
        theme: { color: "#e50914" },
        modal: {
          ondismiss: function () {
            setLoading(false); // Stop loading if they close the popup
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      // Note: We don't set loading false here because the Razorpay modal is now open.

    } catch (err) {
      console.log("Payment Init Error:", err);
      showAlert("Error initiating payment. Check console.", "error");
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    // Redirect to Ticket on Dialog Close
    window.location.href = `/user/ticket/${successData.ticketId}`;
  };

  return (
    <div style={styles.container}>
      {/* Feedback Components */}
      <GlobalLoader open={loading} />
      <CustomSnackbar
        open={alertInfo.open}
        message={alertInfo.message}
        severity={alertInfo.severity}
        onClose={() => setAlertInfo({ ...alertInfo, open: false })}
      />
      <SuccessDialog
        open={successData.open}
        title="Booking Confirmed!"
        message="Your seats have been successfully reserved. Enjoy the movie!"
        btnText="View Ticket"
        onConfirm={handleSuccessClose}
      />

      <h2>Book Tickets</h2>
      <form onSubmit={handleBooking} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Select Date</label>
          <input type="date" name="date" value={inputs.date} onChange={handleChange} required style={styles.input} />
        </div>

        {inputs.date && movieId ? (
          <SeatMap movieId={movieId} selectedDate={inputs.date} onSeatSelect={handleSeatData} />
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
  button: { padding: '15px', backgroundColor: '#e50914', color: 'white', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', width: '100%', cursor: 'pointer' },
  summary: { textAlign: 'center', padding: '15px', backgroundColor: '#f1f1f1', borderRadius: '8px' },
  totalPrice: { fontSize: '20px', fontWeight: 'bold', color: '#2c3e50', margin: '10px 0 0 0' }
};

export default Booking;