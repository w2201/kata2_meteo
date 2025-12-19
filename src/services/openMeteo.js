// src/services/openMeteo.js
// Petit client Open-Meteo + géocodage (villes -> coordonnées)
// On exporte bien DES EXPORTS NOMMÉS : geocodeCity, getCurrentWeather, getDailyForecast

const GEOCODE_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Géocodage : convertit un nom de ville en coordonnées { latitude, longitude, name, country }
 */
export async function geocodeCity(city, { signal } = {}) {
  const url = new URL(GEOCODE_BASE_URL);
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "fr");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Erreur géocodage : ${res.status}`);

  const data = await res.json();

  const first = data?.results?.[0];
  if (!first) throw new Error("Ville introuvable. Essaie une autre orthographe.");

  return {
    latitude: first.latitude,
    longitude: first.longitude,
    name: first.name,
    country: first.country,
  };
}

/**
 * Météo actuelle : récupère current (température, vent, code météo)
 */
export async function getCurrentWeather(coords, { signal } = {}) {
  if (!coords?.latitude || !coords?.longitude) {
    throw new Error("Coordonnées invalides pour la météo actuelle.");
  }

  const url = new URL(FORECAST_BASE_URL);
  url.searchParams.set("latitude", String(coords.latitude));
  url.searchParams.set("longitude", String(coords.longitude));
  url.searchParams.set("current", "temperature_2m,wind_speed_10m,weather_code");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Erreur météo actuelle : ${res.status}`);

  return res.json();
}

/**
 * Prévisions 7 jours : récupère daily (min/max + code météo)
 */
export async function getDailyForecast(coords, { signal } = {}) {
  if (!coords?.latitude || !coords?.longitude) {
    throw new Error("Coordonnées invalides pour les prévisions.");
  }

  const url = new URL(FORECAST_BASE_URL);
  url.searchParams.set("latitude", String(coords.latitude));
  url.searchParams.set("longitude", String(coords.longitude));
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code"
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Erreur prévisions : ${res.status}`);

  return res.json();
}
