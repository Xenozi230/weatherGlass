const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherResult = document.getElementById('wheatherResult');
const historyList = document.getElementById('historyList');
const favoritesList = document.getElementById('favoritesList');

let history = [];
let favorites = [];

const weatherConditions = {
    0: "☀️ Clear",
    1: "🌤️ Mainly clear",
    2: "⛅ Partly cloudy",
    3: "☁️ Overcast",
    45: "🌫️ Fog",
    48: "🌫️ Depositing rime fog",
    51: "🌦️ Light drizzle",
    61: "🌧️ Light rain",
    71: "❄️ Light snow",
    95: "⛈️ Thunderstorm",
}

//------------------------------------------
// Add city to history and favorites
//------------------------------------------
function addHistory(city) {
    if (!history.includes(city)) {
        history.unshift(city);
        if (history.length > 5) history.pop();
        renderHistory();
    }
}
function renderHistory() {
    historyList.innerHTML = history
        .map(city => `<li onclick="fetchWeather('${city}')">${city}</li>`)
        .join('');
}

function addFavorite(city) {
    if (!favorites.includes(city)) {
        favorites.push(city);
        renderFavorites();
    }
}
function renderFavorites() {
    favoritesList.innerHTML = favorites
        .map(city => `<li onclick="fetchWeather('${city}')">${city}</li>`)
        .join('');
}

//------------------------------------------
// Open a widget window for the city
//------------------------------------------
function openWidget(cityData) {
    window.electronAPI.openWidget(cityData);
}

//------------------------------------------
// Fetch weather data (open-Meteo API)
//------------------------------------------
async function fetchWeather(city) {
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            weatherResult.innerHTML = `<p>City not found</p>`;
            return ;
        }
        const { latitude, longitude, name, country } = geoData.results[0];

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();
        const { temperature, weathercode, windspeed } = weatherData.current_weather;

        const condition = weatherConditions[weathercode] || "Unknown";
        weatherResult.innerHTML = `
            <div class="weather-card">
                <div class="city-name">${name}, ${country}</div>
                <div class="temp">${temperature}°C</div>
                <div class="condition">${condition}</div>
                <div class="wind">Wind: ${windspeed} km/h</div>
                <button onclick="addFavorite('${city}')">⭐ Add to favorites</button>
                <button onclick="openWidget({name: '${name}', country: '${country}', temperature: ${temperature}, condition: '${condition}', windspeed: ${windspeed}})">➕ Open Widget</button>
            </div>
        `;
        addHistory(city);

        

    } catch (error) {
        console.error("Error fetching weather data:", error);
        weatherResult.innerHTML = `<p>Error fetching weather data</p>`;
    }
    
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    console.log("Search clicked with:", city);
    if (city) fetchWeather(city);
});

window.openWidget = openWidget;
window.fetchWeather = fetchWeather;
window.addFavorite = addFavorite;