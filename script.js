//API Key and Base URL
const API_KEY ='af02f5d4e836499494c73235261206';
const BASE_URL = 'https://api.weatherapi.com/v1';

let debounceTimer;
let tempUnit = 'metric';
let windSpeedUnit = 'metric';
let precipitationUnit = 'metric';
let currentWeatherData = null;

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

//dropdown inside Hourly button
const dropDownButton = document.querySelector(".hourly-forecast__btn");
const dropDownMenu = document.querySelector('.dropdown-menu');

//dropdown Inside Unit Button
const navBtn = document.querySelector('.nav__btn');
const unitMenu = document.querySelector('.unit-menu');
const unitToggle = document.querySelector('#unit-toggle');

//Unit Option Elements
const unitOptions = document.querySelectorAll('.unit-option');


//addlistner to unit options
unitOptions.forEach(function(option){
    option.addEventListener('click', function(){
        const unitType = option.dataset.unit;
        const unitValue = option.dataset.value;
        if (unitType === 'temp'){
            tempUnit = unitValue;
        }
        if(unitType === 'wind'){
            windSpeedUnit = unitValue;
        }
        if(unitType === 'precipitation'){
            precipitationUnit = unitValue;
        }
        updateCheckMarks();        
        if(currentWeatherData){
            updateCurrentWeather(currentWeatherData);
            updateMetrics(currentWeatherData);
            updateDailyForecast(currentWeatherData);
            updateHourlyForecast(currentWeatherData.forecast.forecastday[0].hour);
        }
    })
})

//Add Listner
navBtn.addEventListener('click', function(){
    navBtn.classList.toggle('unit-wrapper-open');
    unitMenu.classList.toggle('active');
});

//suggestion List
const searchSuggestion = document.querySelector('.search-suggestion');






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

//Click Listner to Change Unit Measurement
unitToggle.addEventListener('click', function(){
    if(tempUnit === 'metric'){
        tempUnit = 'imperial';
        windSpeedUnit = 'imperial';
        precipitationUnit = 'imperial'
        unitToggle.textContent  = 'Switch to Metric';
    } else{
        tempUnit ='metric';
        windSpeedUnit = 'metric';
        precipitationUnit = 'metric';
        unitToggle.textContent = 'Switch to Imperial'
    }

    
    updateCurrentWeather(currentWeatherData);
    updateMetrics(currentWeatherData);
    updateDailyForecast(currentWeatherData);
    updateHourlyForecast(currentWeatherData.forecast.forecastday[0].hour);
})


//function  to fetch weeather data
async function getWeather(city){
    try{
        const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=no&alerts=no`;
        const response = await fetch(url);
        const data = await response.json();
        currentWeatherData = data;
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
    if (tempUnit === 'metric'){
        weatherTemp.textContent =`${data.current.temp_c}°`;
    } else{
        weatherTemp.textContent =`${data.current.temp_f}°`;
    }
}
//update weather metrics based on weaather card
function updateMetrics(data){
    humidityValue.textContent =`${data.current.humidity} %`
    if (windSpeedUnit === 'metric'){
        windValue.textContent = `${data.current.wind_kph} kph`;
    }
    else{
        windValue.textContent = `${data.current.wind_mph} mph`;
    }
    if (precipitationUnit === 'metric'){
        precipitationValue.textContent = `${data.current.precip_mm} mm`;
    } else{
        precipitationValue.textContent = `${data.current.precip_in} in`;
    }
    if (tempUnit === 'metric'){
        feelsLikeValue.textContent = `${data.current.feelslike_c}°`;
    } else{
        feelsLikeValue.textContent = `${data.current.feelslike_f}°`;
    }
}





//update daily  forecast data values
function updateDailyForecast(data){
    //clear all dummy data

    dailyForecastContainer.innerHTML= '';
    
    //loop through each forecas data and insert updated value
    data.forecast.forecastday.forEach(function(day) {
    let high;
    let low;
    if(tempUnit === 'metric'){
        high = day.day.maxtemp_c;
        low = day.day.mintemp_c
    } else{
        high =day.day.maxtemp_f;
        low = day.day.mintemp_f;
    }
        const card = document.createElement('div');
        card.className = 'forecast-container__cards'
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', {weekday:'short'});
        card.innerHTML = `
        <p class = "day">${dayName}</p>
        <img src ="${day.day.condition.icon}" alt ="${day.day.condition.text}">
        <div class="temp-range">
            <p class ="high">${high}°</p>
            <p class ="low">${low}°</p>
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
    
    let hourTemp;
    if(tempUnit === 'metric'){
        hourTemp = hour.temp_c;
    } else {
        hourTemp = hour.temp_f;
    }
    card.innerHTML =`
    <div class ="icon-time">
        <img src="${hour.condition.icon}" alt="${hour.condition.text}">
        <p>${formattedTime}
    </div>
        <p class="temp"> ${hourTemp}°</p>`;
        
 
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
    try{
        const url =`${BASE_URL}/search.json?key=${API_KEY}&q=${city}`;
        const response =  await fetch(url);
        const data = await response.json();
        //clear suggestions after response

        searchSuggestion.innerHTML = '';
        if (data.length === 0){
            searchSuggestion.classList.remove('active');
            return;
        }

        data.forEach(function(city){
            const item = document.createElement('li');
            item.textContent = `${city.name}, ${city.country}`;
            searchSuggestion.appendChild(item);

        //add click  fucntion
        item.addEventListener('click' ,function(){
            searchInput.value = `${city.name}, ${city.country}`;
            searchSuggestion.classList.remove('active');
            getWeather(city.name);
        });





        });
        searchSuggestion.classList.add('active');
        

    }
    catch(error){
        console.error("Error Fetching Suggestions", error);
    }
}

//update checkmark
function updateCheckMarks(){
    unitOptions.forEach((opt)=>{
        const checkmark = document.querySelector('.checkmark');
        if(opt.dataset.unit === 'temp'){  
            checkmark.textContent = opt.dataset.value = tempUnit ? '✓' : '';
        }
        if(opt.dataset.unit === 'wind'){
            checkmark.textContent = opt.dataset.value = windSpeedUnit? '✓': '';
        }
        if(opt.dataset.unit === 'precipitation'){
            checkmark.textContent = opt.dataset.value = precipitationUnit? '✓': '';
        }
    })
}