import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getAllMovies } from '../../api-helpers/api-helpers'
import MovieItem from './MovieItem'

const Movies = () => {
    const [movies, setMovies] = useState()
    useEffect(()=>{
        getAllMovies().then((data)=> setMovies(data.movies)).catch(err => console.log(err))
    })
  return (
    <Box margin={"auto"} marginTop={4}>
        <Typography margin={"auto"} variant="h4" padding={2} textAlign={"center"} bgcolor={"#00bfff"} color="white" width={"40%"}> All Movies

        </Typography>
        <Box 
            marginTop={5} 
            width={"100%"} 
            margin={"auto"} 
            display={'flex'} 
            justifyContent={"center"} 
            flexWrap={"wrap"}
            >
                {movies && movies.map((movie,index)=><MovieItem key={index} id={movie._id} posterUrl={movie.posterUrl} releaseDate={movie.releaseDate} title={movie.title}/>)}
        </Box>
    </Box>
  )
}

export default Movies