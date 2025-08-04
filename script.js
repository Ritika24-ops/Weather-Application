// API key for OpenWeatherMap - Replace with your own API key
const API_KEY = 'b36e8f3f8b128bad44fc6a92d1f75360';
const apiurl= 'https://api.openweathermap.org/data/2.5/weather?q=tokyo&appid=b36e8f3f8b128bad44fc6a92d1f75360';
// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const dateTime = document.getElementById('date-time')
const currentTemp = document.getElementById('current-temp');
const weatherIcon = document.getElementById('weather-icon');
const weatherDesc = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const forecastContainer = document.getElementById('forecast-container');

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

locationBtn.addEventListener('click', getLocationWeather);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// Initialize with default city
getWeatherData('London');

// Functions
async function getWeatherData(city) {
    try {
        // Fetch current weather
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        if (!currentWeatherResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(currentWeatherData);
        displayForecast(forecastData);
        
    } catch (error) {
        alert(error.message);
        console.error('Error fetching weather data:', error);
    }
}

function displayCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentTemp.textContent = Math.round(data.main.temp);
    weatherDesc.textContent = data.weather[0].description;
    humidity.textContent = data.main.humidity;
    wind.textContent = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    
    const iconCode = data.weather[0].icon;
    weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${data.weather[0].description}">`;
}

function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    // We get data for every 3 hours, so we need to filter to get one entry per day
    const dailyForecasts = [];
    const daysAdded = new Set();
    
    for (const forecast of data.list) {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Only add one forecast per day (around noon)
        if (!daysAdded.has(day)) {
            daysAdded.add(day);
            dailyForecasts.push({
                day,
                temp_max: forecast.main.temp_max,
                temp_min: forecast.main.temp_min,
                icon: forecast.weather[0].icon,
                description: forecast.weather[0].description
            });
            
            if (dailyForecasts.length === 5) break;
        }
    }
    
    dailyForecasts.forEach(forecast => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        
        forecastCard.innerHTML = `
            <div class="forecast-day">${forecast.day}</div>
            <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${forecast.icon}.png" alt="${forecast.description}">
            </div>
            <div class="forecast-temp">
                <span class="max-temp">${Math.round(forecast.temp_max)}°</span>
                <span class="min-temp">${Math.round(forecast.temp_min)}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Fetch current weather by coordinates
                    const currentWeatherResponse = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
                    );
                    
                    const currentWeatherData = await currentWeatherResponse.json();
                    
                    // Fetch forecast by coordinates
                    const forecastResponse = await fetch(
                        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
                    );
                

                    const forecastData = await forecastResponse.json();
                    
                    displayCurrentWeather(currentWeatherData);
                    displayForecast(forecastData);
                    cityInput.value = '';
                } catch (error) {
                    alert('Error fetching weather data for your location');
                    console.error('Error:', error);
                }
            },
            (error) => {
                alert('Unable to retrieve your location. Please enable location services.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}