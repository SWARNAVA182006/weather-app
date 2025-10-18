const apiKey = '2ecae6763c9bcb92dd08c37f165b10ba';

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const errorMsg = document.getElementById('error-msg');

const cityNameEl = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const feelsEl = document.getElementById('feels-like');
const description = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const weatherIcon = document.getElementById('weather-icon');
const weatherCard = document.querySelector('.weather-card');

searchBtn.addEventListener('click', () => {
  const query = cityInput.value.trim();
  if(query) getWeather(query);
});

cityInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter'){
    const query = cityInput.value.trim();
    if(query) getWeather(query);
  }
});

async function getWeather(query){
  try {
    searchBtn.disabled = true;
    searchBtn.textContent = 'Loading...';
    clearError();

    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${apiKey}&units=metric`);
    const data = await res.json();

    if(data.cod && data.cod != 200){
      showError(data.message);
      return;
    }

    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `Temperature: ${data.main.temp.toFixed(1)}°C`;
    feelsEl.textContent = `Feels Like: ${data.main.feels_like.toFixed(1)}°C`;
    description.textContent = `Weather: ${capitalize(data.weather[0].description)}`;
    humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
    windEl.textContent = `Wind: ${data.wind.speed} m/s`;

    sunriseEl.textContent = `Sunrise: ${new Date(data.sys.sunrise*1000).toLocaleTimeString()}`;
    sunsetEl.textContent = `Sunset: ${new Date(data.sys.sunset*1000).toLocaleTimeString()}`;

    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;

    // Correct background logic
    setBackground(data);

    weatherCard.classList.remove('d-none');

  } catch(err){
    console.error(err);
    showError('Network or API error. Check your key or internet.');
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';
  }
}

function capitalize(str){
  return str.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

function showError(msg){
  errorMsg.textContent = msg;
}

function clearError(){
  errorMsg.textContent = '';
}

// Day/night + weather background logic
function setBackground(data){
  const timezoneOffset = data.timezone; // seconds
  const dtUTC = data.dt; // seconds
  const localTime = new Date((dtUTC + timezoneOffset) * 1000);
  const hour = localTime.getUTCHours();
  const isNight = hour < 6 || hour >= 18;

  const condition = data.weather[0].main.toLowerCase();
  let file = 'day_sunny.jpeg'; // default

  if(condition.includes('rain')) file = isNight ? 'night_rainy.jpeg' : 'day_rainy.jpeg';
  else if(condition.includes('cloud')) file = isNight ? 'night_cloudy.jpeg' : 'day_cloudy.jpeg';
  else if(condition.includes('mist') || condition.includes('fog')) file = isNight ? 'night_mist.jpeg' : 'day_mist.jpeg';
  else if(condition.includes('clear') || condition.includes('sun')) file = isNight ? 'night_clear.jpeg' : 'day_sunny.jpeg';

  document.body.style.backgroundImage = `url('assets/backgrounds/${file}')`;
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
}
