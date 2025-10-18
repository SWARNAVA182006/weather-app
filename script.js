const apiKey = '42ade3d96d4ef53fc5f1311c5b858f07'; // Your OpenWeatherMap API Key

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
const errorMsg = document.getElementById('errorMsg');
const toggleUnit = document.getElementById('toggleUnit');

let currentTempC = 0;
let currentFeelsC = 0;
let isCelsius = true;

// Event listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) return alert("Enter a city name");
  getWeather(city);
});

// Toggle °C / °F
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

// Fetch weather data
async function getWeather(city) {
  try {
    // Make city name case-insensitive
    const formattedCity = city.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(formattedCity)}&appid=${apiKey}&units=metric`
    );

    const data = await response.json();

    if (data.cod !== 200) {
      errorMsg.textContent = "City not found!";
      errorMsg.classList.remove('hidden');
      weatherCard.classList.add('hidden');
      return;
    }

    // Hide error and show card
    errorMsg.classList.add('hidden');
    weatherCard.classList.remove('hidden');

    // Populate data
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentTempC = data.main.temp;
    currentFeelsC = data.main.feels_like;
    isCelsius = true;

    temperature.textContent = `Temperature: ${currentTempC.toFixed(1)}°C`;
    feels.textContent = `Feels Like: ${currentFeelsC.toFixed(1)}°C`;
    description.textContent = `Weather: ${data.weather[0].description}`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    wind.textContent = `Wind: ${data.wind.speed} m/s`;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Dynamic background
    const mainWeather = data.weather[0].main.toLowerCase();
    if(mainWeather.includes("cloud")) document.body.style.background = "linear-gradient(to right, #757f9a, #d7dde8)";
    else if(mainWeather.includes("rain")) document.body.style.background = "linear-gradient(to right, #4e54c8, #8f94fb)";
    else if(mainWeather.includes("clear")) document.body.style.background = "linear-gradient(to right, #f6d365, #fda085)";
    else if(mainWeather.includes("snow")) document.body.style.background = "linear-gradient(to right, #83a4d4, #b6fbff)";
    else document.body.style.background = "linear-gradient(to right, #6dd5ed, #2193b0)";
  } catch (err) {
    alert("Error fetching weather data");
    console.error(err);
  }
}
