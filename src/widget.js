window.electronAPI.onSetWeather((event, data) => {
    document.getElementById('cityName').textContent = `${data.name}, ${data.country}`;
    document.getElementById('temperature').textContent = `${data.temperature}°C`;
    document.getElementById('condition').textContent = data.condition;
    document.getElementById('wind').textContent = `Wind: ${data.windspeed} km/h`;
});
