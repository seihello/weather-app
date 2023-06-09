/* Elements */
const searchCityInput = document.querySelector("#search-city")
const cityNameElement = document.querySelector("#city-name")
const favoriteStarElement = document.querySelector("#favorite-star")
const favoriteCitiesMenu = document.querySelector("#favorite-cities")
const currentWeatherSectionElement = document.querySelector("#current-weather-section")
const countryCodeElement = document.querySelector("#country-code")
const nationalFlagElement = document.querySelector("#national-flag")
const currentWeatherElement = document.querySelector("#current-weather")
const currentWeatherTextElement = document.querySelector("#current-weather-text")
const currentWeatherIconElement = document.querySelector("#weather-icon")
const currentTemperatureElement = document.querySelector("#current-temperature-text")
const currentTimeElement = document.querySelector("#current-time")

const apiKey = "c5b83392add58be24fb5a7bd362ced83"
const defaultCity = "Vancouver"
const isCelsius = true

const storageKey = "favoriteCities"
let favoriteCities = {}

// Hide the current weather until calling all API finishes
currentWeatherSectionElement.style["opacity"] = 0

/* User's location */
// If user's current location is sucessful to get, display the weather there
// If it's failed to get, display the weather of the default city
navigator.geolocation.getCurrentPosition(showWeatherInCurrentLocation, showWeatherInDefaultCity);

function showWeatherInCurrentLocation(currentLocation) {
    favoriteStarElement.style["opacity"] = 100
    showWeatherByLocation(currentLocation["coords"]["latitude"], currentLocation["coords"]["longitude"])
}

function showWeatherInDefaultCity() {
    favoriteStarElement.style["opacity"] = 100
    showWeatherByCityName(defaultCity)
}


/* Auto Complete */
window.initMap = function() {
    // Suggest only cities
    let option = {
        types: ['(cities)']
       };
    const autocomplete = new google.maps.places.Autocomplete(searchCityInput, option);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        showWeatherByCityName(searchCityInput.value)
    });
}


/* Favorite Cities */
// Add an event listener to the favorite star icon
favoriteStarElement.addEventListener("click", onFavoriteStarClicked)
// Add an event listener to the pull-down menu
favoriteCitiesMenu.addEventListener("change", onFavoriteCitySelected)

// Set up for user's favorite cities
getFavoriteCitiesFromStorage()

function getFavoriteCitiesFromStorage() {
    // Get user's favorite cities from local storage
    let favoriteCitiesJSON = localStorage.getItem(storageKey)

    // If data exists
    if(favoriteCitiesJSON !== null) {
        // Convert to an array
        favoriteCities = JSON.parse(favoriteCitiesJSON)

        // Deploy to the pull-down menu
        for(let countryGroup of Object.keys(favoriteCities)) {

            const countryOptionGroup = document.createElement("optgroup")
            countryOptionGroup.label = countryGroup
      
            for(let favoriteCity of favoriteCities[countryGroup]) {
                const favoriteCityOption = document.createElement("option")
                favoriteCityOption.classList.add("favorite-city")
                favoriteCityOption.innerText = favoriteCity
                countryOptionGroup.appendChild(favoriteCityOption)
            }
            favoriteCitiesMenu.appendChild(countryOptionGroup)
        }
    }
}

