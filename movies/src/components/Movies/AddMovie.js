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
    Autocomplete,
    Chip,
    useTheme,
    useMediaQuery,
    Paper,
    IconButton
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Using axios directly for better Header control
import SeatConfigurator from "../Admin/SeatConfigurator"; // Import the Seat Tool

const labelStyle = { mt: 1, mb: 1, fontWeight: "bold", color: "#2b2d42" };

const AddMovie = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    // State for form inputs
    const [inputs, setInputs] = useState({
        title: "",
        description: "",
        releaseDate: "",
    });

    // Special States
    const [actors, setActors] = useState([]);
    const [featured, setFeatured] = useState(false);
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    // NEW: Seat Configuration State
    const [seatConfig, setSeatConfig] = useState([]);

    // Handle Text Inputs
    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    // Handle File Selection & Preview
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFilePreview(URL.createObjectURL(selectedFile));
        }
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Auth Check
        const token = localStorage.getItem("adminToken");
        const adminId = localStorage.getItem("adminId");

        if (!token || !adminId) {
            alert("You are not authenticated as Admin.");
            return;
        }

        // 2. Validate Seat Map
        if (seatConfig.length === 0) {
            alert("Please configure the Seat Map before publishing.");
            return;
        }

        // 3. Prepare FormData
        const formData = new FormData();
        formData.append("title", inputs.title);
        formData.append("description", inputs.description);
        formData.append("releaseDate", inputs.releaseDate);
        formData.append("featured", featured);
        formData.append("image", file);
        formData.append("admin", adminId);

        // JSON Stringify complex structures
        formData.append("actors", JSON.stringify(actors));
        formData.append("seatConfiguration", JSON.stringify(seatConfig));

        // 4. Send Request
        try {
            await axios.post("http://localhost:5000/movie/add", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Movie Added Successfully!");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error(err);
            alert("Failed to add movie. Check console for details.");
        }
    };

    return (
        <Box
            width="100%"
            minHeight="100vh"
            bgcolor={"#fafafa"}
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        borderRadius: 4,
                        bgcolor: "white",
                        overflow: "hidden",
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
                            flexDirection={isMobile ? "column" : "row"}
                            gap={4}
                            mb={4}
                        >
                            {/* --- LEFT COLUMN: Image Upload --- */}
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
                                    minHeight: "300px",
                                    position: "relative",
                                    transition: "0.3s",
                                    "&:hover": { borderColor: "#4a90e2" },
                                }}
                            >
                                {filePreview ? (
                                    <Box position="relative" width="100%" height="100%">
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            style={{
                                                width: "100%",
                                                height: "300px",
                                                objectFit: "cover",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <IconButton
                                            onClick={() => {
                                                setFile(null);
                                                setFilePreview(null);
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
                                        <CloudUploadIcon
                                            sx={{ fontSize: 60, color: "#ccc", mb: 2 }}
                                        />
                                        <Typography color="#888" textAlign="center" mb={2}>
                                            Drag & Drop or Click to Upload Poster
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            sx={{ borderRadius: 20, textTransform: "none" }}
                                        >
                                            Choose File
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                    </>
                                )}
                            </Box>

                            {/* --- RIGHT COLUMN: Form Details --- */}
                            <Box flex={1.5}>
                                <Stack spacing={2}>
                                    <Box>
                                        <FormLabel sx={labelStyle}>Title</FormLabel>
                                        <TextField
                                            value={inputs.title}
                                            onChange={handleChange}
                                            name="title"
                                            variant="outlined"
                                            fullWidth
                                            placeholder="e.g. Stree 2"
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
                                            placeholder="Movie synopsis..."
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

                                    <Box>
                                        <FormLabel sx={labelStyle}>Actors</FormLabel>
                                        <Autocomplete
                                            multiple
                                            freeSolo
                                            options={[]}
                                            value={actors}
                                            onChange={(e, newValue) => setActors(newValue)}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        variant="outlined"
                                                        label={option}
                                                        {...getTagProps({ index })}
                                                    />
                                                ))
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    placeholder="Type name & press Enter"
                                                    size="small"
                                                />
                                            )}
                                        />
                                    </Box>

                                    <Box display="flex" alignItems="center">
                                        <Checkbox
                                            checked={featured}
                                            onChange={(e) => setFeatured(e.target.checked)}
                                            sx={{ mr: 1, color: "#2b2d42" }}
                                        />
                                        <Typography variant="body1" fontWeight="500">
                                            Mark as Featured Movie
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
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