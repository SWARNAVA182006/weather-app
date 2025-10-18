const apiKey = '42ade3d96d4ef53fc5f1311c5b858f07';
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherCard = document.getElementById('weatherCard');
const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const feels = document.getElementById('feels');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const errorMsg = document.getElementById('errorMsg');
const toggleUnit = document.getElementById('toggleUnit');
const forecast = document.getElementById('forecast');
const forecastContainer = document.getElementById('forecastContainer');
const hourlyForecast = document.getElementById('hourlyForecast');
const hourlyContainer = document.getElementById('hourlyContainer');
const themeToggle = document.getElementById('themeToggle');

let currentTempC = 0;
let currentFeelsC = 0;
let isCelsius = true;

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) return alert("Enter a city name");
    getWeather(city);
});

toggleUnit.addEventListener('click', () => {
    if (isCelsius) {
        temperature.textContent = `Temperature: ${(currentTempC * 9/5 + 32).toFixed(1)}°F`;
        feels.textContent = `Feels Like: ${(currentFeelsC * 9/5 + 32).toFixed(1)}°F`;
        isCelsius = false;
    } else {
        temperature.textContent = `Temperature: ${currentTempC.toFixed(1)}°C`;
        feels.textContent = `Feels Like: ${currentFeelsC.toFixed(1)}°C`;
        isCelsius = true;
    }
});

themeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark')) {
        document.body.classList.remove('dark');
        document.body.style.color = '#fff';
        themeToggle.textContent = '🌙';
    } else {
        document.body.classList.add('dark');
        document.body.style.color = '#000';
        themeToggle.textContent = '☀️';
    }
});

// Fetch current weather
async function getWeather(city) {
    try {
        const formattedCity = city.toLowerCase().split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(formattedCity)}&appid=${apiKey}&units=metric`);
        let data = await response.json();

        if (data.cod !== 200) {
            response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(formattedCity)},IN&appid=${apiKey}&units=metric`);
            data = await response.json();
        }

        if (data.cod !== 200) {
            errorMsg.textContent = "City not found!";
            errorMsg.classList.remove('hidden');
            weatherCard.classList.add('hidden');
            forecast.classList.add('hidden');
            hourlyForecast.classList.add('hidden');
            return;
        }

        errorMsg.classList.add('hidden');
        weatherCard.classList.remove('hidden');

        cityName.textContent = `${data.name}, ${data.sys.country}`;
        currentTempC = data.main.temp;
        currentFeelsC = data.main.feels_like;
        isCelsius = true;
        temperature.textContent = `Temperature: ${currentTempC.toFixed(1)}°C`;
        feels.textContent = `Feels Like: ${currentFeelsC.toFixed(1)}°C`;
        description.textContent = `Weather: ${data.weather[0].description}`;
        humidity.textContent = `Humidity: ${data.main.humidity}%`;
        wind.textContent = `Wind: ${data.wind.speed} m/s`;
        sunrise.textContent = `${new Date(data.sys.sunrise*1000).toLocaleTimeString()}`;
        sunset.textContent = `${new Date(data.sys.sunset*1000).toLocaleTimeString()}`;
        weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        // Dynamic background
        const mainWeather = data.weather[0].main.toLowerCase();
        if(mainWeather.includes("cloud")) document.body.style.background = "url('assets/backgrounds/cloudy.jpg') no-repeat center/cover";
        else if(mainWeather.includes("rain")) document.body.style.background = "url('assets/backgrounds/rainy.jpg') no-repeat center/cover";
        else document.body.style.background = "url('assets/backgrounds/clear_day.jpg') no-repeat center/cover";

        // Get forecast (7-day + hourly)
        getForecast(data.coord.lat, data.coord.lon);

    } catch(err) {
        alert("Error fetching weather data");
        console.error(err);
    }
}

// Fetch 7-day + hourly forecast
async function getForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`);
        const data = await response.json();

        // 7-day
        forecastContainer.innerHTML = "";
        forecast.classList.remove('hidden');
        data.daily.slice(0, 7).forEach(day => {
            const date = new Date(day.dt*1000);
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <p>${date.toLocaleDateString('en-US', {weekday: 'short'})}</p>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="icon">
                <p>${day.temp.day.toFixed(1)}°C</p>
                <p>${day.weather[0].main}</p>
            `;
            forecastContainer.appendChild(card);
        });

        // Hourly
        hourlyContainer.innerHTML = "";
        hourlyForecast.classList.remove('hidden');
        data.hourly.slice(0, 12).forEach(hour => {
            const date = new Date(hour.dt*1000);
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <p>${date.getHours()}:00</p>
                <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="icon">
                <p>${hour.temp.toFixed(1)}°C</p>
            `;
            hourlyContainer.appendChild(card);
        });

    } catch(err) {
        console.error(err);
    }
}
