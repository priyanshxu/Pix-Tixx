import PDFDocument from "pdfkit";

export const generateTicketPDF = (booking, movie, user) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 30 });
        let buffers = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));

        // Get formatted date and time safely
        const showDateTime = new Date(booking.date);
        const formattedDate = showDateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const formattedTime = showDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // --- Get Location/Screen (Requires deep population, assuming show details are available) ---
        // This relies on booking being populated with show, screen, and theatre
        const theatreName = booking.show?.screen?.theatre?.name || "Cinema Location";
        const screenName = booking.show?.screen?.name || "Screen N/A";
        const locationText = `${theatreName}, ${screenName}`;

        const price = booking.price ? `₹${booking.price.toFixed(2)}` : "N/A";


        // --- PDF DESIGN ---

        // 1. Title Bar
        doc.fillColor("#e50914").fontSize(24).font("Helvetica-Bold")
            .text("PIX-TIX E-TICKET", 30, 40, { align: "left" });

        doc.fillColor("#666").fontSize(10).font("Helvetica")
            .text(`Booking ID: ${booking._id.toString().slice(-8).toUpperCase()}`, 30, 70);

        doc.moveDown(3);

        // 2. Main Ticket Box (Dark Header + White Body)
        const boxY = 120;
        const boxHeight = 250;

        // Dark Header Area (Movie Info)
        doc.rect(30, boxY, 550, 70).fill("#222");

        // White Body Area (Details)
        doc.rect(30, boxY + 70, 550, boxHeight - 70).fill("#ffffff");

        // 3. Movie Title & Poster Area (Inside Dark Header)
        doc.fillColor("#fff").fontSize(20).font("Helvetica-Bold")
            .text(movie.title, 150, boxY + 20, { width: 400 }); // Adjusted position

        doc.fillColor("#aaa").fontSize(12).font("Helvetica")
            .text(`Booked by: ${user.name}`, 150, boxY + 45);

        // Placeholder for Movie Poster (Since we cannot use external URLs)
        doc.rect(50, boxY + 15, 80, 40).fill("#e50914");
        doc.fillColor("#fff").fontSize(10).text("Poster", 55, boxY + 30);

        // 4. Booking Details (Inside White Body)
        let currentY = boxY + 95;
        const col1X = 50;
        const col2X = 300;

        const drawDetail = (label, value, x) => {
            doc.fillColor("#555").fontSize(10).font("Helvetica")
                .text(label, x, currentY);
            doc.fillColor("#000").fontSize(14).font("Helvetica-Bold")
                .text(value, x, currentY + 15);
        };

        // Row 1: Date & Time
        drawDetail("DATE", formattedDate, col1X);
        drawDetail("TIME", formattedTime, col2X);
        currentY += 50;

        // Row 2: Location & Screen
        drawDetail("LOCATION", locationText, col1X);
        drawDetail("TOTAL PAID", price, col2X);
        currentY += 50;

        // Row 3: Seats
        doc.fillColor("#555").fontSize(10).font("Helvetica").text("SEATS", col1X, currentY);
        doc.fillColor("#e50914").fontSize(14).font("Helvetica-Bold")
            .text(booking.seatNumber.join(", "), col1X, currentY + 15);
        currentY += 50;

        // 5. QR Code Area (Placeholder)
        doc.rect(30, currentY + 30, 550, 80).fill("#f0f0f0");
        doc.fillColor("#333").fontSize(14).font("Helvetica-Bold")
            .text("QR CODE AREA", 0, currentY + 60, { align: "center" });

        doc.fillColor("#777").fontSize(10).text(
            "Scan this code at the entrance. This ticket is invalid if resold.",
            0, currentY + 100, { align: "center" }
        );

        doc.end();
    });
};