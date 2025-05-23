const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API Key
let currentLang = "en";
let mapInstance = null;

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const resultDiv = document.getElementById("result");
  const forecastDiv = document.getElementById("forecast");
  const mapContainer = document.getElementById("map");
  mapContainer.innerHTML = ""; // Clear previous map

  try {
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${currentLang}`);
    const weatherData = await weatherRes.json();

    if (weatherData.cod !== 200) {
      resultDiv.innerHTML = `<p style='color: red;'>${translate("city_not_found")}</p>`;
      forecastDiv.innerHTML = "";
      return;
    }

    const { name, main, weather, coord } = weatherData;
    resultDiv.innerHTML = `
      <h2>${name}</h2>
      <p>${translate("temp")}: ${main.temp}°C</p>
      <p>${translate("weather")}: ${weather[0].description}</p>
      <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="weather icon">
    `;

    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=${currentLang}`);
    const forecastData = await forecastRes.json();

    let forecastHTML = `<h3>${translate("forecast")}</h3><div class="forecast-grid">`;
    for (let i = 0; i < forecastData.list.length; i += 8) {
      const item = forecastData.list[i];
      forecastHTML += `
        <div class="forecast-item">
          <p>${new Date(item.dt_txt).toLocaleDateString(currentLang === 'th' ? 'th-TH' : 'en-US')}</p>
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="">
          <p>${item.main.temp}°C</p>
        </div>`;
    }
    forecastHTML += '</div>';
    forecastDiv.innerHTML = forecastHTML;

    mapInstance = L.map('map', {
      center: [coord.lat, coord.lon],
      zoom: 10,
      scrollWheelZoom: false,
      zoomControl: false
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors, &copy; CARTO'
    }).addTo(mapInstance);
    L.marker([coord.lat, coord.lon]).addTo(mapInstance)
      .bindPopup(`${name}`)
      .openPopup();

    // 🔧 Fix map display issue
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 200);

  } catch (err) {
    resultDiv.innerHTML = `<p style='color: red;'>${translate("error")}</p>`;
    forecastDiv.innerHTML = "";
    console.error(err);
  }
}

function toggleMode() {
  const body = document.body;
  const label = document.getElementById("modeLabel");
  body.classList.toggle("dark-mode");
  body.classList.toggle("light-mode");
  label.textContent = body.classList.contains("dark-mode") ? "Dark Mode" : "Light Mode";
}

function changeLanguage() {
  currentLang = document.getElementById("languageSelect").value;
  document.getElementById("title").textContent = currentLang === 'th' ? "🌤️ ตรวจสภาพอากาศ" : "🌤️ Weather Checker";
  document.getElementById("cityInput").placeholder = currentLang === 'th' ? "กรอกชื่อเมือง..." : "Enter city name...";
  document.getElementById("searchButton").textContent = currentLang === 'th' ? "ค้นหา" : "Search";
  document.getElementById("resetButton").textContent = currentLang === 'th' ? "รีเซ็ต" : "Reset";
  document.getElementById("modeLabel").textContent = document.body.classList.contains("dark-mode")
    ? (currentLang === 'th' ? "โหมดกลางคืน" : "Dark Mode")
    : (currentLang === 'th' ? "โหมดกลางวัน" : "Light Mode");
}

function translate(key) {
  const translations = {
    temp: { en: "Temperature", th: "อุณหภูมิ" },
    weather: { en: "Weather", th: "สภาพอากาศ" },
    forecast: { en: "5-Day Forecast", th: "พยากรณ์ 5 วัน" },
    city_not_found: { en: "City not found. Please try again.", th: "ไม่พบเมือง กรุณาลองใหม่อีกครั้ง" },
    error: { en: "Error retrieving data. Please check your connection.", th: "เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาตรวจสอบการเชื่อมต่อของคุณ" }
  };
  return translations[key][currentLang];
}

function resetApp() {
  document.getElementById("cityInput").value = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("forecast").innerHTML = "";
  document.getElementById("map").innerHTML = "";
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
}
