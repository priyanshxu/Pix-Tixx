import React, { useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    FormLabel,
    TextField,
    Typography,
    Stack,
    Paper,
    IconButton,
    Grid
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'; // Use correct icon import if needed
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Removed SeatConfigurator import as requested
const BASE_URL = process.env.REACT_APP_API_URL

const labelStyle = { mt: 1, mb: 1, fontWeight: "bold", color: "#2b2d42" };

// Reusable Component for Main Image Uploads
const FileUploadBox = ({ label, file, setFile, preview, setPreview, height = "200px" }) => (
    <Box
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
            border: "2px dashed #ccc",
            borderRadius: 2,
            p: 2,
            bgcolor: "#f9f9f9",
            minHeight: height,
            position: "relative",
            transition: "0.3s",
            "&:hover": { borderColor: "#e50914" },
        }}
    >
        <Typography variant="caption" mb={1} fontWeight="bold" color="#555">
            {label}
        </Typography>

        {preview ? (
            <Box position="relative" width="100%" height="100%">
                <img
                    src={preview}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                />
                <IconButton
                    onClick={() => { setFile(null); setPreview(null); }}
                    sx={{ position: "absolute", top: 5, right: 5, bgcolor: "rgba(0,0,0,0.6)", color: "white", "&:hover": { bgcolor: "red" } }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>
        ) : (
            <>
                <CloudUploadIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                <Button variant="outlined" component="label" size="small" sx={{ textTransform: "none" }}>
                    Choose File
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
            </>
        )}
    </Box>
);

const AddMovie = () => {
    const navigate = useNavigate();

    // Standard Inputs
    const [inputs, setInputs] = useState({ title: "", description: "", releaseDate: "", trailerUrl: "" });
    const [featured, setFeatured] = useState(false);

    // Main Images
    const [poster, setPoster] = useState(null);
    const [posterPreview, setPosterPreview] = useState(null);
    const [banner, setBanner] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    // Cast State (Array of Objects)
    const [cast, setCast] = useState([{ name: "", image: null, preview: "" }]);

    // --- HANDLERS ---
    const handleChange = (e) => setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    // Cast Logic
    const addCastMember = () => {
        setCast([...cast, { name: "", image: null, preview: "" }]);
    };

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

        if (!token || !adminId) return alert("Auth Error");
        if (!poster) return alert("Set Poster");

        const formData = new FormData();
        formData.append("title", inputs.title);
        formData.append("description", inputs.description);
        formData.append("releaseDate", inputs.releaseDate);
        formData.append("trailerUrl", inputs.trailerUrl);
        formData.append("featured", featured);
        formData.append("admin", adminId);
        formData.append("poster", poster);
        if (banner) formData.append("banner", banner);

        // Use empty seat config as discussed
        formData.append("seatConfiguration", JSON.stringify([]));

        // 1. Append Cast Metadata (Names)
        const castMeta = cast.map(c => ({ name: c.name }));
        formData.append("cast", JSON.stringify(castMeta));

        // 2. Append Cast Images (In same order)
        cast.forEach((c) => {
            if (c.image) {
                formData.append("castImages", c.image);
            }
        });

        try {
            // FIX: Changed URL from /movie/add to /movie
            await axios.post(`/movie`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });
            alert("Movie Added Successfully!");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error(err);
            alert("Failed to add movie");
        }
    };

    return (
        <Box width="100%" minHeight="100vh" bgcolor={"#fafafa"} py={4}>
            <Container maxWidth="md">
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, bgcolor: "white" }}>
                    <Typography variant="h4" textAlign="center" fontWeight="bold" mb={4}>Add New Movie</Typography>

                    <form onSubmit={handleSubmit}>
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} mb={4}>
                            {/* Images */}
                            <Stack spacing={2} flex={1}>
                                <FileUploadBox label="Vertical Poster *" file={poster} setFile={setPoster} preview={posterPreview} setPreview={setPosterPreview} height="250px" />
                                <FileUploadBox label="Horizontal Banner" file={banner} setFile={setBanner} preview={bannerPreview} setPreview={setBannerPreview} height="150px" />
                            </Stack>

                            {/* Details */}
                            <Stack spacing={2} flex={1.5}>
                                <TextField label="Title" name="title" value={inputs.title} onChange={handleChange} fullWidth size="small" required />
                                <TextField label="Description" name="description" value={inputs.description} onChange={handleChange} multiline rows={4} fullWidth size="small" required />
                                <TextField type="date" label="Release Date" name="releaseDate" value={inputs.releaseDate} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} required />
                                <TextField label="Trailer URL (YouTube)" name="trailerUrl" value={inputs.trailerUrl} onChange={handleChange} fullWidth size="small" placeholder="https://youtube.com/..." />

                                <Box display="flex" alignItems="center">
                                    <Checkbox checked={featured} onChange={(e) => setFeatured(e.target.checked)} sx={{ color: "#e50914" }} />
                                    <Typography fontWeight="bold">Mark as Featured</Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {/* --- CAST SECTION --- */}
                        <Box mb={4} p={2} border="1px solid #eee" borderRadius={2}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Cast Details</Typography>

                            {cast.map((actor, index) => (
                                <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
                                    {/* Upload Avatar */}
                                    <Button component="label" sx={{ borderRadius: "50%", width: 60, height: 60, minWidth: 0, padding: 0, overflow: 'hidden', border: '1px dashed #ccc' }}>
                                        {actor.preview ? (
                                            <img src={actor.preview} alt="Actor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <CloudUploadIcon color="action" />
                                        )}
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleCastFile(index, e.target.files[0])} />
                                    </Button>

                                    <TextField
                                        label="Actor Name"
                                        size="small"
                                        fullWidth
                                        value={actor.name}
                                        onChange={(e) => handleCastChange(index, e.target.value)}
                                    />

                                    <IconButton onClick={() => removeCastMember(index)} color="error">
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                </Box>
                            ))}

                            <Button startIcon={<AddCircleOutlineIcon />} onClick={addCastMember} sx={{ color: "#e50914" }}>
                                Add Cast Member
                            </Button>
                        </Box>

                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 4, bgcolor: "#2b2d42" }}>Publish Movie</Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default AddMovie;