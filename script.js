//API Key and Base URL
const API_KEY ='af02f5d4e836499494c73235261206';
const BASE_URL = 'https://api.weatherapi.com/v1';

//Search ELements
const searchInput = document.querySelector('.search-section__input');
const searchButton = document.querySelector('.search-button');

//Weathercard Elements
const cityName = document.querySelector('.weather-card__left h2');
const weatherDate = document.querySelector('.weather-card__left p');
const weatherIcon = document.querySelector('.weather-card__right img');
const weatherTemp = document.querySelector('.tp');

//Metric Elements
const feelsLikeValue = document.querySelector('#feels-like');
const humidityValue = document.querySelector('#humidity');
const windValue = document.querySelector('#wind');
const precipitationValue = document.querySelector('#precipitation');

//Daily  Forecast Elements
const dailyForecastContainer = document.querySelector('.forecast-container');

//Hourly Forecast Elements
const hourlyForecastContainer = document.querySelector('.hourly-forecast-container');

//dropdown inside button
const dropDownButton = document.querySelector(".hourly-forecast__btn");
const dropDownMenu = document.querySelector('.dropdown-menu');

//suggestion List
const searchSuggestion = document.querySelector('.search-suggestion');

let debounceTimer;





//search button event listener
searchButton.addEventListener('click', async function(){
    const city= searchInput.value.trim();
    if(city ===''){
        alert('Please enter a city name');
        return;
    }
    
    await getWeather(city)
});
//search input event listner 
searchInput.addEventListener('input', function(event){
    clearTimeout(debounceTimer);
    const city = searchInput.value.trim();
    if (city < 3){
        searchSuggestion.classList.remove('active');
        return;
    }
    debounceTimer = setTimeout(function(){
        fetchCitySuggestions(city);
    }, 400)
     
});

//search input listner whenenter is clicked on the keybard
searchInput.addEventListener('keypress', function(event){
    if(event.key === 'Enter'){
        searchButton.click();
    }
});


//Dropdown event listner  to toggle dropdown icon 
dropDownButton.addEventListener('click', function(){
    //ensures that when the dropdown menu icon is clicked once it opens and when clicked again it closes
    dropDownMenu.classList.toggle('active');
    dropDownButton.classList.toggle('dropdown-open')
})



//function  to fetch weeather data
async function getWeather(city){
    try{
        const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=no&alerts=no`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error){
            throw new Error(data.error.message);
        }
        updateCurrentWeather(data);
        updateMetrics(data);
        updateDailyForecast(data);
        updateHourlyForecast(data.forecast.forecastday[0].hour);
        populateDropDown(data);
    }    
    catch(error){
        console.error('Error fetching weather data:', error);
    }
}


//update weathercard
function updateCurrentWeather(data){
    cityName.textContent= `${data.location.name}, ${data.location.country}`;
    weatherDate.textContent = data.location.localtime
    weatherIcon.src =data.current.condition.icon;
    weatherTemp.textContent =`${data.current.temp_c}°`;
}
//update weather metrics based on weaather card
function updateMetrics(data){
    feelsLikeValue.textContent= `${data.current.feelslike_c}°`;
    humidityValue.textContent =`${data.current.humidity} %`;
    windValue.textContent = `${data.current.wind_mph} mph`;
    precipitationValue.textContent = `${data.current.precip_in} in`;
}
//update daily  forecast data values
function updateDailyForecast(data){
    //clear all dummy data
    dailyForecastContainer.innerHTML= '';
    //loop through each forecas data and insert updated value
    data.forecast.forecastday.forEach(function(day) {
        const card = document.createElement('div');
        card.className = 'forecast-container__cards'
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', {weekday:'short'});
        card.innerHTML = `
        <p class = "day">${dayName}</p>
        <img src ="${day.day.condition.icon}" alt ="${day.day.condition.text}">
        <div class="temp-range">
            <p class ="high">${day.day.maxtemp_c}°</p>
            <p class ="low">${day.day.mintemp_c}°</p>
            </div>`;
    dailyForecastContainer.appendChild(card);
    });
}
//update hourly forecast data values
function updateHourlyForecast(hours){
    //clear all dummy data
    hourlyForecastContainer.innerHTML = ''
    hours.slice(0,8).forEach(function(hour){
    const card = document.createElement('div');
    card.classList.add('hourly-forecast__cards');
    const time = new Date(hour.time);
    const formattedTime = time.toLocaleTimeString(
        'en-US', {
            hour: 'numeric',
            hour12: true
        }

    );
    card.innerHTML =`
    <div class =icon-time>
        <img src="${hour.condition.icon}" alt="${hour.condition.text}"
        <p>${formattedTime} </div>
        <p class="temp"> ${hour.temp_c}°</p>`;
    hourlyForecastContainer.appendChild(card);
    })
}

//populate Dropdown
function populateDropDown(data){
    //clear all existing Data
    dropDownMenu.innerHTML = '';
    //
    data.forecast.forecastday.forEach(function(day,index){
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString(
            'en-US',
            {
                weekday: 'long'
            }
        );
        const item = document.createElement('div');
        item.className ='dropdown-item'
        item.textContent =dayName;

        item.addEventListener('click', function(){
            updateHourlyForecast(day.hour);
            dropDownButton.firstChild.textContent = dayName;
            dropDownMenu.classList.remove('active');
        });
        dropDownMenu.appendChild(item);
    })

}

//fetch city suggestions
async function fetchCitySuggestions(city) {
    
}
