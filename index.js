const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/weather', async(req, res) => {
    const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';

    if (!city) {
        return res.status(400).json({error: 'A city is required.'});
    }

    if (!process.env.API_KEY) {
        console.error('Weather API key is not configured');
        return res.status(500).json({error: 'Weather service is not configured.'});
    }

    try{
        const params = new URLSearchParams({
            key: process.env.API_KEY,
            q: city,
            days: '7'
        });
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?${params}`, {
            compress: false
        });
        if(!response.ok){
            let message = 'Failed to fetch weather data.';
            try {
                const errorData = await response.json();
                if (errorData?.error?.message) {
                    message = errorData.error.message;
                }
            } catch {
                // Keep the generic message when the upstream response is not JSON.
            }
            console.error('Weather API responded with status', response.status, message);
            return res.status(response.status).json({error: message});
        }

        const data = await response.json();
        res.json(data);
    }catch(error) {
        console.error("Weather API error:", error);
        res.status(500).json({ error: 'Error fetching weather data.'})
    }
})

app.listen(PORT, () => {
    console.log(`Server is Running ${PORT}`)
});