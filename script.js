const apiKey = 'YOUR_API_KEY'; 
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weatherIcon');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if(city === "") return alert("Please enter a city name");
    getWeather(city);
});

async function getWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();

        if(data.cod !== 200) {
            alert("City not found!");
            return;
        }

        cityName.textContent = data.name + ", " + data.sys.country;
        temperature.textContent = `Temperature: ${data.main.temp}°C`;
        description.textContent = `Weather: ${data.weather[0].description}`;
        weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        weatherResult.classList.remove('hidden');
    } catch (error) {
        alert("Error fetching weather data");
    }
}
