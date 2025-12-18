// utils/sendMail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ✅ OPTIMIZED TRANSPORTER
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  pool: true,   // <--- ENABLE POOLING (Keeps connection open)
  maxConnections: 5, // Limit parallel connections
  maxMessages: 100,  // Recycle connection after 100 messages
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // timeouts to prevent hanging
  socketTimeout: 30000,
  greetingTimeout: 15000
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email Connection Error:", error);
  } else {
    console.log("✅ Email Server Ready (Pooled)");
  }
});

export const sendEmail = async (mailOptions) => {
  mailOptions.from = mailOptions.from || '"Pix-Tix Support" <support@pixtix.com>';
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[sendEmail] sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('[sendEmail] failed:', err);
    // Do not throw error for OTPs to prevent crashing the registration flow
    // Just return null so the user knows it failed
    return null;
  }
};

// ... (Keep your sendOtpEmail, sendTicketEmail, etc. functions exactly as they were) ...
// Just ensure they use the new sendEmail wrapper above.
// Copy-paste your existing template functions (sendOtpEmail, etc.) below this line.
export const sendResaleNotification = async (sellerEmail, sellerName, bookingDetails, payout) => {
  // Ensure bookingDetails is an object
  let details = {};
  if (typeof bookingDetails === 'string') {
    details.movieTitle = bookingDetails;
  } else if (bookingDetails && typeof bookingDetails === 'object') {
    details = bookingDetails;
  } else {
    details.movieTitle = 'Unknown Title';
  }

  const movieTitle = details.movieTitle ?? 'Unknown Title';
  const displaySeats = Array.isArray(details.seats) ? details.seats.join(', ') : (details.seats || 'N/A');
  const bookingId = details.bookingId ?? (details._id?.toString?.() ?? 'N/A');
  const theatre = details.theatre ?? 'Unknown Theatre';

  const mailOptions = {
    to: sellerEmail,
    subject: `Success! Your Ticket for ${movieTitle} has been Resold 💰`,
    html: `
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
    `,
  };
  return sendEmail(mailOptions);
};

export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: '"Pix-Tix Security" <noreply@pixtix.com>',
    to: email,
    subject: 'Verify Your Account - Pix-Tix',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e50914;">Welcome to Pix-Tix!</h2>
        <p>To complete your registration, please verify your email address.</p>
        <p>Your verification code is:</p>
        <h1 style="background: #eee; padding: 10px; display: inline-block; letter-spacing: 5px; color: #333;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };
  return sendEmail(mailOptions);
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: '"Pix-Tix Cinema" <welcome@pixtix.com>',
    to: email,
    subject: 'Welcome to the Movies! 🍿',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e50914;">Hello, ${name}!</h2>
        <p>Your account has been successfully verified.</p>
        <p>You can now book tickets for the latest blockbusters.</p>
        <br/>
        <a href="http://localhost:3000" style="background: #e50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Book Now</a>
      </div>
    `,
  };
  return sendEmail(mailOptions);
};

export const sendTicketEmail = async (email, bookingDetails = {}, pdfBuffer) => {
  // Format date in Asia/Kolkata timezone explicitly
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

  const mailOptions = {
    from: '"Pix-Tix Box Office" <tickets@pixtix.com>',
    to: email,
    subject: `Booking Confirmed: ${movieTitle}`,
    html: `
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
    `,
    attachments: pdfBuffer ? [
      {
        filename: `PixTix-Ticket-${bookingId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ] : []
  };

  return sendEmail(mailOptions);
};

export const sendResaleExpiryEmail = async (email, userName, movieTitle, showDate) => {
  const mailOptions = {
    from: '"Pix-Tix Support" <support@pixtix.com>',
    to: email,
    subject: `Resale Expired: ${movieTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ddd; max-width: 600px; margin: auto;">
        <h2 style="color: #555;">Ticket Unsold</h2>
        <p>Hello ${userName},</p>
        <p>Your ticket for <strong>${movieTitle}</strong> on <strong>${new Date(showDate).toLocaleString()}</strong> was not sold before the show started.</p>
        <p>The ticket status has been changed to <strong>Unsold</strong> and it has been removed from the marketplace.</p>
        <p>Since the show has ended, this ticket is no longer valid.</p>
        <br/>
        <small style="color: #888;">Pix-Tix Team</small>
      </div>
    `,
  };
  return sendEmail(mailOptions);
};