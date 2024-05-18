import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from './components/spinner.jsx';

function App() {
  const [weatherData, setWeatherData] = useState([]);
  const [location, setLocation] = useState('Moscow');
  const [lat, setLat] = useState(55.7558);
  const [lon, setLon] = useState(37.6176);
  const [newLat, setNewLat] = useState(55.7558);
  const [newLon, setNewLon] = useState(37.6176);
  const [isRussian, setIsRussian] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (latitude, longitude) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/weather?lat=${latitude}&lon=${longitude}`);
      setWeatherData(response.data);
    } catch (error) {
      setWeatherData([]);
    }
    setLoading(false);
  };

  const handleLocationChange = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/coordinates?location=${location}`);
      const { lat, lng } = response.data;
      setLat(lat);
      setLon(lng);
      await fetchWeather(lat, lng);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleCoordinatesChange = async () => {
    setLat(newLat);
    setLon(newLon);
    await fetchWeather(newLat, newLon);
  };

  useEffect(() => {
    fetchWeather(lat, lon);
  }, []);

  const toggleLanguage = () => {
    setIsRussian(!isRussian);
  };

  const openDocumentation = () => {
    window.open('http://localhost:3000/api-docs', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="mt-5 text-4xl font-bold mb-8">{isRussian ? 'Прогноз погоды' : 'Weather Forecast'}</h1>
      <div className="flex mb-6">
        <button
          onClick={toggleLanguage}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 mr-2"
        >
          {isRussian ? 'RU' : 'EN'}
        </button>
        <button
          onClick={openDocumentation}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
        >
          {isRussian ? 'Документация' : 'Documentation'}
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-2 border border-gray-400 rounded"
          placeholder={isRussian ? 'Введите местоположение' : 'Enter location'}
        />
        <button
          onClick={handleLocationChange}
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          {isRussian ? 'Получить прогноз' : 'Fetch Weather'}
        </button>
      </div>
      <div className="mb-4">
        <input
          type="number"
          value={newLat}
          onChange={(e) => setNewLat(parseFloat(e.target.value))}
          className="p-2 border border-gray-400 rounded no-spinner"
          placeholder={isRussian ? 'Введите широту' : 'Enter latitude'}
        />
        <input
          type="number"
          value={newLon}
          onChange={(e) => setNewLon(parseFloat(e.target.value))}
          className="ml-2 p-2 border border-gray-400 rounded no-spinner"
          placeholder={isRussian ? 'Введите долготу' : 'Enter longitude'}
        />
        <button
          onClick={handleCoordinatesChange}
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          {isRussian ? 'Получить прогноз' : 'Fetch Weather'}
        </button>
      </div>
      <div className="w-full max-w-2xl">
        {loading ? (
          <Spinner data-testid="spinner" />
        ) : (
          weatherData.length > 0 ? (
            weatherData.map((data, index) => (
              <div key={index} className="bg-white p-4 mb-4 rounded shadow">
                <p><strong>{isRussian ? 'Дата' : 'Date'}:</strong> {new Date(data.time).toLocaleString()}</p>
                <p><strong>{isRussian ? 'Температура' : 'Temperature'}:</strong> {data.data.instant?.details?.air_temperature}°C</p>
                <p><strong>{isRussian ? 'Давление' : 'Air Pressure'}:</strong> {data.data.instant?.details?.air_pressure_at_sea_level} hPa</p>
                <p><strong>{isRussian ? 'Влажность' : 'Humidity'}:</strong> {data.data.instant?.details?.relative_humidity}%</p>
                <p><strong>{isRussian ? 'Скорость ветра' : 'Wind Speed'}:</strong> {data.data.instant?.details?.wind_speed} m/s</p>
                <p><strong>{isRussian ? 'Направление ветра' : 'Wind Direction'}:</strong> {data.data.instant?.details?.wind_from_direction}°</p>
                <p><strong>{isRussian ? 'Облачность' : 'Cloudiness'}:</strong> {data.data.instant?.details?.cloud_area_fraction}%</p>
                <p><strong>{isRussian ? 'Символ погоды' : 'Weather Symbol'}:</strong> {data.data.next_12_hours?.summary?.symbol_code}</p>
              </div>
            ))
          ) : (
            <p>{isRussian ? 'Нет данных о погоде' : 'No weather data available'}</p>
          )
        )}
      </div>
    </div>
  );
}

export default App;
