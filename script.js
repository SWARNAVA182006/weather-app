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

let currentTempC = 0;
let currentFeelsC = 0;
let isCelsius = true;

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) return alert("Enter city name");
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

async function getWeather(city) {
    try {
        const formattedCity = city.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(formattedCity)}&appid=${apiKey}&units=metric`);
        let data = await response.json();

        if(data.cod !== 200){
            response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(formattedCity)},IN&appid=${apiKey}&units=metric`);
            data = await response.json();
        }

        if(data.cod !== 200){
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
        sunrise.textContent = new Date((data.sys.sunrise + data.timezone) * 1000).toUTCString().slice(-12,-4);
        sunset.textContent = new Date((data.sys.sunset + data.timezone) * 1000).toUTCString().slice(-12,-4);
        weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        setBackground(data.weather[0].main.toLowerCase(), data.sys.sunrise, data.sys.sunset, data.timezone);
        getForecast(data.coord.lat, data.coord.lon);

    } catch(err) {
        alert("Error fetching weather data");
        console.error(err);
    }
}

function setBackground(weatherMain, sunriseUnix, sunsetUnix, timezoneOffset){
    const nowUTC = Math.floor(Date.now()/1000);
    const localTime = nowUTC + timezoneOffset;
    const isNight = (localTime >= sunsetUnix || localTime < sunriseUnix);

    let bgFile = "day_sunny.jpeg"; // default

    if(isNight){
        if(weatherMain.includes("cloud")) bgFile="night_cloudy.jpeg";
        else if(weatherMain.includes("rain") || weatherMain.includes("drizzle")) bgFile="night_rainy.jpeg";
        else if(weatherMain.includes("mist") || weatherMain.includes("fog")) bgFile="night_mist.jpeg";
        else bgFile="night_clear.jpeg";
    } else {
        if(weatherMain.includes("cloud")) bgFile="day_cloudy.jpeg";
        else if(weatherMain.includes("rain") || weatherMain.includes("drizzle")) bgFile="day_rainy.jpeg";
        else if(weatherMain.includes("mist") || weatherMain.includes("fog")) bgFile="day_mist.jpeg";
        else bgFile="day_sunny.jpeg";
    }

    document.body.style.backgroundImage = `url('assets/backgrounds/${bgFile}')`;
}