function onFavoriteStarClicked() {    
    const displayedCity = cityNameElement.innerText
    const displayedCountry = countryCodeElement.innerText
    let isNewCity = true
    let isNewCountry = true

    if(displayedCountry in favoriteCities) {
        isNewCountry = false
        if(favoriteCities[displayedCountry].includes(displayedCity)) {
            isNewCity = false
        }
    }
    
    // If the displayed city is new
    if(isNewCity) {
        // Create an option element that will be added to the pull-down menu
        const newFavoriteCityOption = document.createElement("option")
        newFavoriteCityOption.classList.add("favorite-city")
        newFavoriteCityOption.innerText = displayedCity
        
        if(isNewCountry) {
            // Add a new country group with a new city to the favorite cities
            favoriteCities[displayedCountry] = [displayedCity]

            // Add a new country group with a new option to the pull-down menu
            const newCountryGroup = document.createElement("optgroup")
            newCountryGroup.label = displayedCountry
            newCountryGroup.appendChild(newFavoriteCityOption)
            favoriteCitiesMenu.appendChild(newCountryGroup)
        } else {
            // Add a new city to its country group that already exists
            favoriteCities[displayedCountry].push(displayedCity)

            // Add a new option to its country group that already exists
            for(let i = 1; i < favoriteCitiesMenu.children.length; i++) {
                if(favoriteCitiesMenu.children[i].label === displayedCountry) {
                    favoriteCitiesMenu.children[i].appendChild(newFavoriteCityOption)
                }
            }
        }
        
    }
    // If the displayed city is already registered
    else {
        // Remove the displayed city from the favorite cities
        let index = favoriteCities[displayedCountry].indexOf(displayedCity)
        favoriteCities[displayedCountry].splice(index, 1)
        if(favoriteCities[displayedCountry].length === 0) {
            delete favoriteCities[displayedCountry]
        }

        // Remove the displayed city from the pull-down menu
        for(let i = 1; i < favoriteCitiesMenu.children.length; i++) {
            if(favoriteCitiesMenu.children[i].label === displayedCountry) {
                for(let j = 0; j < favoriteCitiesMenu.children[i].children.length; j++) {
                    if(favoriteCitiesMenu.children[i].children[j].innerText === displayedCity) {
                        favoriteCitiesMenu.children[i].removeChild(favoriteCitiesMenu.children[i].children[j])
                    }
                }
            }
            if(favoriteCitiesMenu.children[i].children.length === 0) {
                favoriteCitiesMenu.removeChild(favoriteCitiesMenu.children[i])
            }
        }
    }

    // Update user's local storage (Just fully copy the array as JSON)
    localStorage.setItem(storageKey, JSON.stringify(favoriteCities))

    // Update the star sign
    setFavoriteStar()

    // Change the selected city on the pull-down menu
    changeSelectedFavoriteCityOption(cityNameElement.innerHTML)
}

function setFavoriteStar() {
    // If displayed city is one of the favorite then the star should be filled
    let cityExists = false
    Object.values(favoriteCities).forEach((element, index) => {
        if(element.includes(cityNameElement.innerHTML)) {
            cityExists = true
        }
    })
    
    if(cityExists) {
        favoriteStarElement.src = "img/star-on.png"
    } else {
        favoriteStarElement.src = "img/star-off.png"
    }
}

function onFavoriteCitySelected(event) {
    // Show the weather based on the selected city
    showWeatherByCityName(event.target.value)

    // Update the star sign
    setFavoriteStar()
}


// Make the displayed city selected if it's one of the favorite cities
function changeSelectedFavoriteCityOption(displayedCityName) {
    // Make the title selected in case the displayed city is not a favorite city
    favoriteCitiesMenu.children[0].selected = true

    // Check every option and make it selected if it matches the displayed city
    for(favoriteCountryGroup of favoriteCitiesMenu.children) {
        for(favoriteCityOption of favoriteCountryGroup.children) {
            if(favoriteCityOption.innerText === displayedCityName) {
                favoriteCityOption.selected = true
            } else {
                favoriteCityOption.selected = false
            }
        }
    }
}

/* Current Weather */
function showWeather(request) {
    // Call OpenWeather API to get data
    fetch(request).then((response) => {
        if(response.status === 404) {
            alert("No weather data of the selected place.")
            return;
        } else if(response.status !== 200) {
            console.log("Status Error!", response.status)
            return
        }
        return response.json()
    })
    .then((currentWeather) => {
        // Show the data obtained from API (Debug)
        console.log(currentWeather)

        // Update the display using the data
        cityNameElement.innerText = currentWeather["name"]
        currentTemperatureElement.innerText = Math.floor(currentWeather["main"]["temp"])
        currentWeatherTextElement.innerText = currentWeather["weather"][0]["main"]
        currentWeatherIconElement.src = "https://openweathermap.org/img/wn/" + currentWeather["weather"][0]["icon"] + "@4x.png"

        const countryCode = currentWeather["sys"]["country"]
        countryCodeElement.innerText = countryCode
        nationalFlagElement.src = `https://flagsapi.com/${countryCode}/flat/64.png`
        const currentTime = new Date(currentWeather["dt"]*1000)
        const currentTimeText = `As of ${toMonthText(currentTime.getMonth())}${currentTime.getDate()}, ${currentTime.getFullYear()} ${toAMPM(currentTime.getHours(), currentTime.getMinutes())}`
        currentTimeElement.innerText = currentTimeText

        // Update the star sign
        setFavoriteStar()

        // Show the current weather
        currentWeatherSectionElement.style["opacity"] = 1

        // Change the selected city on the pull-down menu
        changeSelectedFavoriteCityOption(cityNameElement.innerHTML)

        // Call the function to display the weather of the next 5 days here
        selectedCity = currentWeather["name"]
        showFiveDaysWeather()
        threeHRange()

        console.log(favoriteCities, 99)
    })
    .catch((error) => {
        console.log("Fetch Error: " + error)
    })
}

