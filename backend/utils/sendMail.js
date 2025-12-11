import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' or your SMTP host
    auth: {
        user: process.env.EMAIL_USER, // Your Email
        pass: process.env.EMAIL_PASS, // Your App Password
    },
});

// --- NEW GENERIC SEND EMAIL UTILITY ---
export const sendEmail = async (mailOptions) => {
    mailOptions.from = mailOptions.from || '"Pix-Tix Support" <support@pixtix.com>';
    return transporter.sendMail(mailOptions);
};

// --- NEW RESALE NOTIFICATION ---
export const sendResaleNotification = async (sellerEmail, sellerName, bookingDetails, payout) => {
    const mailOptions = {
        to: sellerEmail,
        subject: `Success! Your Ticket for ${bookingDetails.movieTitle} has been Resold 💰`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #4CAF50; max-width: 600px; margin: auto;">
                <h2 style="color: #4CAF50;">Ticket Sold! Congratulations, ${sellerName}!</h2>
                <p>Your ticket for <strong>${bookingDetails.movieTitle}</strong> has been successfully purchased on the Resale Marketplace.</p>
                
                <div style="background: #e6ffe6; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #4CAF50;">
                    <p style="font-size: 1.1em; color: #000;">Your wallet has been credited with:</p>
                    <h3 style="color: #4CAF50; margin: 5px 0;">₹${payout}</h3>
                </div>

                <p>You can use this balance for future bookings or initiate a withdrawal from your Profile page.</p>
                <p>Thank you for using Pix-Tix!</p>
            </div>
        `,
    };
    return sendEmail(mailOptions);
};
// ------------------------------------


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
    return transporter.sendMail(mailOptions);
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
    return transporter.sendMail(mailOptions);
};

// --- FIX: TICKET EMAIL DATE FORMAT ---
export const sendTicketEmail = async (email, bookingDetails, pdfBuffer) => {
    const showDateTime = new Date(bookingDetails.date);
    // Ensure date displays correctly in email client (e.g., Nov 12, 2025 at 07:00 PM)
    const displayDateTime = showDateTime.toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const mailOptions = {
        from: '"Pix-Tix Box Office" <tickets@pixtix.com>',
        to: email,
        subject: `Booking Confirmed: ${bookingDetails.movieTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ddd; max-width: 600px; margin: auto;">
                <h2 style="color: #e50914;">Booking Confirmed! 🎟️</h2>
                <p>Hi there,</p>
                <p>Your tickets for <strong>${bookingDetails.movieTitle}</strong> have been successfully booked.</p>
                
                <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Show Time:</strong> ${displayDateTime}</p>
                    <p><strong>Location:</strong> ${bookingDetails.theatre}</p>
                    <p><strong>Seats:</strong> ${bookingDetails.seats.join(", ")}</p>
                    <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
                </div>

                <p>Please find your official <strong>E-Ticket attached</strong> to this email as a PDF.</p>
                <p>See you at the movies!</p>
                <br/>
                <small style="color: #888;">Pix-Tix Team</small>
            </div>
        `,
        attachments: [
            {
                filename: `PixTix-Ticket-${bookingDetails.bookingId}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };
    return transporter.sendMail(mailOptions);
};