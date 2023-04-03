// importing the api key with other neccessary options
import { WEATHERAPIKEYOPTIONS, AQIAPIKEYOPTIONS } from './apiKey.js';


// method for converting string to title case
const toTitleCase = (str) => {
  let words = str.trim().split(' ');
  let titleCaseWords = words.map((word) => {
    return (word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  });
  let titleCaseStr = titleCaseWords.reduce((word1, word2) => {
    return (word1 + " " + word2);
  });
  return titleCaseStr;
};

// method for fetching current geolocation and fetching weather
const fetchCityWeatherByGeolocation = (position) => {
  let query = WEATHERAPIKEYOPTIONS['endpointUrl'] + WEATHERAPIKEYOPTIONS['parameters'][0] + "=" + position['coords']['latitude'] + "&" + WEATHERAPIKEYOPTIONS['parameters'][1] + "=" + position['coords']['longitude'];
  // fetching data from api
  fetch(query, WEATHERAPIKEYOPTIONS['options'])
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        // trigger error message modal
        let errorMessageModal = new bootstrap.Modal('#errorMessageModal', {
          'backdrop': 'static',
          'focus': true,
          'keyboard': true
        });
        errorMessageModal.show();
        // compiling and displaying the compiled error template
        let weatherApiErrorTemplate = $('#weatherApiErrorTemplate').html();
        let compiledWeatherApiErrorTemplate = Handlebars.compile(weatherApiErrorTemplate);
        $('#errorModalContent').html(compiledWeatherApiErrorTemplate);
      }
    })
    .then((responseData) => {
      // populate city weather data if no error encountered
      if (responseData) {
        populateCityWeather(undefined, responseData);
      }
    })
    .catch((err) => {
      console.log("Error encountered while fetching api data from server!")
    });
};

// method for fetching current geolocation and fetching AQI
const fetchCityAqiByGeolocation = (position) => {
  let query = AQIAPIKEYOPTIONS['endpointUrl'] + AQIAPIKEYOPTIONS['parameters'][0] + "=" + position['coords']['latitude'] + "&" + AQIAPIKEYOPTIONS['parameters'][1] + "=" + position['coords']['longitude'];
  // fetching data from api
  fetch(query, AQIAPIKEYOPTIONS['options'])
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        // trigger error message modal
        $('#errorMessageModal').modal('show');
        // compiling and displaying the compiled error template
        let aqiApiErrorTemplate = $('#aqiApiErrorTemplate').html();
        let compiledAqiApiErrorTemplate = Handlebars.compile(aqiApiErrorTemplate);
        $('#errorModalContent').html(compiledAqiApiErrorTemplate);
      }
    })
    .then((responseData) => {
      // populate city weather data if no error encountered
      if (responseData) {
        populateCityAqi(undefined, responseData);
      }
    })
    .catch((err) => {
      console.log("Error encountered while fetching api data from server!")
    });
};

// method for popping up error modal for geolocation problem
const showGeolocationError = (geoError) => {
  let errorMessage;
  if (geoError['code'] == 1) {
    errorMessage = 'You have denied access to your location ! Please allow location permissions from settings for getting your current location weather Information'
  } else {
    errorMessage = 'Unknown error encountered while fetching your Location ! Please try again after sometime';
  }
  // trigger error message modal
  let errorMessageModal = new bootstrap.Modal('#errorMessageModal', {
    'backdrop': 'static',
    'focus': true,
    'keyboard': true
  });
  errorMessageModal.show();
  // compiling and displaying the compiled error template
  let geolocationApiErrorTemplate = $('#geolocationApiErrorTemplate').html();
  let compiledGeolocationApiErrorTemplate = Handlebars.compile(geolocationApiErrorTemplate)({ message: errorMessage });
  $('#errorModalContent').html(compiledGeolocationApiErrorTemplate);
}

// method for fetching weather data from api
const fetchCityWeatherByCityName = (cityName) => {
  let weatherApiQuery = WEATHERAPIKEYOPTIONS['endpointUrl'] + "city" + "=" + cityName;
  let aqiApiQuery = AQIAPIKEYOPTIONS['endpointUrl'] + "city" + "=" + cityName;
  // fetching data from weather api
  fetch(weatherApiQuery, WEATHERAPIKEYOPTIONS['options'])
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        // trigger error message modal
        $('#errorMessageModal').modal('show');
        // compiling and displaying the compiled error template
        let weatherApiErrorTemplate = $('#weatherApiErrorTemplate').html();
        let compiledWeatherApiErrorTemplate = Handlebars.compile(weatherApiErrorTemplate);
        $('#errorModalContent').html(compiledWeatherApiErrorTemplate);
      }
    })
    .then((responseData) => {
      // populate city weather data if no error encountered
      if (responseData) {
        populateCityWeather(cityName, responseData);
      }
    })
    .catch((err) => {
      console.log("Error encountered while fetching api data from server!")
    });
};

