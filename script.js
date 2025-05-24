// Create function to fetch wheather

async function getWeather() {
  const cityInput = document.getElementById("cityInput").value.trim();
  const apiKey = "4a91435fb4d40a2125228047dc9e30b7";

  // Check for empty input
  if (!cityInput) {
    alert("Please enter a city name");
    return;
  }

  try {
    //Split the city and country code(if, provided)
    const [cityName, countryCode] = cityInput
      .split(",")
      .map((str) => str.trim());

    //Building conditional URL
    let geoURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}`;

    if (countryCode) {
      geoURL += `,${countryCode}`;
    }
    geoURL += `&limit=1&appid=${apiKey}`;

    // Getting lat and lon for cities
    const response = await fetch(geoURL);
    const data = await response.json();

    //Check if city array is blank
    if (!data || data.length === 0) {
      alert("City not found!");
      return;
    }

    //If city is found
    const location = data[0];

    // Calling final weather Api
    const result = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`
    );

    const finalWeather = await result.json();

    //if city not found
    if (finalWeather.cod !== 200) {
      document.getElementById(
        "weatherInfo"
      ).innerHTML = `<p class="text-red-500">${finalWeather.message}</p>`;
      return;
    }

    //Show weather info
    // const name = data.name;
    // const sys = data.sys;
    // const main = data.main;
    // const weather = data.weather;

    //Shorter way of doing same
    const { name, sys, main, weather } = finalWeather;

    const weatherIcons = {
      Clear:
        "https://lottie.host/cc056f8b-3ebc-4e6c-ae8c-cdb1cade014b/2UzcDoAiDH.json",
      Clouds:
        "https://lottie.host/60e2b4cb-bf8c-44a1-8d2b-cb936098ca5a/2jxjGaOAus.json",
      Rain: "https://lottie.host/5cac3302-8f5d-40b7-991a-d1a18b38ffe1/CT109KZMzR.json",
      Snow: "https://lottie.host/9be20c33-6c66-4f9f-bbce-9e98f75d2168/QfGKHZbhXd.json",
      Thunderstorm:
        "https://lottie.host/d7e10a20-ecef-42e7-9d34-ec36af23652e/BFMVhAvVC4.json",
      Mist: "https://lottie.host/2de245ea-d08c-4194-9aa0-8dc9c2c7554b/vdqlSweQN7.json",
      Haze: "https://lottie.host/2de245ea-d08c-4194-9aa0-8dc9c2c7554b/vdqlSweQN7.json",
      Fog: "https://lottie.host/2de245ea-d08c-4194-9aa0-8dc9c2c7554b/vdqlSweQN7.json",
      Dust: "https://lottie.host/a9f7da45-c8bf-4e7c-8748-07769cffd1f8/omWtGue4zY.json",
      Default:
        "https://lottie.host/5fbdfb5c-6cb4-4f9a-9a82-dc5f07f9f893/9PfSrOAo9x.json",
    };

    const condition = weather[0].main;
    const iconURL = weatherIcons[condition] || weatherIcons.Default;

    document.getElementById("weatherInfo").innerHTML = `
        <h2 class="font-semibold text-xl">${location.name}, ${sys.country}</h2>
        <lottie-player src="${iconURL}" background="transparent" speed="1" style="width: 200px; height: 200px;" loop autoplay  class="mx-auto block my-0"></lottie-player>
        <p class="text-lg">${weather[0].main}</p>
        <p class="text-2xl font-bold">${main.temp}°C</p>
        `;
    showMap(location, weather, main, sys);
    // Error message
  } catch (error) {
    document.getElementById(
      "weatherInfo"
    ).innerHTML = `<p class="text-red-500">Could not fetch weather data. Try again later</p>`;
    console.log("could not get the weather", error);
  }
}

//Function to map container

function showMap(location, weather, main, sys) {
  const map = document.getElementById("map");
  map.style.display = "block";

  if (!window.weatherMap) {
    window.weatherMap = L.map("map").setView([location.lat, location.lon], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(weatherMap);

    // Enable full interaction
    weatherMap.dragging.enable();
    weatherMap.touchZoom.enable();
    weatherMap.scrollWheelZoom.enable();
    weatherMap.doubleClickZoom.enable();
    weatherMap.boxZoom.enable();
    weatherMap.keyboard.enable();
  } else {
    weatherMap.setView([location.lat, location.lon], 10);
  }

  // Add or update marker
  if (window.weatherMarker) {
    window.weatherMap.removeLayer(window.weatherMarker);
  }

  window.weatherMarker = L.marker([location.lat, location.lon])
    .addTo(window.weatherMap)
    .bindPopup(
      `<b>${location.name}, ${sys.country}</b><br>${weather[0].main}, ${main.temp}°C`
    )
    .openPopup();

  // Shift map view slightly left to make space for card
  weatherMap.panBy([-350, 0]);

  // Resize fix
  window.weatherMap.invalidateSize();
}

document.addEventListener("DOMContentLoaded", function () {
  const button = document.querySelector(".button_1");
  button.addEventListener("click", getWeather);
});
