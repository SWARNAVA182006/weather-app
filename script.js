const apiKey = '34407a88364f4a6293e220200251810';

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

    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(query)}&aqi=no`);
    const data = await res.json();

    if(data.error){
      showError(data.error.message);
      return;
    }

    cityNameEl.textContent = `${data.location.name}, ${data.location.country}`;
    temperature.textContent = `Temperature: ${data.current.temp_c.toFixed(1)}°C`;
    feelsEl.textContent = `Feels Like: ${data.current.feelslike_c.toFixed(1)}°C`;
    description.textContent = `Weather: ${capitalize(data.current.condition.text)}`;
    humidityEl.textContent = `Humidity: ${data.current.humidity}%`;
    windEl.textContent = `Wind: ${data.current.wind_kph} kph`;

    sunriseEl.textContent = `Sunrise: ${data.location.localtime.split(' ')[1]}`; // simplified
    sunsetEl.textContent = `Sunset: --`; // WeatherAPI current endpoint doesn't have sunset

    weatherIcon.src = data.current.condition.icon;
    weatherIcon.alt = data.current.condition.text;

    await setBackgroundWithWeatherAPI(data.current.condition.text, data.location.localtime);

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

async function setBackgroundWithWeatherAPI(condition, localtime){
  let file = 'day_sunny.jpeg'; // default
  const c = condition.toLowerCase();

  const hour = parseInt(localtime.split(' ')[1].split(':')[0]); // 24h format
  const isNight = hour < 6 || hour >= 18;

  if(c.includes('rain')) file = isNight ? 'night_rainy.jpeg' : 'day_rainy.jpeg';
  else if(c.includes('cloud')) file = isNight ? 'night_cloudy.jpeg' : 'day_cloudy.jpeg';
  else if(c.includes('mist') || c.includes('fog')) file = isNight ? 'night_mist.jpeg' : 'day_mist.jpeg';
  else if(c.includes('clear') || c.includes('sunny')) file = isNight ? 'night_clear.jpeg' : 'day_sunny.jpeg';

  await preloadImage(`assets/backgrounds/${file}`);
  document.body.style.backgroundImage = `url('assets/backgrounds/${file}')`;
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
}

function preloadImage(url){
  return new Promise(resolve => {
    const img = new Image();
    img.src = url;
    img.onload = resolve;
  });
}
