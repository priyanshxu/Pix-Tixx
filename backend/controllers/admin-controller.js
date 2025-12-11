import mongoose, { isValidObjectId } from "mongoose";
import Admin from "../models/Admin.js";
import City from "../models/City.js";
import Theatre from "../models/Theatre.js";
import Screen from "../models/Screen.js";
import Show from "../models/Show.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';



export const addAdmin = async(req, res, next)=> {
    const { email, password } =req.body;
    if( !email && email.trim()==="" && !password && password.trim()==="" ){
        return res.status(422).json({ message: "Invalid Inputs"});
    }
    let existingAdmin;

    try{
        existingAdmin = await Admin.findOne({ email });

    }catch(err){
        console.log(err);
    }
    if(existingAdmin){
        return res.status(400).json({ message: "Admin already exists"});
    }
    let admin;
    const hashedPassword = bcrypt.hashSync(password);
    try{
        admin = new Admin({ email, password: hashedPassword});
        admin = await admin.save();
    }catch(err){
        return console.log(err);
    }
    if(!admin){
        return res.status(500).json({message: "Unable to store Admin"});
    }
    return res.status(201).json({ admin });
};
export const adminlogin = async(req, res, next)=>{
    const { email, password } =req.body;
    if( !email && email.trim()==="" && !password && password.trim()==="" ){
        return res.status(422).json({ message: "Invalid Inputs"});
    }
    let existingAdmin;
    try{
        existingAdmin = await Admin.findOne({email});
    }catch (err){
        return console.log(err);
    }
    if(!existingAdmin){
        return res.status(400).json({message: "Admin not found"});
    }
    const isPasswordCorrect = bcrypt.compareSync(password,existingAdmin.password);
    if(!isPasswordCorrect){
        return res.status(400).json({message: "Incorrect Password"});
    }

    const token = jwt.sign({id:existingAdmin._id},process.env.SECRET_KEY,{
        expiresIn: "7d",
    });
    return res.status(200).json({message: "Authentication Successful",token,id:existingAdmin._id });
};
export const getAdmins = async(req, res, next)=> {
    let admins;
    try{
        admins = await Admin.find();
    }catch(err){
        return console.log(err);
    }
    if(!admins){
        return res.status(500).json({message: "Internal Server Error"});

    }
    return res.status(200).json({admins});
};
export const addCity = async (req, res, next) => {
    const { name, code } = req.body; // e.g., { "name": "Mumbai", "code": "MUM" }

    if (!name || !code) return res.status(422).json({ message: "Invalid Inputs" });

    let city;
    try {
        city = new City({ name, code, theatres: [] });
        await city.save();
    } catch (err) {
        return console.log(err);
    }

    if (!city) return res.status(500).json({ message: "Request Failed" });
    return res.status(201).json({ city });
};

// --- 2. ADD THEATRE ---
export const addTheatre = async (req, res, next) => {
    const { name, location, cityId } = req.body; // cityId is the _id of the City document

    if (!name || !location || !cityId) return res.status(422).json({ message: "Invalid Inputs" });

    let theatre;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        theatre = new Theatre({ name, location, city: cityId, screens: [] });
        const city = await City.findById(cityId);

        if (!city) return res.status(404).json({ message: "City not found" });

        await theatre.save({ session });
        city.theatres.push(theatre);
        await city.save({ session });

        await session.commitTransaction();
    } catch (err) {
        return console.log(err);
    }

    if (!theatre) return res.status(500).json({ message: "Request Failed" });
    return res.status(201).json({ theatre });
};

