// weather api key options
export const WEATHERAPIKEYOPTIONS = {
    'options': {
        method: "GET",
        headers: {
            // your rapid api key for Weather API here
            "X-RapidAPI-Key": "{your api key here}",
            "X-RapidAPI-Host": "weather-by-api-ninjas.p.rapidapi.com",
        },
    },
    'endpointUrl': 'https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?',
    'parameters': ['lat', 'lon', 'zip', 'city', 'state', 'country']
};

// air quality index api key options
export const AQIAPIKEYOPTIONS = {
    'options': {
        method: 'GET',
        headers: {
            // your rapid api key for Air Quality API here
            'X-RapidAPI-Key': '{your api key here}',
            'X-RapidAPI-Host': 'air-quality-by-api-ninjas.p.rapidapi.com'
        }
    },
    'endpointUrl': 'https://air-quality-by-api-ninjas.p.rapidapi.com/v1/airquality?',
    'parameters': ['lat', 'lon', 'zip', 'city', 'state', 'country']
};