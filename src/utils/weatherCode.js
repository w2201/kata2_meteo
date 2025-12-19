// src/utils/weatherCode.js

// Dictionnaire simplifié : code météo -> libellé + emoji
// Référence : Open-Meteo Weather interpretation codes
export const WEATHER_CODE_MAP = {
  0:  { label: "Ciel dégagé", icon: "☀️" },
  1:  { label: "Principalement dégagé", icon: "🌤️" },
  2:  { label: "Partiellement nuageux", icon: "⛅" },
  3:  { label: "Couvert", icon: "☁️" },

  45: { label: "Brouillard", icon: "🌫️" },
  48: { label: "Brouillard givrant", icon: "🌫️" },

  51: { label: "Bruine faible", icon: "🌦️" },
  53: { label: "Bruine modérée", icon: "🌦️" },
  55: { label: "Bruine forte", icon: "🌧️" },

  61: { label: "Pluie faible", icon: "🌧️" },
  63: { label: "Pluie modérée", icon: "🌧️" },
  65: { label: "Pluie forte", icon: "🌧️" },

  71: { label: "Neige faible", icon: "🌨️" },
  73: { label: "Neige modérée", icon: "🌨️" },
  75: { label: "Neige forte", icon: "❄️" },

  80: { label: "Averses faibles", icon: "🌦️" },
  81: { label: "Averses modérées", icon: "🌦️" },
  82: { label: "Averses fortes", icon: "⛈️" },

  95: { label: "Orage", icon: "⛈️" },
};

// Fonction helper : retourne un objet {label, icon} ou une valeur par défaut
export function getWeatherInfo(code) {
  return WEATHER_CODE_MAP[code] ?? { label: "Météo inconnue", icon: "❔" };
}
