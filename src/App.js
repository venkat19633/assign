import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function App() {
  const [data, setData] = useState({});
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('');

  const API_KEY = 'cf41928b179eff9c53de603a32a61c28';

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${API_KEY}`;

  const searchLocation = async (event) => {
    if (event.key === 'Enter') {
      try {
        const weatherRes = await axios.get(weatherUrl);
        setData(weatherRes.data);

        const forecastRes = await axios.get(forecastUrl);
        // Filter to get 12:00:00 forecast for each day
        const daily = forecastRes.data.list.filter((item) => item.dt_txt.includes('12:00:00')).slice(0, 5);
        setForecast(daily);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLocation('');
    }
  };

  const chartData = {
    labels: forecast.map(item => new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        label: 'Daily Forecast (°C)',
        data: forecast.map(item => item.main.temp),
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderColor: 'rgba(255,255,255,0.8)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { ticks: { color: '#fff' } },
      y: { ticks: { color: '#fff' }, beginAtZero: true },
    },
  };

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={searchLocation}
          placeholder="Enter Location"
          type="text"
        />
      </div>

      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            {data.main && <h1>{data.main.temp.toFixed()}°C</h1>}
          </div>
          <div className="description">
            {data.weather && <p>{data.weather[0].main}</p>}
          </div>
        </div>

        {data.name &&
          <div className="bottom">
            <div className="feels">
              {data.main && <p className="bold">{data.main.feels_like.toFixed()}°C</p>}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main && <p className="bold">{data.main.humidity}%</p>}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind && <p className="bold">{data.wind.speed.toFixed()} m/s</p>}
              <p>Wind Speed</p>
            </div>
          </div>
        }

        {forecast.length > 0 && (
          <div style={{ marginTop: '2rem', width: '100%' }}>
            <h2 style={{ textAlign: 'center', color: '#fff' }}>5-Day Forecast</h2>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
