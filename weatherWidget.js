document.addEventListener("DOMContentLoaded", function () {
    class WeatherWidget extends HTMLElement {
        constructor() {
            super();

            const shadow = this.attachShadow({ mode: "open" });

            const style = document.createElement("style");
            style.textContent = `
                .weather-widget {
                    align-items: center; 
                    border: 1px solid #4287f5;
                    padding: 1.5rem;
                    margin: 1rem;
                    border-radius: 2rem;
                }

                .weather-heading {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                }

                .weather-date {
                    font-weight: bold;
                }

                .weather-icon {
                    width: 3rem;
                    height: 3rem;
                }
            `;

            shadow.appendChild(style);

            const container = document.createElement("div");
            container.classList.add("weather-widget");

            const heading = document.createElement("h2");
            heading.classList.add("weather-heading");
            heading.textContent = "La Jolla - Current Weather";
            container.appendChild(heading);

            shadow.appendChild(container);
        }

        connectedCallback() {
            this.fetchWeatherData();
        }

        fetchData(url) {
            return fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                    throw error;
                });
        }

        fetchWeatherData() {
            const weatherURL = 'https://api.weather.gov/points/32.8328,-117.2713';

            this.fetchData(weatherURL)
                .then(data => {
                    const forecastURL = data.properties.forecast;
                    return this.fetchData(forecastURL);
                })
                .then(data => {
                    const currentWeather = data.properties.periods[0];
                    this.renderWeatherWidget(currentWeather);
                })
                .catch(error => {
                    this.renderError();
                });
        }

        renderWeatherWidget(data) {
            const container = this.shadowRoot.querySelector(".weather-widget");

            const iconMap = {
                "clear": "clear-icon.svg",
                "rain": "rain-icon.svg",
                "cloudy": "cloudy-icon.svg",
                "fog": "fog-icon.svg",
                "default": "default-icon.svg",
            };

            const forecastKeyword = this.getForecastKeyword(data.shortForecast);
            const iconFilename = iconMap[forecastKeyword] || iconMap["default"];

            container.innerHTML += `
                <p class="weather-date">${data.name}</p>
                <p>${data.shortForecast}</p>
                <img src="${iconFilename}" alt="Weather Icon" class="weather-icon">
                <p>Temperature: ${data.temperature} °${data.temperatureUnit}</p>
                <p>Wind: ${data.windSpeed} ${data.windDirection}</p>
                <p>Humidity: ${data.relativeHumidity.value}%</p>
            `;
        }

        renderError() {
            const container = this.shadowRoot.querySelector(".weather-widget");

            const errorMessage = document.createElement("p");
            errorMessage.textContent = "Current Weather Conditions Unavailable";
            container.appendChild(errorMessage);
        }

        getForecastKeyword(shortForecast) {
            const lowercaseForecast = shortForecast.toLowerCase();

            if (lowercaseForecast.includes("clear") || lowercaseForecast.includes("sunny")) {
                return "clear";
            } else if (lowercaseForecast.includes("rain")) {
                return "rain";
            } else if (lowercaseForecast.includes("cloudy")) {
                return "cloudy";
            } else if (lowercaseForecast.includes("fog")) {
                return "fog";
            } else {
                return "default"; 
            }
        }
    }

    customElements.define("weather-widget", WeatherWidget);
});
