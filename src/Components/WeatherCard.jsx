import React, { useState, useEffect } from "react";
import axios from "axios";

const WeatherCard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("Pune"); // Default city
  const [searchCity, setSearchCity] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("morning");

  useEffect(() => {
    const fetchWeather = async (cityName) => {
      const API_KEY = import.meta.env.VITE_API_KEY;
      const URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;

      try {
        const response = await axios.get(URL);
        setWeatherData(response.data);
        determineTimeOfDay(response.data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    const determineTimeOfDay = (data) => {
      const currentTime = new Date().getTime() / 1000; // Current time in UNIX
      const { sunrise, sunset } = data.sys;

      if (currentTime >= sunrise && currentTime < sunrise + 4 * 60 * 60) {
        setTimeOfDay("morning");
      } else if (currentTime >= sunrise + 4 * 60 * 60 && currentTime < sunset - 2 * 60 * 60) {
        setTimeOfDay("afternoon");
      } else if (currentTime >= sunset - 2 * 60 * 60 && currentTime < sunset) {
        setTimeOfDay("evening");
      } else {
        setTimeOfDay("night");
      }
    };

    // Fetch weather data for the current city
    fetchWeather(city);
  }, [city]);

  useEffect(() => {
    const fetchInitialCity = async () => {
      try {
        const locationResponse = await axios.get("https://ipapi.co/json/");
        setCity(locationResponse.data.city || "Pune");
      } catch (error) {
        console.warn("Failed to fetch user's location, defaulting to Pune.");
      }
    };

    // Fetch the initial city only once
    fetchInitialCity();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setCity(searchCity.trim());
      setSearchCity("");
    }
  };

  if (!weatherData) return <div>Loading...</div>;

  // Extract weather details
  const { temp, temp_max, temp_min, pressure } = weatherData.main;
  const { speed } = weatherData.wind;
  const { icon, main: weatherMain, description } = weatherData.weather[0];
  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Dynamic background and weather icon
  const backgroundPath = `/backgrounds/${timeOfDay}.jpeg`;
  const weatherIconPath = `http://openweathermap.org/img/wn/${icon}@2x.png`;

  // Determine font color based on time of day
  const textColor = timeOfDay === "afternoon" ? "#000" : "#FFF";

  return (
    <div>
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={styles.searchContainer}>
        <input
          type="text"
          placeholder="What City?"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>
          Search
        </button>
      </form>

      {/* Weather Card */}
      <div
        style={{
          ...styles.card,
          backgroundImage: `url(${backgroundPath})`,
          color: textColor, // Dynamically update text color
        }}
      >
        <div style={styles.header}>
          <h2 style={styles.city}>{weatherData.name}</h2>
          <p style={styles.date}>{formattedDate}</p>
        </div>
        <div style={styles.content}>
          <img src={weatherIconPath} alt={weatherMain} style={styles.icon} />
          <h1 style={styles.temp}>{Math.round(temp)}°C</h1>
          <p style={styles.description}>{description}</p>
        </div>
        <div style={styles.details}>
          <div style={styles.left}>
            <div style={styles.detailItem}>
              <p style={styles.value}>{Math.round(temp_max)}°C</p>
              <p style={styles.label}>Max</p>
            </div>
            <div style={styles.detailItem}>
              <p style={styles.value}>{speed} m/s</p>
              <p style={styles.label}>Wind Speed</p>
            </div>
          </div>
          <div style={styles.right}>
            <div style={styles.detailItem}>
              <p style={styles.value}>{Math.round(temp_min)}°C</p>
              <p style={styles.label}>Min</p>
            </div>
            <div style={styles.detailItem}>
              <p style={styles.value}>{pressure} hPa</p>
              <p style={styles.label}>Pressure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  searchContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "20px 0",
  },
  searchInput: {
    width: "250px",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "25px",
    border: "1px solid #ccc",
    marginRight: "10px",
  },
  searchButton: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "25px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  card: {
    width: "350px",
    height: "500px",
    margin: "20px auto",
    padding: "20px",
    borderRadius: "15px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0px 8px 15px rgba(0,0,0,0.2)",
    fontFamily: "'Arial', sans-serif",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    textAlign: "center",
  },
  city: {
    fontSize: "24px",
    margin: "0",
  },
  date: {
    fontSize: "14px",
    margin: "5px 0",
  },
  content: {
    textAlign: "center",
  },
  icon: {
    width: "80px",
    height: "80px",
  },
  temp: {
    fontSize: "48px",
    margin: "10px 0",
  },
  description: {
    fontSize: "16px",
    textTransform: "capitalize",
  },
  details: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  left: {
    textAlign: "left",
  },
  right: {
    textAlign: "right",
  },
  detailItem: {
    marginBottom: "10px",
  },
  value: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0",
  },
  label: {
    fontSize: "12px",
    margin: "0",
    opacity: "0.7",
  },
};

export default WeatherCard;
