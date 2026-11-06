// Get weather information for a city or country
export async function getWeather(place) {
    try {
        // Search for the location
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            return "Sorry, I couldn't find that location.";
        }

        const location = geoData.results[0];

        const { latitude, longitude, name, country } = location;

        // Fetch current weather
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        );

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;

        // Weather condition codes
        const weatherConditions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Heavy drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snowfall",
            73: "Moderate snowfall",
            75: "Heavy snowfall",
            80: "Rain showers",
            81: "Moderate rain showers",
            82: "Heavy rain showers",
            95: "Thunderstorm"
        };

        const condition =
            weatherConditions[current.weather_code] || "Unknown conditions";

        return `The current weather in ${name}, ${country} is ${condition}. 
        The temperature is ${current.temperature_2m} degrees Celsius.
        It feels like ${current.apparent_temperature} degrees.
        Humidity is ${current.relative_humidity_2m} percent.
        Wind speed is ${current.wind_speed_10m} kilometers per hour.`;

    } catch (error) {
        console.error("Weather error:", error);
        return "Sorry, I couldn't get the weather right now.";
    }
}
