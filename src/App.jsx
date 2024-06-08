import { LoadingButton } from "@mui/lab";
import { Box, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import '../public/settings.png';
import '../public/search.png';

export default function App(){

  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const API_WEATHER = `https://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_API_KEY}&q=`
  const [error, setError] = useState({
    error: false,
    message: ""
  })
  const [weather, setWeather] = useState({
    city: "",
    country: "",
    temp: "",
    condition: "",
    icon: "",
    conditionText: ""
  })
  const [searches, setSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const openTab = () => {
    setIsOpen(!isOpen);
  };

  const onSubmit = async(e) =>{
    e.preventDefault();
    setLoading(true);
    setError({
      error: false,
      message: ""
    })
    try {
      if(!city.trim()) throw { message: "El campo Ciudad es obligatorio" };
      const response = await fetch(`${API_WEATHER}${city}`);
      const data = await response.json();
      if(data.error) throw { message: data.error.message }
      setWeather({
        city: data.location.name,
        country: data.location.country,
        temp: data.current.temp_c,
        condition: data.current.condition.code,
        icon: data.current.condition.icon,
        conditionText: data.current.condition.text
      })

      await axios.post('http://localhost:4000/searches', {
        search: data.location.name
      });

    } catch (error){
      setError({
        error: true,
        message: error.message
      })
    } finally {
      handlerHistory();
      setLoading(false);
    }
  }

  async function handlerHistory(){
    const {data} = await axios('http://localhost:4000/searches');
    setSearches(data);
  }
  async function handlerDelete(){
    const {data} = await axios.delete('http://localhost:4000/searches');
    setSearches(data);
  }

  const autocomplete = (search) => {
    event.preventDefault();
    setCity(search);
    console.log(search);
}

  return(
    <Container
      maxWidth="xs"
      sx={{mt: 2}}>
        <Typography
          variant="h3"
          component="h1"
          align="center"
          gutterBottom
        >
          Weather App
        </Typography>
        <button className="settings" onClick={openTab}>
          <img src='../public/settings.png' alt="Icono de ajustes" width="27px"/>
        </button>
        {isOpen && (
        <div className="tab">
          <button onClick={handlerDelete} type="button" className="deleteButton">
            ELIMINAR HISTORIAL
          </button>
        </div>
      )}
      {weather.city && (
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gap: 2,
              textAlign: "center"
            }}
          >
          <Typography variant="h4" component="h2">
            {weather.city}, {weather.country}
          </Typography>
          <Box
            component="img"
            alt={weather.conditionText}
            src={weather.icon}
            sx={{margin: "0 auto"}}
          />
          <Typography variant="h5" component="h3">
            {weather.temp} ºC
          </Typography>
          <Typography variant="h6" component="h4">
            {weather.conditionText}
          </Typography>
        </Box>
        )}
        <Box
          sx={{display: "grid"}}
          component="form"
          autoComplete="off"
          onChange={handlerHistory}
          className="searcherContainer"
        >
        <div className="searcherAndButton">
        <TextField
          id="city"
          label="Ciudad"
          variant="outlined"
          size="small"
          className="input"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={error.error} 
          helperText={error.message}
        />
        <LoadingButton
            onClick={onSubmit}
            variant="contained" 
            loading={loading} 
            loadingIndicator="Cargando..."
          >
            Buscar
          </LoadingButton>
        </div>
        <Box className="resultsContainer">
          {searches.map(({search}, index) => {
            return <button className="results" key={index} onClick={() => autocomplete(search)}>
                <img src="../public/search.png" alt="icono buscar" className="lupa"/>{search}
            </button>
          })}
        </Box>
      </Box>
      <Typography
        textAlign="center"
        sx={{mt: 2, fontSize: "10px"}}
      >
        Powered By {" "}
        <a href="https://www.weatherapi.com" title="Weather API">
          WeatherAPI.com
        </a>
      </Typography>
    </Container>
  )
}