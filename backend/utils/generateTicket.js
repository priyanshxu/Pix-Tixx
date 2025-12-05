import PDFDocument from "pdfkit";

export const generateTicketPDF = (booking, movie, user) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        let buffers = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));

        // --- PDF DESIGN ---

        // 1. Header / Logo Area
        doc.fillColor("#e50914").fontSize(20).text("PIX-TIX CINEMAS", { align: "center" });
        doc.moveDown();
        doc.fillColor("#333").fontSize(12).text("Your Ticket Confirmation", { align: "center" });
        doc.moveDown(2);

        // 2. Ticket Box (Rectangle)
        doc.rect(50, 100, 500, 200).fillAndStroke("#f9f9f9", "#333");

        // 3. Movie Title
        doc.fillColor("#000").fontSize(18).font("Helvetica-Bold")
            .text(movie.title, 70, 120);

        // 4. Booking Details
        doc.fontSize(12).font("Helvetica").fillColor("#555");

        // Left Column
        doc.text("Date:", 70, 160);
        doc.text("Time:", 70, 180);
        doc.text("Location:", 70, 200);

        doc.font("Helvetica-Bold").fillColor("#000");
        doc.text(new Date(booking.date).toLocaleDateString(), 150, 160);
        doc.text("07:00 PM", 150, 180); // Static time for now
        doc.text("Pix-Tix Downtown, Audi 3", 150, 200);

        // Right Column (Seats)
        doc.font("Helvetica").fillColor("#555");
        doc.text("Booking ID:", 300, 160);
        doc.text("Seats:", 300, 180);
        doc.text("Total Price:", 300, 220);

        doc.font("Helvetica-Bold").fillColor("#000");
        doc.text(booking._id.toString().slice(-6).toUpperCase(), 400, 160);

        // Format seats nicely
        doc.fillColor("#e50914").text(booking.seatNumber.join(", "), 400, 180);

        // 5. Footer / Cut Line
        doc.lineWidth(1).dash(5, { space: 10 }).strokeColor("#ccc");
        doc.moveTo(50, 320).lineTo(550, 320).stroke();

        doc.fontSize(10).fillColor("#777").text(
            "Please show this ticket at the counter or scan the QR code at the entrance.",
            50, 340, { align: "center" }
        );

        doc.end();
    });
};