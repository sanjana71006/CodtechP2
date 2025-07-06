document.addEventListener('DOMContentLoaded', function() {
    // Background images (replace with your own images)
    // Replace with your 10 background images
     const backgroundImages = [
    'https://images.unsplash.com/photo-1469122312224-c5846569feb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1476673160081-cf065607f449?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1516912481808-3406841bd33c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1517638851339-a711cfcf3279?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'
];
    
    // Initialize background slider
    initBackgroundSlider(backgroundImages);
    
    // Weather API configuration
    const apiKey = ''; // Replace with your API key
    let currentCity = '';
    
    // DOM elements
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');
    const cityName = document.getElementById('city-name');
    const todayHigh = document.getElementById('today-high');
    const todayLow = document.getElementById('today-low');
    const forecastDays = document.querySelectorAll('.forecast-day');
    
    // Event listeners
    searchBtn.addEventListener('click', searchWeather);
    locationBtn.addEventListener('click', getLocationWeather);
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });
    
    // Initialize with default city
    fetchWeather('London');
    
    // Functions
    function initBackgroundSlider(images) {
        const slider = document.querySelector('.background-slider');
        
        images.forEach((img, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = img;
            imgElement.alt = `Background ${index + 1}`;
            if (index === 0) imgElement.classList.add('active');
            slider.appendChild(imgElement);
        });
        
        let currentIndex = 0;
        setInterval(() => {
            const images = document.querySelectorAll('.background-slider img');
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }, 5000);
    }
    
    function searchWeather() {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    }
    
    function getLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetchWeatherByCoords(lat, lon);
                },
                error => {
                    alert('Unable to retrieve your location. Please enable location services or search by city name.');
                    console.error(error);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser. Please search by city name.');
        }
    }
    
    function fetchWeather(city) {
        currentCity = city;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('City not found');
                }
                return response.json();
            })
            .then(data => {
                updateCurrentWeather(data);
                return fetchForecast(data.coord.lat, data.coord.lon);
            })
            .catch(error => {
                alert(error.message);
                console.error('Error fetching weather data:', error);
            });
    }
    
    function fetchWeatherByCoords(lat, lon) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                updateCurrentWeather(data);
                return fetchForecast(lat, lon);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }
    
    function fetchForecast(lat, lon) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                updateForecast(data);
            })
            .catch(error => {
                console.error('Error fetching forecast data:', error);
            });
    }
    
    function updateCurrentWeather(data) {
        cityName.textContent = `${data.name}, ${data.sys.country}`;
        todayHigh.textContent = `${Math.round(data.main.temp_max)}°C`;
        todayLow.textContent = `${Math.round(data.main.temp_min)}°C`;
        cityInput.value = '';
    }
    
    function updateForecast(data) {
        // Group forecast by day
        const dailyForecast = {};
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayName = daysOfWeek[date.getDay()];
            
            if (!dailyForecast[dayName]) {
                dailyForecast[dayName] = {
                    high: item.main.temp_max,
                    low: item.main.temp_min
                };
            } else {
                if (item.main.temp_max > dailyForecast[dayName].high) {
                    dailyForecast[dayName].high = item.main.temp_max;
                }
                if (item.main.temp_min < dailyForecast[dayName].low) {
                    dailyForecast[dayName].low = item.main.temp_min;
                }
            }
        });
        
        // Update forecast display (skip today)
        const today = new Date();
        const todayName = daysOfWeek[today.getDay()];
        const forecastDaysArray = Object.keys(dailyForecast).filter(day => day !== todayName).slice(0, 5);
        
        forecastDays.forEach((dayElement, index) => {
            if (index < forecastDaysArray.length) {
                const dayName = forecastDaysArray[index];
                const temps = dailyForecast[dayName];
                
                dayElement.querySelector('h3').textContent = dayName;
                dayElement.querySelector('.high-temp').textContent = `${Math.round(temps.high)}°C`;
                dayElement.querySelector('.low-temp').textContent = `${Math.round(temps.low)}°C`;
            }
        });
    }
});