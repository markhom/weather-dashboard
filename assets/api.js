// API key
const apiKey = '204d347ec4c6ab25e6390230d6ba1dba';

// Function to fetch current weather and 5-day forecast data from OpenWeatherMap API
async function fetchWeatherData(city, apiKey) {
    // Base URLs for current weather and 5-day forecast
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;

    try {
        // Fetch current weather data
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        const currentWeatherData = await currentWeatherResponse.json();

        // Fetch 5-day forecast data
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        // Check if responses were successful
        if (currentWeatherResponse.ok && forecastResponse.ok) {
            // Display current weather data
            displayCurrentWeather(currentWeatherData);
            // Display 5-day forecast data
            displayForecast(forecastData);

            // Save the last searched city and update previous searches
            saveAndDisplaySearch(city);
        } else {
            // Display error message if any request fails
            console.error('Error fetching weather data:', currentWeatherData.message);
            displayError('Failed to fetch weather data.');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayError('Error fetching data');
    }
}

// Function to display current weather data
function displayCurrentWeather(data) {
    // Update elements in the HTML for current weather
    const currentWeatherSection = document.querySelector('.current-weather');
    
    // Clear previous data if any
    currentWeatherSection.innerHTML = '';

    // Add city name, temperature, weather description, and humidity
    const cityName = document.createElement('h3');
    cityName.textContent = `City: ${data.name}`;
    currentWeatherSection.appendChild(cityName);

    const temperature = document.createElement('p');
    temperature.textContent = `Temperature: ${data.main.temp}°F`;
    currentWeatherSection.appendChild(temperature);

    const weatherDescription = document.createElement('p');
    weatherDescription.textContent = `Weather: ${data.weather[0].description}`;
    currentWeatherSection.appendChild(weatherDescription);

    const humidity = document.createElement('p');
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    currentWeatherSection.appendChild(humidity);
}

// Function to display 5-day forecast data
function displayForecast(data) {
    // Get all forecast day containers
    const forecastDays = document.querySelectorAll('.forecast-day');
    
    // Clear previous forecast data
    forecastDays.forEach(day => day.innerHTML = '');

    // Filter the forecast data for the 5 days (API returns data every 3 hours)
    const filteredForecast = [];
    for (let i = 0; i < data.list.length; i += 8) {
        filteredForecast.push(data.list[i]);
    }

    // Display forecast data in respective forecast day containers
    forecastDays.forEach((day, index) => {
        const forecastData = filteredForecast[index];
        if (forecastData) {
            const date = new Date(forecastData.dt * 1000).toLocaleDateString();
            const weatherDescription = forecastData.weather[0].description;
            const temperature = forecastData.main.temp;

            // Update forecast day container
            const dateElement = document.createElement('h3');
            dateElement.textContent = date;
            day.appendChild(dateElement);

            const weatherDescriptionElement = document.createElement('p');
            weatherDescriptionElement.textContent = `Weather: ${weatherDescription}`;
            day.appendChild(weatherDescriptionElement);

            const temperatureElement = document.createElement('p');
            temperatureElement.textContent = `Temperature: ${temperature}°F`;
            day.appendChild(temperatureElement);
        }
    });
}

// Function to display an error message
function displayError(message) {
    const currentWeatherSection = document.querySelector('.current-weather');
    currentWeatherSection.innerHTML = `<p class="error">Error: ${message}</p>`;
}

// Function to save and display previous searches in local storage
function saveAndDisplaySearch(city) {
    // Retrieve previous searches from local storage or create an empty array
    let previousSearches = JSON.parse(localStorage.getItem('previousSearches')) || [];
    
    // Add the new city to the array, and keep the list unique
    if (!previousSearches.includes(city)) {
        previousSearches.push(city);
    }
    
    // Save the updated array to local storage
    localStorage.setItem('previousSearches', JSON.stringify(previousSearches));
    
    // Display the updated list of previous searches
    displayPreviousSearches(previousSearches);
}

// Function to display previous searches from local storage
function displayPreviousSearches(previousSearches) {
    // Get the container for the previous searches list
    const previousSearchesList = document.getElementById('previous-searches-list');
    
    // Clear the current list
    previousSearchesList.innerHTML = '';
    
    // Add each search as a list item
    previousSearches.forEach(city => {
        const listItem = document.createElement('li');
        listItem.textContent = city;
        
        // Add an event listener to each list item
        listItem.addEventListener('click', function() {
            // Fetch weather data for the clicked city
            fetchWeatherData(city, apiKey);
        });
        
        previousSearchesList.appendChild(listItem);
    });
}

// Function to handle the search button click event
function handleSearch() {
    // Get the city name from the input
    const cityInput = document.getElementById('city-search');
    const cityName = cityInput.value.trim();

    // If city name is not empty, fetch the weather data
    if (cityName) {
        fetchWeatherData(cityName, apiKey);
    } else {
        displayError('Please enter a city name.');
    }
}

// Function to load the last searched city and fetch weather data
function loadLastSearchedCity() {
    // Get the last searched city from local storage
    const previousSearches = JSON.parse(localStorage.getItem('previousSearches')) || [];
    
    // If there is at least one previous search, load the last one
    if (previousSearches.length > 0) {
        const lastSearchedCity = previousSearches[previousSearches.length - 1];
        fetchWeatherData(lastSearchedCity, apiKey);
    }

    // Display the previous searches list
    displayPreviousSearches(previousSearches);
}

// Attach an event listener to the search button
document.getElementById('get-weather-button').addEventListener('click', handleSearch);

// Load the last searched city and display previous searches when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadLastSearchedCity();
});