// method for fetching aqi data from api
const fetchCityAqiByCityName = (cityName) => {
  let aqiApiQuery = AQIAPIKEYOPTIONS['endpointUrl'] + "city" + "=" + cityName;
  // fetching data from aqi api
  fetch(aqiApiQuery, AQIAPIKEYOPTIONS['options'])
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        // trigger error message modal
        $('#errorMessageModal').modal('show');
        // compiling and displaying the compiled error template
        let aqiApiErrorTemplate = $('#aqiApiErrorTemplate').html();
        let compiledAqiApiErrorTemplate = Handlebars.compile(aqiApiErrorTemplate);
        $('#errorModalContent').html(compiledAqiApiErrorTemplate);
      }
    })
    .then((responseData) => {
      // populate city weather data if no error encountered
      if (responseData) {
        populateCityAqi(cityName, responseData);
      }
    })
    .catch((err) => {
      console.log("Error encountered while fetching api data from server!")
    });
};

// method for populating the AQI data received from api
const populateCityAqi = (cityName, responseData) => {
  let aqiCityHeader;
  if (!cityName) {
    aqiCityHeader = 'Air Quality Index (AQI) of current location';
  } else {
    aqiCityHeader = 'Air Quality Index (AQI) of ' + toTitleCase(cityName);
  }
  $('#aqiCityHeader').html(aqiCityHeader);
  let respData = { ...responseData };
  let maxAqi = 0;
  let mainPollutant = '';
  respData['overall_aqi'] = { 'aqi': respData['overall_aqi'] };
  for (let key in respData) {
    if (respData[key]['aqi'] > maxAqi) {
      maxAqi = respData[key]['aqi'];
      mainPollutant = key;
    }
    respData[key]['width'] = parseInt((respData[key]['aqi'] / 500 * 100).toFixed(0));
    if (respData[key]['aqi'] <= 50) {
      respData[key]['pollutant'] = key;
      respData[key]['bgColor'] = '#00e400';
      respData[key]['concernLevel'] = 'Good, air quality is satisfactory';
    }
    else if (respData[key]['aqi'] <= 100) {
      respData[key]['pollutant'] = key;
      respData[key]['bgColor'] = '#ffc107';
      respData[key]['concernLevel'] = 'Moderate, air quality is acceptable';
    }
    else if (respData[key]['aqi'] <= 150) {
      respData[key]['pollutant'] = key;
      respData[key]['bgColor'] = '#ff7e00';
      respData[key]['concernLevel'] = 'Unhealthy for Sensitive Groups, may experience health effects';
    }
    else if (respData[key]['aqi'] <= 200) {
      respData[key]['pollutant'] = key;
      respData[key]['bgColor'] = '#ff0000';
      respData[key]['concernLevel'] = 'Unhealthy, general public may experience health effects';
    }
    else if (respData[key]['aqi'] <= 300) {
      respData[key]['pollutant'] = key;
      respData[key]['bgColor'] = '#99004c';
      respData[key]['concernLevel'] = 'Very unhealthy, health alert';
    }
    else {
      respData[key]['pollutant'] = key;
      respData[key]['bgColor'] = '#7e0023';
      respData[key]['concernLevel'] = 'Hazardous, health warning of emergency conditions';
    }
  }
  respData['overall_aqi']['mainPollutant'] = mainPollutant;
  // populating aqi api data
  let overallAqiDataTemplate = $('#overallAqiDataTemplate').html();
  let compiledOverallAqiDataTemplate = Handlebars.compile(overallAqiDataTemplate)(respData['overall_aqi']);
  $('#overallAqiTableData').html(compiledOverallAqiDataTemplate);
  for (let key in respData) {
    if (key == 'overall_aqi') {
      continue;
    }
    let aqiTableDataTemplate = $('#aqiTableDataTemplate').html();
    let compiledAqiTableDataTemplate = Handlebars.compile(aqiTableDataTemplate)(respData[key]);
    $('#aqiTableData').append(compiledAqiTableDataTemplate);
  }
};

