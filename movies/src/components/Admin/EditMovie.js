import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SeatConfigurator from "./SeatConfigurator";

const labelStyle = { mt: 1, mb: 1, fontWeight: "bold", color: "#2b2d42" };

// Reusable Image Upload Component
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
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                    }}
                />
                <IconButton
                    onClick={() => {
                        setFile(null);
                        setPreview(null);
                    }}
                    sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        bgcolor: "rgba(0,0,0,0.6)",
                        color: "white",
                        "&:hover": { bgcolor: "red" },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>
        ) : (
            <>
                <CloudUploadIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ textTransform: "none" }}
                >
                    Change File
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                            const f = e.target.files[0];
                            if (f) {
                                setFile(f);
                                setPreview(URL.createObjectURL(f));
                            }
                        }}
                    />
                </Button>
            </>
        )}
    </Box>
);

const EditMovie = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Inputs
    const [inputs, setInputs] = useState({
        title: "",
        description: "",
        releaseDate: "",
        trailerUrl: "" // Added Trailer
    });
    const [featured, setFeatured] = useState(false);

    // Cast State
    const [cast, setCast] = useState([]);

    // Images
    const [poster, setPoster] = useState(null);
    const [posterPreview, setPosterPreview] = useState(null);

    const [banner, setBanner] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    // Seat Config
    const [seatConfig, setSeatConfig] = useState([]);

    // 1. FETCH & POPULATE DATA
    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/movie/${id}`);
                const m = res.data.movie;

                setInputs({
                    title: m.title,
                    description: m.description,
                    releaseDate: new Date(m.releaseDate).toISOString().split('T')[0],
                    trailerUrl: m.trailerUrl || ""
                });
                setFeatured(m.featured);
                setSeatConfig(m.seatConfiguration || []);

                // Pre-fill Images
                setPosterPreview(m.posterUrl);
                setBannerPreview(m.featuredUrl);

                // Pre-fill Cast (Map backend structure to frontend structure)
                // Backend: { name, imageUrl } -> Frontend: { name, image: null, preview: imageUrl }
                if (m.cast && m.cast.length > 0) {
                    const formattedCast = m.cast.map(c => ({
                        name: c.name,
                        image: null, // No new file yet
                        preview: c.imageUrl
                    }));
                    setCast(formattedCast);
                }

            } catch (err) {
                console.log(err);
            }
        };
        fetchMovie();
    }, [id]);

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // --- Cast Handlers ---
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

    const handleCastImage = (index, file) => {
        const updated = [...cast];
        updated[index].image = file; // New file
        updated[index].preview = URL.createObjectURL(file); // New preview
        setCast(updated);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("adminToken");

        const formData = new FormData();
        formData.append("title", inputs.title);
        formData.append("description", inputs.description);
        formData.append("releaseDate", inputs.releaseDate);
        formData.append("trailerUrl", inputs.trailerUrl);
        formData.append("featured", featured);
        formData.append("seatConfiguration", JSON.stringify(seatConfig));

        // Only append Main Images if changed (file is not null)
        if (poster) formData.append("poster", poster);
        if (banner) formData.append("banner", banner);

        // Handle Cast
        // We pass the "names" as metadata. 
        // NOTE: For updating cast images properly, the backend logic needs to be very robust.
        // This frontend logic sends 'cast' data. 
        // If your backend 'updateMovie' doesn't handle 'castImages' files yet, only names will update.
        const castMeta = cast.map(c => ({
            name: c.name,
            // If we have a preview but no new image, it's an existing URL. We can pass it back.
            imageUrl: c.image ? "" : c.preview
        }));
        formData.append("cast", JSON.stringify(castMeta));

        cast.forEach((c) => {
            if (c.image) {
                formData.append("castImages", c.image);
            }
        });

        try {
            await axios.put(`http://localhost:5000/movie/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Movie Updated Successfully!");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error(err);
            alert("Failed to update movie.");
        }
    };

    return (
        <Box width="100%" minHeight="100vh" bgcolor={"#fafafa"} py={4}>
            <Container maxWidth="md">
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, bgcolor: "white" }}>
                    <Typography variant="h4" textAlign="center" fontWeight="bold" mb={4}>Edit Movie</Typography>

                    <form onSubmit={handleSubmit}>
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} mb={4}>
                            {/* Images */}
                            <Stack spacing={2} flex={1}>
                                <FileUploadBox label="Vertical Poster" file={poster} setFile={setPoster} preview={posterPreview} setPreview={setPosterPreview} height="250px" />
                                <FileUploadBox label="Horizontal Banner" file={banner} setFile={setBanner} preview={bannerPreview} setPreview={setBannerPreview} height="150px" />
                            </Stack>

                            {/* Details */}
                            <Stack spacing={2} flex={1.5}>
                                <TextField label="Title" name="title" value={inputs.title} onChange={handleChange} fullWidth size="small" />
                                <TextField label="Description" name="description" value={inputs.description} onChange={handleChange} multiline rows={4} fullWidth size="small" />
                                <TextField type="date" label="Release Date" name="releaseDate" value={inputs.releaseDate} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
                                <TextField label="Trailer URL" name="trailerUrl" value={inputs.trailerUrl} onChange={handleChange} fullWidth size="small" placeholder="https://youtube.com/..." />

                                <Box display="flex" alignItems="center">
                                    <Checkbox checked={featured} onChange={(e) => setFeatured(e.target.checked)} sx={{ color: "#e50914" }} />
                                    <Typography fontWeight="bold">Mark as Featured</Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {/* --- CAST SECTION --- */}
                        <Box mb={4} p={2} border="1px solid #eee" borderRadius={2}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Cast Details</Typography>

                            {cast.map((member, index) => (
                                <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
                                    <Button component="label" sx={{ borderRadius: "50%", width: 60, height: 60, minWidth: 0, padding: 0, overflow: 'hidden', border: '1px dashed #ccc' }}>
                                        {member.preview ? (
                                            <img src={member.preview} alt="Cast" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <CloudUploadIcon color="action" />
                                        )}
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleCastImage(index, e.target.files[0])} />
                                    </Button>

                                    <TextField
                                        label="Actor Name" size="small" fullWidth
                                        value={member.name}
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

                        {/* Seat Config */}
                        <Box mt={2} borderTop="1px solid #eee" pt={3}>
                            <SeatConfigurator onConfigurationChange={setSeatConfig} />
                        </Box>

                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 4, bgcolor: "#2b2d42" }}>Update Movie</Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default EditMovie;