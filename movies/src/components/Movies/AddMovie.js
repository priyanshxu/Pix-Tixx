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
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SeatConfigurator from "../Admin/SeatConfigurator";

const labelStyle = { mt: 1, mb: 1, fontWeight: "bold", color: "#2b2d42" };

// Reusable File Upload Box (Same as before)
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
                    Choose File
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

const AddMovie = () => {
    const navigate = useNavigate();

    // Form Inputs
    const [inputs, setInputs] = useState({
        title: "",
        description: "",
        releaseDate: "",
    });

    // Special States
    const [featured, setFeatured] = useState(false);

    // Cast State: Array of objects { name: string, image: File, preview: string }
    const [cast, setCast] = useState([{ name: "", image: null, preview: "" }]);

    // Image States (Poster & Banner)
    const [poster, setPoster] = useState(null);
    const [posterPreview, setPosterPreview] = useState(null);
    const [banner, setBanner] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    // Seat Configuration State
    const [seatConfig, setSeatConfig] = useState([]);

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    // --- Cast Handlers ---
    const handleCastNameChange = (index, value) => {
        const newCast = [...cast];
        newCast[index].name = value;
        setCast(newCast);
    };

    const handleCastImageChange = (index, file) => {
        const newCast = [...cast];
        newCast[index].image = file;
        newCast[index].preview = URL.createObjectURL(file);
        setCast(newCast);
    };

    const addCastMember = () => {
        setCast([...cast, { name: "", image: null, preview: "" }]);
    };

    const removeCastMember = (index) => {
        const newCast = [...cast];
        newCast.splice(index, 1);
        setCast(newCast);
    };
    // ---------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Auth Check
        const token = localStorage.getItem("adminToken");
        const adminId = localStorage.getItem("adminId");

        if (!token || !adminId) {
            alert("You are not authenticated as Admin.");
            return;
        }

        // 2. Validate
        if (seatConfig.length === 0) {
            alert("Please configure the Seat Map.");
            return;
        }
        if (!poster) {
            alert("Please upload a Poster image.");
            return;
        }

        // 3. Prepare FormData
        const formData = new FormData();
        formData.append("title", inputs.title);
        formData.append("description", inputs.description);
        formData.append("releaseDate", inputs.releaseDate);
        formData.append("featured", featured);
        formData.append("admin", adminId);

        // Images
        formData.append("poster", poster);
        if (banner) formData.append("banner", banner);

        // Cast Data
        // We send the metadata (names) as a JSON string
        const castData = cast.map(c => ({ name: c.name }));
        formData.append("cast", JSON.stringify(castData));

        // We append cast images. Note: The backend must expect 'castImages' array
        cast.forEach((c) => {
            if (c.image) {
                formData.append("castImages", c.image);
            }
        });

        // Seat Config
        formData.append("seatConfiguration", JSON.stringify(seatConfig));

        // 4. Send Request
        try {
            await axios.post("http://localhost:5000/movie", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Movie Added Successfully!");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error(err);
            alert("Failed to add movie. Check console.");
        }
    };

    return (
        <Box
            width="100%"
            minHeight="100vh"
            bgcolor={"#fafafa"}
            display="flex"
            justifyContent="center"
            py={4}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        borderRadius: 4,
                        bgcolor: "white",
                    }}
                >
                    <Typography
                        variant="h4"
                        textAlign="center"
                        fontWeight="bold"
                        color="#2b2d42"
                        mb={4}
                    >
                        Add New Movie
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Box
                            display="flex"
                            flexDirection={{ xs: "column", md: "row" }}
                            gap={4}
                            mb={4}
                        >
                            {/* --- LEFT COLUMN: Images --- */}
                            <Stack spacing={2} flex={1}>
                                <FileUploadBox
                                    label="Vertical Poster (Required)"
                                    file={poster}
                                    setFile={setPoster}
                                    preview={posterPreview}
                                    setPreview={setPosterPreview}
                                    height="250px"
                                />
                                <FileUploadBox
                                    label="Horizontal Banner (For Hero Section)"
                                    file={banner}
                                    setFile={setBanner}
                                    preview={bannerPreview}
                                    setPreview={setBannerPreview}
                                    height="150px"
                                />
                            </Stack>

                            {/* --- RIGHT COLUMN: Details --- */}
                            <Stack spacing={2} flex={1.5}>
                                <Box>
                                    <FormLabel sx={labelStyle}>Title</FormLabel>
                                    <TextField
                                        value={inputs.title}
                                        onChange={handleChange}
                                        name="title"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                    />
                                </Box>

                                <Box>
                                    <FormLabel sx={labelStyle}>Description</FormLabel>
                                    <TextField
                                        value={inputs.description}
                                        onChange={handleChange}
                                        name="description"
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        size="small"
                                    />
                                </Box>

                                <Box>
                                    <FormLabel sx={labelStyle}>Release Date</FormLabel>
                                    <TextField
                                        value={inputs.releaseDate}
                                        onChange={handleChange}
                                        name="releaseDate"
                                        type="date"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Box>

                                {/* --- CAST SECTION (REPLACED AUTOCOMPLETE) --- */}
                                <Box>
                                    <FormLabel sx={labelStyle}>Cast (Name & Photo)</FormLabel>
                                    <Stack spacing={2}>
                                        {cast.map((member, index) => (
                                            <Box key={index} display="flex" alignItems="center" gap={2}>
                                                {/* Mini Image Upload */}
                                                <Button
                                                    component="label"
                                                    sx={{
                                                        width: 50,
                                                        height: 50,
                                                        border: "1px dashed #ccc",
                                                        borderRadius: "50%",
                                                        padding: 0,
                                                        overflow: "hidden",
                                                        minWidth: 0
                                                    }}
                                                >
                                                    {member.preview ? (
                                                        <img src={member.preview} alt="Cast" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    ) : (
                                                        <CloudUploadIcon fontSize="small" color="action" />
                                                    )}
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept="image/*"
                                                        onChange={(e) => handleCastImageChange(index, e.target.files[0])}
                                                    />
                                                </Button>

                                                <TextField
                                                    placeholder="Actor Name"
                                                    size="small"
                                                    fullWidth
                                                    value={member.name}
                                                    onChange={(e) => handleCastNameChange(index, e.target.value)}
                                                />

                                                <IconButton
                                                    onClick={() => removeCastMember(index)}
                                                    disabled={cast.length === 1}
                                                    color="error"
                                                >
                                                    <RemoveCircleOutlineIcon />
                                                </IconButton>
                                            </Box>
                                        ))}
                                        <Button
                                            startIcon={<AddCircleOutlineIcon />}
                                            onClick={addCastMember}
                                            size="small"
                                            sx={{ textTransform: "none", alignSelf: "flex-start" }}
                                        >
                                            Add Cast Member
                                        </Button>
                                    </Stack>
                                </Box>

                                <Box display="flex" alignItems="center" mt={1}>
                                    <Checkbox
                                        checked={featured}
                                        onChange={(e) => setFeatured(e.target.checked)}
                                        sx={{ mr: 1, color: "#e50914" }}
                                    />
                                    <Typography variant="body2" fontWeight="bold">
                                        Mark as Featured (Banner will be shown)
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {/* --- BOTTOM SECTION: Seat Configurator --- */}
                        <Box mt={4} borderTop="1px solid #eee" pt={3}>
                            <SeatConfigurator onConfigurationChange={setSeatConfig} />
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                mt: 4,
                                bgcolor: "#2b2d42",
                                borderRadius: 2,
                                py: 1.5,
                                fontSize: "1rem",
                                "&:hover": { bgcolor: "#3a3d5e" },
                            }}
                            disabled={seatConfig.length === 0}
                        >
                            Publish Movie
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default AddMovie;