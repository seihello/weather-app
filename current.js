// Auto Complete
const searchCityInput = document.querySelector("#search-city")

function initMap() {
    const autocomplete = new google.maps.places.Autocomplete(searchCityInput);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        showWeather(searchCityInput.value)
    });
}

// Current Weather
const apiKey = "c5b83392add58be24fb5a7bd362ced83"
const defaultCity = "Vancouver"

const selectedCityNameElement = document.querySelector("#city-name")
const currentTemperatureElement = document.querySelector("#current-temperature")
const currentWeatherElement = document.querySelector("#current-weather")

showWeather("Vancouver, BC, Canada")

function showWeather(cityName) {
    const weatherRequest = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`

    fetch(weatherRequest).then((response) => {
        if(response.status !== 200) {
            return;
        }
        return response.json()
    })
    .then((data) => {
        console.log(data)
    
        selectedCityNameElement.innerHTML = cityName
        currentTemperatureElement.innerHTML = data["main"]["temp"]
        currentWeatherElement.innerHTML = data["weather"][0]["main"]
    })
    .catch((error) => {
        console.log("Fetch Error: " + error)
    })

    // Call the function to display the weather of the next 5 days
}

// Favorite Cities
let favoriteCities = []

const favoriteStarElement = document.querySelector("#favorite-star")
favoriteStarElement.addEventListener("click", onFavoriteStarClicked)

const favoriteCitiesMenu = document.querySelector("#favorite-cities")

function onFavoriteStarClicked() {
    // Add to the list of the favorite cities
    const newFavoriteCity = selectedCityNameElement.innerHTML
    if(favoriteCities.includes(newFavoriteCity)) {
        return
    }
    favoriteCities.push(newFavoriteCity)

    // Add to the pull-down menu
    const newFavoriteCityOption = document.createElement("option")
    newFavoriteCityOption.innerHTML = newFavoriteCity
    favoriteCitiesMenu.appendChild(newFavoriteCityOption)
}