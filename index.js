const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const app = express();
const port = 3000;

// Настройка CORS
app.use(cors());

// Ограничение запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // ограничение на 100 запросов с одного IP за 15 минут
});

app.use(limiter);

// Настройка Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather API',
      version: '1.0.0',
      description: 'API для получения данных о погоде',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./index.js'], // Пути к файлам с аннотациями
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Weather:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           format: date-time
 *         data:
 *           type: object
 *           properties:
 *             instant:
 *               type: object
 *               properties:
 *                 details:
 *                   type: object
 *                   properties:
 *                     air_temperature:
 *                       type: number
 *                       example: 15
 *                     air_pressure_at_sea_level:
 *                       type: number
 *                       example: 1012
 *                     relative_humidity:
 *                       type: number
 *                       example: 60
 *                     wind_speed:
 *                       type: number
 *                       example: 5
 *                     wind_from_direction:
 *                       type: number
 *                       example: 180
 *                     cloud_area_fraction:
 *                       type: number
 *                       example: 20
 *             next_12_hours:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     symbol_code:
 *                       type: string
 *                       example: "partly_cloudy"
 */

/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Получить прогноз погоды
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Широта
 *       - in: query
 *         name: lon
 *         schema:
 *           type: number
 *         description: Долгота
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Weather'
 *       500:
 *         description: Ошибка сервера
 */
app.get('/api/weather', async (req, res) => {
  try {
    const { lat = 55.7558, lon = 37.6176 } = req.query; // координаты Москвы по умолчанию
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Dima' 
      }
    });
    const data = response.data;

    // Фильтрация данных для времени около 14:00
    const forecast = data.properties.timeseries.filter(ts => {
      const date = new Date(ts.time);
      const hours = date.getUTCHours();
      return hours === 11; // 14:00 по московскому времени (UTC+3)
    });

    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/coordinates:
 *   get:
 *     summary: Получить координаты по местоположению
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Название местоположения
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                   example: 55.7558
 *                 lng:
 *                   type: number
 *                   example: 37.6176
 *       500:
 *         description: Ошибка сервера
 */
app.get('/api/coordinates', async (req, res) => {
  try {
    const { location } = req.query;
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${location}&key=b2de9d791e7046b78b597eb4737cd6e3`);
    const { lat, lng } = response.data.results[0].geometry;
    res.json({ lat, lng });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Сервировка статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Обработка остальных маршрутов, чтобы возвращать index.html для фронтенда
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
