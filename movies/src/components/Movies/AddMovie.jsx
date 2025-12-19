import React, { useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    TextField,
    Typography,
    Stack,
    Paper,
    IconButton,
    Grid,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    OutlinedInput,
    Chip,
    InputAdornment
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MovieCreationIcon from '@mui/icons-material/MovieCreation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from "react-router-dom";
import axios from "axios";

// GENRE OPTIONS
const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller", "Animation", "Crime"];
const RATINGS = ["U", "U/A", "A", "S", "PG-13", "R"];

// Reusable Image Upload Component
const FileUploadBox = ({ label, file, setFile, preview, setPreview, height = "200px", icon }) => (
    <Box
        sx={{
            border: "2px dashed #e0e0e0",
            borderRadius: 3,
            p: 2,
            bgcolor: "#fafafa",
            height: height,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            transition: "0.3s",
            cursor: "pointer",
            "&:hover": { borderColor: "#e50914", bgcolor: "#fff0f1" },
        }}
    >
        <Typography variant="caption" mb={1} fontWeight="bold" color="#666" textTransform="uppercase">
            {label}
        </Typography>

        {preview ? (
            <Box position="relative" width="100%" height="100%">
                <img
                    src={preview}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
                />
                <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    sx={{ position: "absolute", top: 0, right: 0, bgcolor: "white", boxShadow: 1, "&:hover": { color: "red" } }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
        ) : (
            <Button component="label" sx={{ width: "100%", height: "100%", textTransform: "none", flexDirection: "column" }}>
                {icon || <CloudUploadIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />}
                <Typography variant="body2" color="gray">Click to upload</Typography>
                <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                    }}
                />
            </Button>
        )}
    </Box>
);

