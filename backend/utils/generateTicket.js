import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import axios from "axios";

export const generateTicketPDF = async (booking, movie, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A4", margin: 0 }); // 0 margin for full bleeds
            let buffers = [];

            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));

            // --- 1. DATA PREPARATION ---

            // CRITICAL FIX: We grab the date from the SHOW, not the booking creation date.
            // We use optional chaining (?.) in case 'show' isn't populated for some reason.
            const rawDate = booking.show?.startTime || booking.date || new Date();
            const showDate = new Date(rawDate);

            // Format: "Fri, 12 Oct 2025"
            const dateStr = showDate.toLocaleDateString("en-GB", {
                weekday: 'short', day: "2-digit", month: "short", year: "numeric"
            });

            // Format: "10:30 PM"
            const timeStr = showDate.toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit"
            });

            // Fix Price: Use "Rs." instead of symbol (Helvetica doesn't support ₹)
            const amount = booking.totalPaid ? `Rs. ${booking.totalPaid.toFixed(2)}` : "Paid";

            // Location Logic
            const theatre = booking.show?.screen?.theatre?.name || "Pix-Tix Cinema";
            const screen = booking.show?.screen?.name || "Screen 1";

            // Fetch Poster Image (Async)
            let posterImage = null;
            if (movie.posterUrl) {
                try {
                    // --- FIX START: FORCE JPG FORMAT ---
                    // Cloudinary often serves WEBP by default, which crashes PDFKit.
                    // We inject '/f_jpg' to force a JPEG response.
                    const safePosterUrl = movie.posterUrl.includes('cloudinary')
                        ? movie.posterUrl.replace('/upload/', '/upload/f_jpg/')
                        : movie.posterUrl;

                    const response = await axios.get(safePosterUrl, { responseType: "arraybuffer" });
                    posterImage = response.data;
                    // --- FIX END ---
                } catch (e) {
                    console.error("Could not fetch poster image for PDF:", e.message);
                    // posterImage remains null, so the placeholder logic below will be used
                }
            }

            // Generate QR Code (Async)
            const qrData = JSON.stringify({
                id: booking._id,
                user: user.email,
                seats: booking.seatNumber
            });
            const qrCodeBuffer = await QRCode.toBuffer(qrData);


            // --- 2. PDF DESIGN ---

            // Background Header
            doc.rect(0, 0, 595, 120).fill("#1a1a1a");

            doc.fillColor("#E50914").fontSize(28).font("Helvetica-Bold").text("PIX-TIX", 40, 45);
            doc.fillColor("#ffffff").fontSize(10).font("Helvetica").text("YOUR TICKET TO ENTERTAINMENT", 40, 75);

            // Ticket Container
            const boxTop = 140;
            const boxLeft = 40;
            const boxWidth = 515;
            const boxHeight = 280;

            doc.roundedRect(boxLeft, boxTop, boxWidth, boxHeight, 8)
                .lineWidth(1).strokeColor("#cccccc").stroke()
                .fill("#ffffff");

            // --- MOVIE SECTION ---
            if (posterImage) {
                try {
                    doc.image(posterImage, boxLeft + 20, boxTop + 20, { width: 100, height: 150 });
                } catch (imgErr) {
                    // Fallback if image data is corrupt or incompatible
                    console.error("PDF Image insertion failed:", imgErr.message);
                    doc.rect(boxLeft + 20, boxTop + 20, 100, 150).fill("#cccccc");
                    doc.fillColor("#000").fontSize(10).text("Image Error", boxLeft + 35, boxTop + 90);
                }
            } else {
                doc.rect(boxLeft + 20, boxTop + 20, 100, 150).fill("#cccccc");
                doc.fillColor("#000").fontSize(10).text("No Poster", boxLeft + 35, boxTop + 90);
            }

            doc.fillColor("#000000").fontSize(22).font("Helvetica-Bold")
                .text(movie.title, boxLeft + 140, boxTop + 25, { width: 350 });

            const genre = movie.genre ? movie.genre.join(", ") : "Cinema";
            doc.fillColor("#666666").fontSize(12).font("Helvetica")
                .text(`${genre} | ${movie.language || "English"}`, boxLeft + 140, boxTop + 55);

            doc.moveTo(boxLeft + 140, boxTop + 80).lineTo(boxLeft + 500, boxTop + 80).lineWidth(0.5).strokeColor("#eeeeee").stroke();


            // --- DETAILS GRID ---
            const gridTop = boxTop + 100;
            const col1 = boxLeft + 140;
            const col2 = boxLeft + 320;

            const drawField = (label, value, x, y, isBold = false) => {
                doc.fillColor("#888888").fontSize(9).font("Helvetica").text(label.toUpperCase(), x, y);
                doc.fillColor("#000000").fontSize(12).font(isBold ? "Helvetica-Bold" : "Helvetica").text(value, x, y + 15);
            };

            // Row 1: Correct Date & Time
            drawField("Date", dateStr, col1, gridTop, true);
            drawField("Time", timeStr, col2, gridTop, true);

            // Row 2: Location
            drawField("Theatre", theatre, col1, gridTop + 45);
            drawField("Screen", screen, col2, gridTop + 45);

            // Row 3: Seats & Price
            drawField("Seats", booking.seatNumber.join(", "), col1, gridTop + 90, true);
            drawField("Price", amount, col2, gridTop + 90);


            // --- FOOTER SECTION (QR CODE) ---
            const footerTop = boxTop + boxHeight + 30;

            doc.moveTo(20, footerTop).lineTo(575, footerTop)
                .dash(5, { space: 5 }).strokeColor("#999999").stroke();

            doc.image(qrCodeBuffer, 230, footerTop + 20, { width: 130 });

            doc.fillColor("#333333").fontSize(12).font("Helvetica-Bold")
                .text("SCAN AT ENTRY", 0, footerTop + 160, { align: "center" });

            doc.fillColor("#666666").fontSize(9).font("Helvetica")
                .text(`Booking ID: ${booking._id.toString().toUpperCase()}`, 0, footerTop + 175, { align: "center" });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};