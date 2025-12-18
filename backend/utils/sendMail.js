import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Generic Sender Function (Uses Brevo HTTP API)
const sendEmailViaBrevo = async (toEmail, subject, htmlContent, attachments = null) => {
  try {
    // 1. Build the basic payload
    const payload = {
      sender: { name: "Pix-Tix Support", email: process.env.EMAIL_USER }, // Must be your verified login email on Brevo
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: htmlContent,
    };

    // 2. ⚡ CRITICAL FIX: Only add 'attachment' key if it exists and is not empty
    if (attachments && attachments.length > 0) {
      payload.attachment = attachments;
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      payload,
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );

    console.log(`✅ Email sent to ${toEmail} | ID: ${response.data.messageId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Brevo Email Failed:", error.response?.data || error.message);
    return null; // Fail silently so app doesn't crash
  }
};

// --- 1. OTP EMAIL ---
export const sendOtpEmail = async (email, otp) => {
  const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e50914;">Welcome to Pix-Tix!</h2>
        <p>To complete your registration, please verify your email address.</p>
        <p>Your verification code is:</p>
        <h1 style="background: #eee; padding: 10px; display: inline-block; letter-spacing: 5px; color: #333;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;
  // No attachment passed here, so payload will be clean
  return sendEmailViaBrevo(email, 'Verify Your Account - Pix-Tix', html);
};

// --- 2. WELCOME EMAIL ---
export const sendWelcomeEmail = async (email, name) => {
  const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e50914;">Hello, ${name}!</h2>
        <p>Your account has been successfully verified.</p>
        <p>You can now book tickets for the latest blockbusters.</p>
        <br/>
        <a href="https://pix-tix.vercel.app" style="background: #e50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Book Now</a>
      </div>
    `;
  return sendEmailViaBrevo(email, 'Welcome to the Movies! 🍿', html);
};

// --- 3. TICKET EMAIL (With PDF Attachment) ---
export const sendTicketEmail = async (email, bookingDetails = {}, pdfBuffer) => {
  const showDate = bookingDetails?.date ? new Date(bookingDetails.date) : new Date();
  const displayDateTime = showDate.toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  const movieTitle = bookingDetails?.movieTitle ?? 'Unknown Title';
  const theatre = bookingDetails?.theatre ?? 'Unknown Theatre';
  const seats = Array.isArray(bookingDetails?.seats) ? bookingDetails.seats.join(', ') : (bookingDetails?.seats || 'N/A');
  const bookingId = bookingDetails?.bookingId ?? (bookingDetails?._id?.toString?.() ?? 'N/A');

  const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ddd; max-width: 600px; margin: auto;">
        <h2 style="color: #e50914;">Booking Confirmed! 🎟️</h2>
        <p>Hi there,</p>
        <p>Your tickets for <strong>${movieTitle}</strong> have been successfully booked.</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Show Time:</strong> ${displayDateTime}</p>
          <p><strong>Location:</strong> ${theatre}</p>
          <p><strong>Seats:</strong> ${seats}</p>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
        </div>
        <p>Please find your official <strong>E-Ticket attached</strong> to this email as a PDF.</p>
        <p>See you at the movies!</p>
        <br/>
        <small style="color: #888;">Pix-Tix Team</small>
      </div>
    `;

  // Prepare Attachment for Brevo (Base64)
  const attachments = pdfBuffer ? [{
    name: `PixTix-Ticket-${bookingId}.pdf`,
    content: pdfBuffer.toString('base64') // Brevo requires Base64 string
  }] : [];

  return sendEmailViaBrevo(email, `Booking Confirmed: ${movieTitle}`, html, attachments);
};

// --- 4. RESALE NOTIFICATION ---
export const sendResaleNotification = async (sellerEmail, sellerName, bookingDetails, payout) => {
  let details = {};
  if (typeof bookingDetails === 'string') {
    details.movieTitle = bookingDetails;
  } else if (bookingDetails && typeof bookingDetails === 'object') {
    details = bookingDetails;
  }

  const movieTitle = details.movieTitle ?? 'Unknown Title';
  const displaySeats = Array.isArray(details.seats) ? details.seats.join(', ') : (details.seats || 'N/A');
  const bookingId = details.bookingId ?? (details._id?.toString?.() ?? 'N/A');
  const theatre = details.theatre ?? 'Unknown Theatre';

  const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #4CAF50; max-width: 600px; margin: auto;">
        <h2 style="color: #4CAF50;">Ticket Sold! Congratulations, ${sellerName}!</h2>
        <p>Your ticket for <strong>${movieTitle}</strong> has been successfully purchased on the Resale Marketplace.</p>
        <div style="background: #e6ffe6; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #4CAF50;">
          <p style="font-size: 1.1em; color: #000;">Your wallet has been credited with:</p>
          <h3 style="color: #4CAF50; margin: 5px 0;">₹${payout}</h3>
        </div>
        <p><strong>Details:</strong></p>
        <p>Show: ${movieTitle}</p>
        <p>Theatre: ${theatre}</p>
        <p>Seats: ${displaySeats}</p>
        <p>Booking ID: ${bookingId}</p>
        <p>You can use this balance for future bookings or initiate a withdrawal from your Profile page.</p>
        <p>Thank you for using Pix-Tix!</p>
      </div>
    `;

  return sendEmailViaBrevo(sellerEmail, `Success! Your Ticket for ${movieTitle} has been Resold 💰`, html);
};

// --- 5. RESALE EXPIRY ---
export const sendResaleExpiryEmail = async (email, userName, movieTitle, showDate) => {
  const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ddd; max-width: 600px; margin: auto;">
        <h2 style="color: #555;">Ticket Unsold</h2>
        <p>Hello ${userName},</p>
        <p>Your ticket for <strong>${movieTitle}</strong> on <strong>${new Date(showDate).toLocaleString()}</strong> was not sold before the show started.</p>
        <p>The ticket status has been changed to <strong>Unsold</strong> and it has been removed from the marketplace.</p>
        <p>Since the show has ended, this ticket is no longer valid.</p>
        <br/>
        <small style="color: #888;">Pix-Tix Team</small>
      </div>
    `;
  return sendEmailViaBrevo(email, `Resale Expired: ${movieTitle}`, html);
};