function showWeatherByCityName(cityName) {
    const temperatureType = isCelsius ? "metric" : "imperial" 
    const request = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${temperatureType}&appid=${apiKey}`

    showWeather(request)
}

function showWeatherByLocation(latitude, longtitude) {
    const temperatureType = isCelsius ? "metric" : "imperial" 
    const request = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longtitude}&units=${temperatureType}&appid=${apiKey}`

    showWeather(request)
}

// Display today's 3-hourly weather when the user clickes the current weather
currentWeatherElement.addEventListener("click", () => {
    selectedDay = 0
    threeHRange()
})


//const apiKey ="3b2df1883208190d986bcd1b1e48eff4"

// to change the unit of temperature from Kelvin to Celsius
const temperatureType = "metric"

// let selectedCity = ""
let selectedDay = 0


const firstDayWeather = document.getElementById("firstDay")
const secondDayWeather = document.getElementById("secondDay")
const thirdDayWeather = document.getElementById("thirdDay")
const forthDayWeather = document.getElementById("forthDay")
const fifthDayWeather = document.getElementById("fifthDay")


let weatherIcon =document.getElementsByClassName("dayWeatherImg")


firstDayWeather.addEventListener("click", ()=> {
    selectedDay = 1
    threeHRange()
})

secondDayWeather.addEventListener("click", ()=> {
    selectedDay = 2
    threeHRange()
})

thirdDayWeather.addEventListener("click", ()=> {
    selectedDay = 3
    threeHRange()
})

forthDayWeather.addEventListener("click", ()=> {
    selectedDay = 4
    threeHRange()
})

fifthDayWeather.addEventListener("click", ()=> {
    selectedDay = 5
    threeHRange()
})

function showFiveDaysWeather() {
    const request = `https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&units=${temperatureType}&appid=${apiKey}`

    fetch(request)
    .then(
        function(response) {
            if(response.status !== 200){
                return;
            }
            response.json().then(function(fiveDaysWeather) {
                console.log(fiveDaysWeather);


                // get currentDate
                let currentDate = new Date();

                
                // for the if statement to specific the date, the time and weather infos
                let day = 1;


                // get all the weather info
                fiveDaysWeather["list"].forEach( eachWeatherInfo=> {
                    console.log(eachWeatherInfo);
                
                    // convert unix-time to date
                    let date = new Date(eachWeatherInfo["dt"] * 1000);  
                    
                    
                    


                    // show the next 5 days' weather              
                    if(date.getDate() === currentDate.getDate() + day) {
                        if(date.getHours() >=6 && date.getHours() <=9) {


                            // show days for the next 5 days
                            if(date.getDay() === 0){
                                let showDay = "Sun"
                                document.getElementById(`showDay${day}`).innerHTML= showDay + " " + toMonthText(date.getMonth()) + date.getDate()     
                            } else if(date.getDay()=== 1){
                                let showDay = "Mon"
                                document.getElementById(`showDay${day}`).innerHTML= showDay + " " + toMonthText(date.getMonth()) + date.getDate() 
                            } else if(date.getDay() === 2){
                                let showDay = "Tue"
                                document.getElementById(`showDay${day}`).innerHTML= showDay + " " + toMonthText(date.getMonth()) + date.getDate() 
                            } else if(date.getDay() === 3){
                                let showDay = "Wed"
                                document.getElementById(`showDay${day}`).innerHTML= showDay + " " + toMonthText(date.getMonth()) + date.getDate() 
                            } else if(date.getDay() === 4){
                                let showDay = "Thu"
                                document.getElementById(`showDay${day}`).innerHTML= showDay + " " + toMonthText(date.getMonth()) + date.getDate() 
                            } else if(date.getDay() === 5){
                                let showDay = "Fri"
                                document.getElementById(`showDay${day}`).innerHTML= showDay + " " + toMonthText(date.getMonth()) + date.getDate() 
                            } else if(date.getDay() === 6){
                                let showDay = "Sat"
                                document.getElementById(`showDay${day}`).innerHTML= showDay + " " + toMonthText(date.getMonth()) + date.getDate() 
                            }
                            
                            // get the month and the day for the next 5days
                            // document.getElementById(`monthOn${day}Day`).innerHTML= toMonthText(date.getMonth()) + date.getDate()
                            
                            document.getElementById(`day${day}`).innerHTML= eachWeatherInfo["weather"][0]["main"]
                            weatherIcon[day-1].src = "https://openweathermap.org/img/wn/" + eachWeatherInfo["weather"][0]["icon"] + "@4x.png";

                            let temp = Math.floor(eachWeatherInfo["main"]["temp"])
                            document.getElementById(`day${day}-temp`).innerHTML= temp + "℃"
                            
                            day = day +1; 
                        }
                    }
                })
            })
        }
    ).catch((error) => {
        console.log("Fetch Error: " + error)
    })
}



