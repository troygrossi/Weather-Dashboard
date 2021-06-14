var apiKeyLocation = "5e5bd93aa08421fd826028d64c87be12";
var apiKeyWeather = "edbe3d30bd838d7b3fe074f4c378fa86";

var clickEl = document.getElementsByClassName("search-items");

var Location = function (city, state, lat, long) {
  this.name = city;
  this.state = state;
  this.latitude = lat;
  this.longitude = long;
};

var getGeocode = function (city, state) {
  var lat = 0;
  var long = 0;
  // format the api url
  var apiUrl =
    "https://api.positionstack.com/v1/forward?access_key=" +
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

var historyIndex = 1;
var saveLocation = function (city, state, lat, long) {
  if (historyIndex != 1) {
    for (let i = 1; i < historyIndex; i++) {
      var tempLocation = document.querySelector("#index" + i);
      if (tempLocation.textContent === city + ", " + state) {
        return 0;
      }
    }
  }
  var newLocation = new Location(city, state, lat, long);
  localStorage.setItem("location" + historyIndex, JSON.stringify(newLocation));
  localStorage.setItem("index", historyIndex);
  updateHistory(newLocation);
};
var historyContainerEl = document.querySelector("#search-list");
var updateHistory = function (newLocation) {
  var newNumberEl = document.createElement("span");
  var newHistoryEl = document.createElement("li");
  newHistoryEl.setAttribute("class", "search-items");
  //update clickable items
  clickEl = document.getElementsByClassName("search-items");

  newHistoryEl.setAttribute("id", "index" + historyIndex);
  newNumberEl.textContent = "1) ";
  newNumberEl.setAttribute("id", "number" + historyIndex);
  newHistoryEl.textContent = newLocation.name + ", " + newLocation.state;
  historyContainerEl.prepend(newHistoryEl);
  historyContainerEl.prepend(newNumberEl);

  var newNumber = 2;
  for (let i = historyIndex - 1; i >= 1; i--) {
    var test = document.querySelector("#number" + i);
    test.textContent = newNumber + ") ";
    newNumber++;
  }
  historyIndex++;
};

var initialHistory = function () {
  if (localStorage.getItem("index")) {
    historyIndex = localStorage.getItem("index");

    var tempNumber = historyIndex;
    for (let i = 1; i <= historyIndex; i++) {
      var tempLocation = JSON.parse(localStorage.getItem("location" + i));
      var newNumberEl = document.createElement("span");
      var newHistoryEl = document.createElement("li");
      newHistoryEl.setAttribute("class", "search-items");
      newHistoryEl.setAttribute("id", "index" + i);
      newNumberEl.textContent = tempNumber + ") ";
      newNumberEl.setAttribute("id", "number" + i);
      newHistoryEl.textContent = tempLocation.name + ", " + tempLocation.state;
      historyContainerEl.prepend(newHistoryEl);
      historyContainerEl.prepend(newNumberEl);
      tempNumber--;
    }
    historyIndex++;
  }
};

var updateCurrent = function (city, data) {
  var newDailyEl = document.querySelector("#display-header");
  var newTempEl = document.querySelector("#display-temp");
  var newWindEl = document.querySelector("#display-wind");
  var newHumidityEl = document.querySelector("#display-humidity");
  var newUVEl = document.querySelector("#display-uv");
  var timeStamp = moment.unix(data.current.dt);
  currentTime = timeStamp.format("MMMM Do YYYY, h:mm:ss a");

  newDailyEl.textContent = city.toUpperCase() + ", " + currentTime;
  newTempEl.textContent = "Temperature: " + data.current.temp + " F";
  newWindEl.textContent = "Wind: " + data.current.wind_speed + " MPH";
  newHumidityEl.textContent = "Humidity: " + data.current.humidity + "%";
  newUVEl.textContent = "UV Index: " + data.current.uvi;
  if (data.current.uvi <= 2) {
    newUVEl.style.backgroundColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--uv-low");
  } else if (data.current.uvi > 2 && data.current.uvi <= 5) {
    newUVEl.style.backgroundColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--uv-medium");
  } else if (data.current.uvi > 5 && data.current.uvi <= 7) {
    newUVEl.style.backgroundColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--uv-high");
  } else {
    newUVEl.style.backgroundColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--uv-very-high");
  }
  updateFiveDay(data);
};

//index = amount of forecast days(5)
var index = 5;
var updateFiveDay = function (data) {
  var timeStamp = moment.unix(data.daily[1].dt);
  var date = timeStamp.format("MMMM Do YYYY");

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
};

var clickHistory = function (id) {
  var temp = id;
  id = temp.split("x")[1];
  var city = JSON.parse(localStorage.getItem("location" + id));
  document.querySelector("#search-city").value = city.name;
  document.querySelector("#search-state").value = city.state;
  getGeocode(city.name, city.state);
};

initialHistory();

document.body.addEventListener("click", function (event) {
  if (event.target.className === "search-items") {
    clickHistory(event.target.id);
  }
});

document.querySelector(".search-form").addEventListener("submit", getCity);

//update clickEl after form submission