// --- 3. ADD SCREEN (with Seat Map) ---
export const addScreen = async (req, res, next) => {
    // This replaces the old "seatConfiguration" inside Movie
    const { name, theatreId, seatConfiguration } = req.body;

    let screen;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        screen = new Screen({ name, theatre: theatreId, seatConfiguration });
        const theatre = await Theatre.findById(theatreId);

        if (!theatre) return res.status(404).json({ message: "Theatre not found" });

        await screen.save({ session });
        theatre.screens.push(screen);
        await theatre.save({ session });

        await session.commitTransaction();
    } catch (err) {
        return console.log(err);
    }

    if (!screen) return res.status(500).json({ message: "Request Failed" });
    return res.status(201).json({ screen });
};

// --- 4. ADD SHOW (The Linker) ---
export const addShow = async (req, res, next) => {
    const { movieId, screenId, startTime, price } = req.body;

    let show;
    try {
        show = new Show({
            movie: movieId,
            screen: screenId,
            startTime: new Date(startTime),
            price
        });
        await show.save();
    } catch (err) {
        return console.log(err);
    }

    if (!show) return res.status(500).json({ message: "Request Failed" });
    return res.status(201).json({ show });
};

// --- GETTERS (For Frontend) ---

export const getAllCities = async (req, res, next) => {
    try {
        const cities = await City.find();
        return res.status(200).json({ cities });
    } catch (err) { return console.log(err); }
};

export const getTheatresByCity = async (req, res, next) => {
    const cityId = req.params.id;

    // Prevent the CastError by checking validity first
    if (!isValidObjectId(cityId)) {
        return res.status(400).json({ message: "Invalid City ID format" });
    }

    try {
        const theatres = await Theatre.find({ city: cityId }).populate("screens");
        return res.status(200).json({ theatres });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching theatres" });
    }
};

export const getShowsByMovieAndDate = async (req, res, next) => {
    const { movieId, date, cityId } = req.query;

    if (!isValidObjectId(movieId) || !isValidObjectId(cityId) || !date) {
        console.log(`[SHOWS FETCH] Invalid input: MovieID=${movieId}, CityID=${cityId}`);
        return res.status(400).json({ message: "Invalid filter parameters" });
    }

    try {
        const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);

        // --- STEP 1: Find all Theatres in the given City ---
        const theatresInCity = await Theatre.find({ city: cityId }).select('_id');
        const theatreIds = theatresInCity.map(t => t._id);
        console.log(`[SHOWS FETCH] 1. Theatres found in city: ${theatreIds.length}`); // DEBUG LOG 1

        if (theatreIds.length === 0) {
            return res.status(200).json({ shows: [] });
        }

        // --- STEP 2: Find all Screens belonging to those Theatres ---
        const screensInCity = await Screen.find({ theatre: { $in: theatreIds } }).select('_id');
        const screenIds = screensInCity.map(s => s._id);
        console.log(`[SHOWS FETCH] 2. Screens found: ${screenIds.length}`); // DEBUG LOG 2

        if (screenIds.length === 0) {
            return res.status(200).json({ shows: [] });
        }

        // --- STEP 3: Find Shows matching the Movie, Date, and Screen IDs ---
        const shows = await Show.find({
            movie: movieId,
            screen: { $in: screenIds },
            startTime: { $gte: startOfDay, $lte: endOfDay }
        }).populate("movie")
            .populate({
                path: 'screen',
                populate: { path: 'theatre' }
            });

        console.log(`[SHOWS FETCH] 3. Final shows retrieved: ${shows.length}`); // DEBUG LOG 3

        return res.status(200).json({ shows });
    } catch (err) {
        console.error("Show fetching failed:", err);
        return res.status(500).json({ message: "Error fetching shows" });
    }
};
export const getShowById = async (req, res, next) => {
    const id = req.params.id;
    let show;
    try {
        // We fetch the show and fill in all the details (Movie, Screen, Theatre)
        show = await Show.findById(id)
            .populate("movie")
            .populate({
                path: "screen",
                populate: { path: "theatre" }
            });
    } catch (err) {
        return console.log(err);
    }

    if (!show) {
        return res.status(404).json({ message: "Show not found" });
    }
    return res.status(200).json({ show });
};