const AddMovie = () => {
    const navigate = useNavigate();

    // Standard Inputs
    const [inputs, setInputs] = useState({
        title: "",
        description: "",
        releaseDate: "",
        trailerUrl: "",
        director: "",
        runtime: "",
        language: "",
        censorRating: ""
    });

    const [genres, setGenres] = useState([]); // Multi-select array
    const [featured, setFeatured] = useState(false);

    // Images
    const [poster, setPoster] = useState(null);
    const [posterPreview, setPosterPreview] = useState(null);
    const [banner, setBanner] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    // Cast State
    const [cast, setCast] = useState([{ name: "", image: null, preview: "" }]);

    // --- HANDLERS ---
    const handleChange = (e) => setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleGenreChange = (event) => {
        const { target: { value } } = event;
        setGenres(typeof value === 'string' ? value.split(',') : value);
    };

    // Cast Logic
    const addCastMember = () => setCast([...cast, { name: "", image: null, preview: "" }]);
    const removeCastMember = (index) => {
        const updated = [...cast];
        updated.splice(index, 1);
        setCast(updated);
    };
    const handleCastChange = (index, value) => {
        const updated = [...cast];
        updated[index].name = value;
        setCast(updated);
    };
    const handleCastFile = (index, file) => {
        const updated = [...cast];
        updated[index].image = file;
        updated[index].preview = URL.createObjectURL(file);
        setCast(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("adminToken");
        const adminId = localStorage.getItem("adminId");

        if (!token || !adminId) return alert("Auth Error: Please login again.");
        if (!poster) return alert("Please upload a poster image.");
        if (genres.length === 0) return alert("Please select at least one genre.");

        const formData = new FormData();
        // Basic Fields
        Object.keys(inputs).forEach(key => formData.append(key, inputs[key]));

        formData.append("featured", featured);
        formData.append("admin", adminId);
        formData.append("genre", JSON.stringify(genres)); // Send array as JSON
        formData.append("poster", poster);
        if (banner) formData.append("banner", banner);

        // Append empty seat config (as requested)
        formData.append("seatConfiguration", JSON.stringify([]));

        // Append Cast
        const castMeta = cast.map(c => ({ name: c.name }));
        formData.append("cast", JSON.stringify(castMeta));
        cast.forEach((c) => { if (c.image) formData.append("castImages", c.image); });

        try {
            await axios.post(`/movie`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });
            alert("Movie Added Successfully!");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error(err);
            alert("Failed to add movie. Please check inputs.");
        }
    };

    return (
        <Box width="100%" minHeight="100vh" bgcolor="#f4f6f8" py={5}>
            <Container maxWidth="lg">
                <Paper elevation={0} sx={{ p: { xs: 2, md: 5 }, borderRadius: 4, bgcolor: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>

                    <Box display="flex" alignItems="center" gap={2} mb={4} pb={2} borderBottom="1px solid #eee">
                        <MovieCreationIcon sx={{ fontSize: 40, color: "#e50914" }} />
                        <Box>
                            <Typography variant="h4" fontWeight="800" color="#1a1a1a">Add New Movie</Typography>
                            <Typography variant="body2" color="gray">Create a new listing for the cinema database</Typography>
                        </Box>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={4}>

                            {/* --- LEFT COL: IMAGES --- */}
                            <Grid item xs={12} md={4}>
                                <Stack spacing={3}>
                                    <FileUploadBox label="Vertical Poster (Required)" file={poster} setFile={setPoster} preview={posterPreview} setPreview={setPosterPreview} height="360px" />
                                    <FileUploadBox label="Wide Banner / Feature" file={banner} setFile={setBanner} preview={bannerPreview} setPreview={setBannerPreview} height="180px" />
                                </Stack>
                            </Grid>

                            {/* --- RIGHT COL: DATA --- */}
                            <Grid item xs={12} md={8}>
                                <Stack spacing={3}>

                                    {/* Row 1: Title & Director */}
                                    <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                                        <TextField label="Movie Title" name="title" value={inputs.title} onChange={handleChange} fullWidth required />
                                        <TextField label="Director" name="director" value={inputs.director} onChange={handleChange} fullWidth required />
                                    </Box>

                                    {/* Row 2: Runtime, Language, Rating */}
                                    <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                                        <TextField
                                            label="Runtime" name="runtime" type="number" value={inputs.runtime} onChange={handleChange} fullWidth required
                                            InputProps={{ endAdornment: <InputAdornment position="end"><AccessTimeIcon fontSize="small" /> min</InputAdornment> }}
                                        />
                                        <TextField label="Language" name="language" value={inputs.language} onChange={handleChange} fullWidth required placeholder="e.g. English, Hindi" />

                                        <FormControl fullWidth required>
                                            <InputLabel>Rating</InputLabel>
                                            <Select name="censorRating" value={inputs.censorRating} label="Rating" onChange={handleChange}>
                                                {RATINGS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    {/* Row 3: Genres (Multi-select) */}
                                    <FormControl fullWidth required>
                                        <InputLabel>Genre</InputLabel>
                                        <Select
                                            multiple
                                            value={genres}
                                            onChange={handleGenreChange}
                                            input={<OutlinedInput label="Genre" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => (
                                                        <Chip key={value} label={value} size="small" sx={{ bgcolor: "#e50914", color: "white" }} />
                                                    ))}
                                                </Box>
                                            )}
                                        >
                                            {GENRES.map((name) => (
                                                <MenuItem key={name} value={name}>{name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Row 4: Description */}
                                    <TextField label="Synopsis / Description" name="description" value={inputs.description} onChange={handleChange} multiline rows={4} fullWidth required />

                                    {/* Row 5: Dates & Links */}
                                    <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                                        <TextField type="date" label="Release Date" name="releaseDate" value={inputs.releaseDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
                                        <TextField label="Trailer URL (YouTube)" name="trailerUrl" value={inputs.trailerUrl} onChange={handleChange} fullWidth placeholder="https://..." />
                                    </Box>

                                    {/* Checkbox */}
                                    <Box display="flex" alignItems="center" bgcolor="#fff0f1" p={1} borderRadius={2} width="fit-content">
                                        <Checkbox checked={featured} onChange={(e) => setFeatured(e.target.checked)} sx={{ color: "#e50914", '&.Mui-checked': { color: "#e50914" } }} />
                                        <Typography fontWeight="bold" color="#e50914">Feature this movie on Homepage</Typography>
                                    </Box>

                                </Stack>
                            </Grid>
                        </Grid>

                        {/* --- CAST SECTION --- */}
                        <Box mt={6} p={3} border="1px solid #eee" borderRadius={3} bgcolor="#fafafa">
                            <Typography variant="h6" fontWeight="bold" mb={2}>Cast & Crew</Typography>

                            <Grid container spacing={2}>
                                {cast.map((actor, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Paper elevation={0} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, border: "1px solid #e0e0e0" }}>
                                            <Button component="label" sx={{ borderRadius: "50%", width: 50, height: 50, minWidth: 0, p: 0, overflow: 'hidden', border: '1px solid #ccc' }}>
                                                {actor.preview ? (
                                                    <img src={actor.preview} alt="Actor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : <CloudUploadIcon color="action" fontSize="small" />}
                                                <input type="file" hidden accept="image/*" onChange={(e) => handleCastFile(index, e.target.files[0])} />
                                            </Button>

                                            <TextField
                                                variant="standard"
                                                placeholder="Actor Name"
                                                value={actor.name}
                                                onChange={(e) => handleCastChange(index, e.target.value)}
                                                fullWidth
                                            />

                                            <IconButton onClick={() => removeCastMember(index)} size="small" sx={{ color: "#999", "&:hover": { color: "red" } }}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            <Button startIcon={<AddCircleOutlineIcon />} onClick={addCastMember} sx={{ mt: 2, color: "#e50914", fontWeight: "bold" }}>
                                Add Cast Member
                            </Button>
                        </Box>

                        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 5, py: 1.5, fontSize: "1.1rem", bgcolor: "#1a1a1a", fontWeight: "bold", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}>
                            Publish Movie to Database
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default AddMovie;