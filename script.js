const API_BASE = "http://localhost:8082/api/weather";

const cityInput = document.getElementById("cityInput");
const fetchBtn = document.getElementById("fetchBtn");
const weatherCard = document.getElementById("weatherCard");
const predictionCard = document.getElementById("prediction");
const historySection = document.getElementById("historySection");
const themeToggle = document.getElementById("themeToggle");

fetchBtn.addEventListener("click", fetchWeather);
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

async function fetchWeather() {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city name!");

  try {
    
    const res = await fetch(`${API_BASE}/${city}`);
    if (!res.ok) throw new Error("Failed to fetch weather");
    const data = await res.json();

   
    document.getElementById("cityName").textContent = data.city;
    document.getElementById("condition").textContent = `Condition: ${data.condition}`;
    document.getElementById("temperature").textContent = `🌡️ ${data.temperature}°C`;
    document.getElementById("humidity").textContent = `💧 Humidity: ${data.humidity}%`;
    document.getElementById("alert").textContent = data.alert;
    weatherCard.classList.remove("hidden");

    // 🎤 बोलून दाखव AI voice
    speakWeather(data.city, data.condition, data.temperature, data.humidity);

    // ✅ Predict next temperature
    const pred = await fetch(`${API_BASE}/predict/${city}`);
    const predData = await pred.json();
    document.getElementById("predictedTemp").textContent =
      `${predData.predictedTemperature.toFixed(1)}°C (Next day prediction)`;
    predictionCard.classList.remove("hidden");

    // ✅ Fetch history and draw chart
    const historyRes = await fetch(`${API_BASE}/history/${city}`);
    const history = await historyRes.json();
    drawChart(history);

  } catch (err) {
    alert("Error fetching data! Check backend and API key.");
    console.error(err);
  }
}

// 🔊 Text-to-Speech (AI Voice Assistant)
function speakWeather(city, condition, temp, humidity) {
  const message = `The temperature in ${city} is ${temp} degree Celsius with ${condition} and humidity of ${humidity} percent.`;
  const speech = new SpeechSynthesisUtterance(message);
  speech.lang = "en-IN";
  speech.rate = 1; 
  speech.pitch = 1; 
  speech.volume = 1; 
  window.speechSynthesis.speak(speech);
}

// 📊 Draw temperature history chart
function drawChart(history) {
  historySection.classList.remove("hidden");
  const ctx = document.getElementById("historyChart").getContext("2d");
  const labels = history.map(h => h.timestamp.split("T")[0]);
  const temps = history.map(h => h.temperature);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperature (°C)",
        data: temps,
        fill: false,
        borderColor: "#007bff",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}