// threeHRange("Vancouver", 1);

let weatherIconElement = document.getElementsByClassName("weatherImg");

let rangeIndex = 0;

function threeHRange () {
    fetch (`https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&units=${temperatureType}&appid=42da94770c5c8f2ed979107d60b61299`)
    .then(
        function(response) {
            response.json().then(function(data) {

                console.log(data["list"][0]);
                let date = new Date(data["list"][0]["dt"] * 1000);

                let weatherList = data["list"]
                

                const currentDate = new Date();
                const compareDate = currentDate.getDate() + selectedDay;

                let threeHBox = document.getElementsByClassName("threeH-box");

                // Set empty value to all the 3-hourly range
                for(let i = 0; i < 8; i++) {
                    const weatherRange = document.getElementsByClassName("weatherRange" + i);
                    weatherRange[0].innerText = "";
                    
                    weatherIconElement[i].src = "";
                    
                    let threeHDegrees = document.getElementsByClassName("threeHRange-degrees" + i);
                    threeHDegrees[0].innerText = "";
                }

                
                //For Each to show the Weather through all the hour Ranges
                rangeIndex = 0
                weatherList.forEach((weather, index) => {
                    

                    let date = new Date(weather["dt"] * 1000);
                    

                    if (date.getDate() === compareDate) {
                        const weatherRange = document.getElementsByClassName("weatherRange" + rangeIndex);
                        weatherRange[0].innerText = weather["weather"][0]["main"];
                        
                        weatherIconElement[rangeIndex].src = "https://openweathermap.org/img/wn/" + weather["weather"][0]["icon"] + "@4x.png";
                        
                        let threeHDegrees = document.getElementsByClassName("threeHRange-degrees" + rangeIndex);
                        threeHDegrees[0].innerText = Math.floor(weather["main"]["temp"]) + "°C";

                        rangeIndex += 1;

                        console.log(weatherRange)
                    
                    
                    }
                    

                }) 
                //if we have 5 data
                //rangeindex = 5
                if(rangeIndex < 8 && selectedDay === 0) {

                    let hoursGap = 8 - rangeIndex; // 3
                    for(let i = 7; i >= hoursGap; i--)// 7 6 5 4 3 
                    {
                        const weatherRangeOrigin = document.getElementsByClassName("weatherRange" + (i - hoursGap)) ;
                        const weatherRangeDest = document.getElementsByClassName("weatherRange" + i);

                        const threeHDegreesOrigin = document.getElementsByClassName("threeHRange-degrees" + (i - hoursGap));
                        const threeHDegreesDest = document.getElementsByClassName("threeHRange-degrees" + i); 

                        weatherRangeDest[0].innerText = weatherRangeOrigin[0].innerText;
                        weatherIconElement[i].src = weatherIconElement[i - hoursGap].src;

                        threeHDegreesDest[0].innerText = threeHDegreesOrigin[0].innerText;

                        weatherRangeOrigin[0].innerText = ""
                        weatherIconElement[i - hoursGap].src = ""

                        threeHDegreesOrigin[0].innerText = ""

                    } 
                }
            })
        }
    )
}

function toMonthText(month) {
    switch(month) {
        case 0:
            return "Jan."
        case 1:
            return "Fab."
        case 2:
            return "Mar."
        case 3:
            return "Apr."
        case 4:
            return "May."
        case 5:
            return "Jun."
        case 6:
            return "Jul."
        case 7:
            return "Aug."
        case 8:
            return "Sep."
        case 9:
            return "Oct."
        case 10:
            return "Nov."
        case 11:
            return "Dec."
    }
}

function toAMPM(hour, minute) {
    if(minute < 10) {
        minute = "0" + minute
    }
    if(hour === 0) {
        return `${12}:${minute} AM`
    }
    else if(hour < 12) {
        return `${hour}:${minute} AM`
    }
    else if(hour === 12) {
        return `${12}:${minute} PM`
    }
    else if(hour > 12) {
        return `${hour-12}:${minute} PM`
    }
}