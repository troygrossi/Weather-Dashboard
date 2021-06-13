var apiKeyLocation = "5e5bd93aa08421fd826028d64c87be12";
var apiKeyWeather = "edbe3d30bd838d7b3fe074f4c378fa86";

var Location = function (city, state, long, lat) {
  this.name = city;
  this.state = state;
  this.latitude = long;
  this.longitude = lat;
};

var getGeocode = function (city, state) {
  var lat = 0;
  var long = 0;
  // format the api url
  var apiUrl =
    "http://api.positionstack.com/v1/forward?access_key=" +
    apiKeyLocation +
    "&query=" +
    city +
    "&country=US";
  "&region=" + state;

  // make a request to the url
  fetch(apiUrl)
    .then(function (response) {
      //cathes error if request has no matching repository name
      if (!response.ok) {
        alert("Error1: City Not Found");
        return 0;
      }
      return response.json();
    })
    .then(function (data) {
      console.log(data.data[0]);
      lat = data.data[0].latitude;
      long = data.data[0].longitude;
      saveLocation(city, state, lat, long);
      getWeather(city, lat, long);
    }) //cathes error if request fails to send
    .catch(function (error) {
      alert("Error2: City Not Found");
    });
};

var getWeather = function (city, lat, long) {
  // format the api url
  var apiUrl =
    "https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" +
    lat +
    "&lon=" +
    long +
    "&appid=" +
    apiKeyWeather;

  // make a request to the url
  fetch(apiUrl)
    .then(function (response) {
      //cathes error if request has no matching repository name
      if (!response.ok) {
        alert("Error: Invalid Coordinates");
        return 0;
      }
      return response.json();
    })
    .then(function (data) {
      updateCurrent(city, data);
    }) //cathes error if request fails to send
    .catch(function (error) {
      alert("Unable to connect");
    });
};

var locationIndex = 1;
var saveLocation = function (city, state, lat, long) {
  newLocation = new Location(city, state, long, lat);
  localStorage.setItem("location" + locationIndex, JSON.stringify(newLocation));
  updateHistory(newLocation);
};

var historyContainerEl = document.querySelector("#search-list");
var updateHistory = function (newLocation) {
  var newHistoryEl = document.createElement("li");
  for (let i = 1; i <= locationIndex; i++) {
    let tempLocation = localStorage.getItem("location" + locationIndex);
    tempLocation = JSON.parse(tempLocation);
    console.log(tempLocation);
  }
  newHistoryEl.textContent = locationIndex + ") " + newLocation.name;
  historyContainerEl.append(newHistoryEl);

  locationIndex++;
};

var newDailyEl = document.querySelector("#display-header");
var newTempEl = document.querySelector("#display-temp");
var newWindEl = document.querySelector("#display-wind");
var newHumidityEl = document.querySelector("#display-humidity");
var newUVEl = document.querySelector("#display-uv");
var updateCurrent = function (city, data) {
  console.log(data);
  var timeStamp = moment.unix(data.current.dt);
  currentTime = timeStamp.format("MMMM Do YYYY, h:mm:ss a");

  newDailyEl.textContent = city + " " + currentTime;
  newTempEl.textContent = data.current.temp;
  newWindEl.textContent = data.current.wind_speed;
  newHumidityEl.textContent = data.current.humidity;
  newUVEl.textContent = data.current.uvi;
  updateFiveDay(data);
};

//index = amount of forecast days(5)
var index = 5;
var updateFiveDay = function (data) {
  console.log(data);
  var timeStamp = moment.unix(data.daily[1].dt);
  var date = timeStamp.format("MMMM Do YYYY");
  console.log(date);
  for (let i = 1; i <= index; i++) {
    var timeStamp = moment.unix(data.daily[i].dt);
    var date = timeStamp.format("MMMM Do YYYY");
    var iconCode = data.daily[i].weather[0].icon;
    var iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png";
    document.querySelector("#day-" + i + "-date").textContent = date;
    document.querySelector("#day-" + i + "-img").setAttribute("src", iconURL);
    document
      .querySelector("#day-" + i + "-img")
      .setAttribute("alt", "weather icon");
    document.querySelector("#day-" + i + "-temp-high").textContent =
      "High: " + data.daily[i].temp.max + " F";
    document.querySelector("#day-" + i + "-temp-low").textContent =
      "Low: " + data.daily[i].temp.min + " F";
    document.querySelector("#day-" + i + "-wind").textContent =
      "Wind:" + data.daily[i].wind_speed + " MPH";
    document.querySelector("#day-" + i + "-humidity").textContent =
      "Humidity: " + data.daily[i].humidity + "%";
  }
};

var getCity = function (event) {
  event.preventDefault();
  let city = document.querySelector("#search-city").value;
  let state = document.querySelector("#search-state").value;

  if (!city || !state) {
    alert("Please include a city and state in your search");
    return 0;
  } else {
    getGeocode(city, state);
  }

  console.log(city);
  console.log(state);
};

// getCity();
// getState();
document.addEventListener("submit", getCity);