// method for populating the weather data received from api
const populateCityWeather = (cityName, responseData) => {
  // setting and populating city name headers
  let weatherCityHeader;
  if (!cityName) {
    weatherCityHeader = 'Weather of current location';
  } else {
    weatherCityHeader = 'Weather of ' + toTitleCase(cityName);
  }
  $('#weatherCityHeader').html(weatherCityHeader);
  // populating weather api data
  $('#currTemp').html(responseData['temp']);
  $('#currMaxTemp').html(responseData['max_temp']);
  $('#currMinTemp').html(responseData['min_temp']);
  $('#currWind').html(responseData['wind_speed']);
  $('#currWindSpeed').html(responseData['wind_speed']);
  $('#currWindDegrees').html(responseData['wind_degrees']);
  $('#currHumidityInfo').html(responseData['humidity']);
  $('#currHumidity').html(responseData['humidity']);
  $('#currCloudCover').html(responseData['cloud_pct']);
};

// method for fetching other city weather report
const fetchOtherCityWeatherReport = (cityNames) => {
  // object holding weather report corresponding to each city
  for (let i = 0; i < cityNames.length; i++) {
    let query = WEATHERAPIKEYOPTIONS['endpointUrl'] + "city" + "=" + cityNames[i];
    // fetching data from api
    fetch(query, WEATHERAPIKEYOPTIONS['options'])
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((responseData) => {
        // populate city weather data if no error encountered
        if (responseData) {
          // adding a new key value pair with the city name
          responseData['cityName'] = toTitleCase(cityNames[i]);
          // compiling the handlebars template and appending the fetched weather data
          let weatherTableDataTemplate = $('#weatherTableDataTemplate').html();
          let handlebarsCompiledWeatherTableData = Handlebars.compile(weatherTableDataTemplate)(responseData);
          $('#weatherTableData').append(handlebarsCompiledWeatherTableData);
        }
      });
  }
};

// method for resetting all the necessary dynamic containers
const resetDynamicContainers = (isCitySearched = false) => {
  // resetting city name input field
  $('#cityName').val('');
  // resetting the weather info section
  $('#weatherCityHeader').html('Weather of ----');
  $('#currTemp').html('--');
  $('#currMaxTemp').html('--');
  $('#currMinTemp').html('--');
  $('#currWind').html('--');
  $('#currWindSpeed').html('--');
  $('#currWindDegrees').html('--');
  $('#currHumidityInfo').html('--');
  $('#currHumidity').html('--');
  $('#currCloudCover').html('--');
  // resetting the aqi section
  $('#aqiCityHeader').html('Air Quality Index (AQI) of ----');
  $('#overallAqiTableData').html('');
  $('#aqiTableData').html('');
  // resetting the common citites weather section if no weather for city searched
  if (!isCitySearched) {
    $('#weatherTableData').html('');
  }
};

$(document).ready(() => {
  // fecth and display weather report of other cities
  fetchOtherCityWeatherReport(['Delhi', 'Kolkata', 'Chennai', 'Mumbai', 'Bangalore', 'Hyderabad']);
  // fetch geolocation and display the current location weather
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      // invoking city weather by geolocation method
      fetchCityWeatherByGeolocation(pos);
      // invoking city aqi by geolocation method
      fetchCityAqiByGeolocation(pos);
    }, showGeolocationError);
  } else {
    let errorMessage = 'Your browser does not support geolocation ! Please upgrade to the latest version';
    // trigger error message modal
    $('#errorMessageModal').modal('show');
    // compiling and displaying the compiled error template
    let geolocationApiErrorTemplate = $('#geolocationApiErrorTemplate').html();
    let compiledGeolocationApiErrorTemplate = Handlebars.compile(geolocationApiErrorTemplate)({ message: errorMessage });
    $('#errorModalContent').prepend(compiledGeolocationApiErrorTemplate);
  }
  setTimeout(() => {
    $('#pageLoadSpinnerWrapper').css({
      'opacity': '0',
      'display': 'none',
    });
  }, 2000);

});

// adding event listener to submit button
$('#btnSearch').on('click', (e) => {
  // preventing the default reload behaviour of browser
  e.preventDefault();
  let cityName = $('#cityName').val();
  if (cityName == '') {
    // compiling and displaying the error toast notification
    let errorMessage = 'Please specify a valid city name !';
    let toastSearchErrorTemplate = $('#toastSearchErrorTemplate').html();
    let compiledToastSearchErrorTemplate = Handlebars.compile(toastSearchErrorTemplate)({ 'message': errorMessage });
    $('#toastContainer').html(compiledToastSearchErrorTemplate);
    let toastSearchErrorNotification = new bootstrap.Toast('#toastSearchErrorNotification', {
      'animation': true,
      'autohide': true,
      'delay': 3000
    });
    toastSearchErrorNotification.show();
  } else {
    // reset the dynamic containers
    resetDynamicContainers(true);
    // fetch and display city weather data
    fetchCityWeatherByCityName(cityName);
    // fetch and display city aqi data
    fetchCityAqiByCityName(cityName);
  }
});