import axios from "axios";
export const getAllMovies = async() => {
    const res = await axios
    .get("/movie")
    .catch((err) => console.log(err));

    if(res.status !== 200){
        return console.log("No Data");
    }
    const data = await res.data;
    return data;
};

export const sendUserAuthRequest = async(data, signup) => {
    const res = await axios
        .post(`/user/${signup?"signup":"login"}`, {
            name : signup ? data.name : "",
            email : data.email,
            password : data.password,

        }).catch((err) => console.log(err));

    if(res.status!==200 && res.status!==201) {
        console.log("Unexpected Error Occured");
        
    }
    const resData = await res.data;
    return resData;
};

export const sendAdminAuthRequest = async(data) => {
    const res = await axios
        .post("/admin/login",{
            email: data.email,
            password: data.password,
        })
        .catch((err) => console.log(err));
    
    if(res.status!==200 && res.status!==201){
        return console.log("Unexpected Error");
    }

    const resData = await res.data;
    return resData;
};
export const getMovieDetails = async (id) => {
    const res = await axios.get(`/movie/${id}`).catch((err) => console.log(err));
    if(res.status!==200){
        return console.log("Unexpected Error");
    }
    const resData = await res.data;
    return resData;
};
export const addMovie = async (data) => {
    try {
        const res = await axios.post("/movie/add", data, {
            headers: {
                // Ensure this key matches what you saved in Admin Login
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        // If success
        if (res.status === 201) {
            return res.data;
        }
    } catch (err) {
        // 🛑 THIS IS WHERE WE DEBUG THE 400 ERROR
        console.error("Error inside addMovie Helper:", err);

        // Check if the server sent a specific message
        if (err.response) {
            console.log("Server responded with:", err.response.data);
            // This will print: { message: "No image provided" } or { message: "Token Not Found" }
        }

        return null; // Return null so the component knows it failed
    }
};