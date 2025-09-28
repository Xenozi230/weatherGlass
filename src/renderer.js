const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherResult = document.getElementById('weatherResult');
const historyList = document.getElementById('historyList');
const favoritesList = document.getElementById('favoritesList');

let history = [];
let favorites = [];


function fakeWeatherAPI(city) {
    const temp = Math.floor(Math.random() * 30);
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Snowy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    return `${city}: ${temp}°C, ${condition}`;
}


function addHistory(city) {
    if (!history.includes(city)) {
        history.unshift(city);
        if (history.length > 5) history.pop();
        renderHistory();
    }
}
function renderHistory() {
    historyList.innerHTML = history
        .map(city => `<li onclick="showWeather('${city}')">${city}</li>`)
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
        .map(city => `<li onclick="showWeather('${city}')">${city}</li>`)
        .join('');
}


function showWeather(city) {
    const info = fakeWeatherAPI(city);
    const [cityName, details] = info.split(': ');
    const [temp, condition] = details.split(', ');
    wheatherResult.innerHTML = `
        <div class="weather-card glass">
            <h2 class="city-name">${cityName}</h2>
            <div class="temp">${temp}</div>
            <div class="condition">${condition}</div>
            <button onclick="addFavorite('${cityName}')">⭐ Add to favorites</button>
        </div>
    `;
    addHistory(city);
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    console.log("Search clicked with:", city);
    if (city) showWeather(city);
});

window.showWeather = showWeather;
window.addFavorite = addFavorite;