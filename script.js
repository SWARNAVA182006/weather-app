const apiKey = '2ecae6763c9bcb92dd08c37f165b10ba';

const searchBtn = document.getElementById('searchBtn');
const cityInput  = document.getElementById('cityInput');
const errorMsg   = document.getElementById('errorMsg');

const weatherCard = document.getElementById('weatherCard');
const cityNameEl  = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const feelsEl     = document.getElementById('feels');
const description = document.getElementById('description');
const humidityEl  = document.getElementById('humidity');
const windEl      = document.getElementById('wind');
const sunriseEl   = document.getElementById('sunrise');
const sunsetEl    = document.getElementById('sunset');
const toggleUnit  = document.getElementById('toggleUnit');
const logoEl      = document.getElementById('logo');

const forecastSection = document.getElementById('forecast');
const forecastContainer = document.getElementById('forecastContainer');
const hourlySection = document.getElementById('hourlyForecast');
const hourlyContainer = document.getElementById('hourlyContainer');

let currentTempC = null;
let currentFeelsC = null;
let isCelsius = true;

cityInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') searchBtn.click(); });

searchBtn.addEventListener('click', () => {
  const q = cityInput.value.trim();
  if(!q) return showError('Please enter a city name.');
  getWeather(q);
});

function showError(msg){
  errorMsg.textContent = msg;
  errorMsg.classList.remove('d-none');
  setTimeout(()=> errorMsg.classList.add('d-none'), 5000);
}
function clearError(){ errorMsg.classList.add('d-none'); }

toggleUnit.addEventListener('click', () => {
  if(currentTempC === null) return;
  if(isCelsius){
    temperature.textContent = `Temperature: ${(currentTempC * 9/5 + 32).toFixed(1)}°F`;
    feelsEl.textContent = `Feels Like: ${(currentFeelsC * 9/5 + 32).toFixed(1)}°F`;
    isCelsius = false;
  } else {
    temperature.textContent = `Temperature: ${currentTempC.toFixed(1)}°C`;
    feelsEl.textContent = `Feels Like: ${currentFeelsC.toFixed(1)}°C`;
    isCelsius = true;
  }
});

async function getWeather(query){
  searchBtn.disabled = true;
  searchBtn.textContent = 'Loading...';
  try {
    clearError();
    let res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${apiKey}&units=metric`);
    let data = await res.json();

    if(data.cod && Number(data.cod) !== 200){
      res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)},IN&appid=${apiKey}&units=metric`);
      data = await res.json();
    }

    if(data.cod && Number(data.cod) !== 200){
      showError('City not found. Try another name.');
      return;
    }

    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    currentTempC = data.main.temp;
    currentFeelsC = data.main.feels_like;
    isCelsius = true;
    temperature.textContent = `Temperature: ${currentTempC.toFixed(1)}°C`;
    feelsEl.textContent = `Feels Like: ${currentFeelsC.toFixed(1)}°C`;
    description.textContent = `Weather: ${capitalize(data.weather[0].description)}`;
    humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
    windEl.textContent = `Wind: ${data.wind.speed} m/s`;

    const tz = data.timezone;
    sunriseEl.textContent = formatTimeLocal(data.sys.sunrise + tz);
    sunsetEl.textContent  = formatTimeLocal(data.sys.sunset + tz);

    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description || 'weather';

    setBackgroundFast(data.weather[0].main.toLowerCase(), data.sys.sunrise, data.sys.sunset, tz);
    logoEl.style.display = 'block';
    await getForecast(data.coord.lat, data.coord.lon);
    weatherCard.classList.remove('d-none');

  } catch(err){
    console.error(err);
    showError('Network or API error. See console.');
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';
  }
}

async function getForecast(lat, lon){
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`);
    const data = await res.json();

    forecastContainer.innerHTML = '';
    forecastSection.classList.remove('d-none');
    (data.daily || []).slice(0,7).forEach(d => {
      const date = new Date(d.dt * 1000);
      const day = date.toLocaleDateString('en-US',{weekday:'short'});
      const card = document.createElement('div');
      card.className = 'forecast-card';
      card.innerHTML = `
        <div class="fw-semibold">${day}</div>
        <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png" alt="${d.weather[0].description}" style="width:56px;height:56px">
        <div class="mt-1">${d.temp.day.toFixed(1)}°C</div>
        <div class="text-capitalize" style="opacity:.9">${d.weather[0].main}</div>
      `;
      forecastContainer.appendChild(card);
    });

    hourlyContainer.innerHTML = '';
    hourlySection.classList.remove('d-none');
    (data.hourly || []).slice(0,12).forEach(h => {
      const date = new Date(h.dt * 1000);
      const hh = date.getHours();
      const card = document.createElement('div');
      card.className = 'hour-card';
      card.innerHTML = `
        <div class="fw-semibold">${hh}:00</div>
        <img src="https://openweathermap.org/img/wn/${h.weather[0].icon}@2x.png" alt="${h.weather[0].description}" style="width:48px;height:48px">
        <div class="mt-1">${h.temp.toFixed(1)}°C</div>
      `;
      hourlyContainer.appendChild(card);
    });

  } catch(err){
    console.error('Forecast error', err);
    showError('Forecast load failed.');
  }
}

function setBackgroundFast(weatherMain, sunriseUTC, sunsetUTC, timezoneOffset){
  try {
    const nowUTC = Math.floor(Date.now() / 1000);
    const localNow = nowUTC + timezoneOffset;
    const sunriseLocal = sunriseUTC + timezoneOffset;
    const sunsetLocal  = sunsetUTC + timezoneOffset;
    const isNight = (localNow >= sunsetLocal || localNow < sunriseLocal);

    let category = 'sunny';
    if(/cloud|overcast/.test(weatherMain)) category = 'cloud';
    else if(/rain|drizzle|thunderstorm/.test(weatherMain)) category = 'rain';
    else if(/mist|fog|haze|smoke|dust|ash/.test(weatherMain)) category = 'mist';
    else if(/snow/.test(weatherMain)) category = 'rain';

    let file = 'day_sunny.jpeg';
    if(isNight){
      if(category === 'cloud') file = 'night_cloudy.jpeg';
      else if(category === 'rain') file = 'night_rainy.jpeg';
      else if(category === 'mist') file = 'night_mist.jpeg';
      else file = 'night_clear.jpeg';
    } else {
      if(category === 'cloud') file = 'day_cloudy.jpeg';
      else if(category === 'rain') file = 'day_rainy.jpeg';
      else if(category === 'mist') file = 'day_mist.jpeg';
      else file = 'day_sunny.jpeg';
    }

    const path = `assets/backgrounds/${file}`;
    const img = new Image();
    img.src = path;

    document.body.style.backgroundImage = `url('${path}')`;
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  } catch(err){
    console.error('Background set failed', err);
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = 'skyblue';
  }
}

function capitalize(s){ if(!s) return ''; return s[0].toUpperCase() + s.slice(1); }

function formatTimeLocal(unixLocalSeconds){
  const d = new Date(unixLocalSeconds * 1000);
  const hh = String(d.getUTCHours()).padStart(2,'0');
  const mm = String(d.getUTCMinutes()).padStart(2,'0');
  const ss = String(d.getUTCSeconds()).padStart(2,'0');
  return `${hh}:${mm}:${ss}`;
}
