import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  geocodeCity,
  getCurrentWeather,
  getDailyForecast,
} from "../services/openMeteo";
import { getWeatherInfo } from "../utils/weatherCode";

// Formate une date ISO (YYYY-MM-DD) en format lisible (ex: sam. 13 déc.)
function formatDateFR(dateStr) {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(d);
}

export default function Weather() {
  // Valeur tapée dans l'input
  const [cityInput, setCityInput] = useState("Lyon");
  // Ville réellement utilisée pour lancer les requêtes
  const [city, setCity] = useState("Lyon");

  // 1) Géocodage : ville -> coordonnées
  const geoQuery = useQuery({
    queryKey: ["geocode", city],
    queryFn: ({ signal }) => geocodeCity(city, { signal }),
    enabled: Boolean(city?.trim()),
    staleTime: 1000 * 60 * 10,
  });

  // Coordonnées extraites du résultat de géocodage
const coords = useMemo(() => {
  if (!geoQuery.data) return null;
  return {
    latitude: geoQuery.data.latitude,
    longitude: geoQuery.data.longitude,
  };
}, [geoQuery.data]);

// Ville réellement trouvée par l’API (nom + pays)
const resolvedCity = geoQuery.data
  ? `${geoQuery.data.name} (${geoQuery.data.country})`
  : city;


  // Si la requête geo a fini mais n'a rien trouvé (coords = null)
const noResult = !geoQuery.isLoading && !geoQuery.isError && !coords;


  // 2) Météo actuelle : coordonnées -> current weather
  const weatherQuery = useQuery({
    queryKey: ["currentWeather", coords?.latitude, coords?.longitude],
    queryFn: ({ signal }) => getCurrentWeather(coords, { signal }),
    enabled: Boolean(coords),
    staleTime: 1000 * 60 * 2,
  });

  // 3) Prévisions 7 jours : coordonnées -> daily forecast
  const dailyQuery = useQuery({
    queryKey: ["dailyForecast", coords?.latitude, coords?.longitude],
    queryFn: ({ signal }) => getDailyForecast(coords, { signal }),
    enabled: Boolean(coords),
    staleTime: 1000 * 60 * 10,
  });

  function onSubmit(e) {
    e.preventDefault();
    setCity(cityInput.trim());
  }

  // États globaux
  const isLoading = geoQuery.isLoading || weatherQuery.isLoading || dailyQuery.isLoading;
  const isError = geoQuery.isError || weatherQuery.isError || dailyQuery.isError;

  const errorMessage =
    geoQuery.error?.message ||
    weatherQuery.error?.message ||
    dailyQuery.error?.message ||
    null;

  // Données météo actuelles
  const current = weatherQuery.data?.current ?? null;
  const temp = current?.temperature_2m;
  const wind = current?.wind_speed_10m;
  const code = current?.weather_code;

  const weatherInfo = getWeatherInfo(code);

  // Mise en forme des 7 jours
  const days = useMemo(() => {
    const daily = dailyQuery.data?.daily;
    if (!daily) return [];

    const { time, temperature_2m_max, temperature_2m_min, weather_code } = daily;

    return time.map((dateStr, i) => {
      const info = getWeatherInfo(weather_code?.[i]);
      return {
        dateStr,
        tMax: temperature_2m_max?.[i],
        tMin: temperature_2m_min?.[i],
        code: weather_code?.[i],
        label: info.label,
        icon: info.icon,
      };
    });
  }, [dailyQuery.data]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Mini station météo</h1>

        {/* Formulaire */}
        <form onSubmit={onSubmit} className="flex gap-2 mb-6">
          <input
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Entrez une ville (ex : Lyon)"
            className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
          aria-label="ville"
          autoComplete="off"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 font-medium"
          >
            Rechercher
          </button>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            Chargement…
          </div>
        )}

        {/* Erreur */}
        {isError && (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-4">
            Erreur : {errorMessage}
          </div>
        )}

        {/* Aucun résultat */}
{noResult && (
  <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-zinc-300">
    Aucune ville trouvée pour : <span className="font-semibold">{city}</span>
  </div>
)}

        {/* Résultat */}
        {!isLoading && !isError && coords && (
          <div className="space-y-6">
            {/* Météo actuelle */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Ville</p>
                <p className="text-xl font-semibold">{resolvedCity}</p>

                </div>
                <div className="text-4xl">{weatherInfo.icon}</div>
              </div>

              <p className="mt-2 text-zinc-300">{weatherInfo.label}</p>

              <div className="mt-4 flex gap-6">
                <p>
                  Temp : <span className="font-semibold">{temp ?? "—"}°C</span>
                </p>
                <p className="text-zinc-300">
                  Vent : <span className="font-semibold">{wind ?? "—"} km/h</span>
                </p>
              </div>
            </div>

            {/* Prévisions 7 jours */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Prévisions 7 jours</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {days.map((d) => (
                  <div
                    key={d.dateStr}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{formatDateFR(d.dateStr)}</p>
                        <span className="text-2xl">{d.icon}</span>
                      
                    </div>

                    <p className="text-zinc-400 text-sm mt-1">{d.label}</p>

                    <div className="mt-3 flex items-baseline gap-3">
                      <p className="text-zinc-100">
                        Max : <span className="font-semibold">{d.tMax ?? "—"}°C</span>
                      </p>
                      <p className="text-zinc-300">
                        Min : <span className="font-semibold">{d.tMin ?? "—"}°C</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
