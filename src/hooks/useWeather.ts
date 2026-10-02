import { useState, useEffect, useCallback } from 'react';

/**
 * WMO Weather Interpretation Codes (WW)
 * https://open-meteo.com/en/docs
 * 
 * 0      = Clear sky
 * 1-3    = Mainly clear, Partly cloudy, Overcast
 * 45, 48 = Fog / Depositing rime fog
 * 51-55  = Drizzle (light, moderate, dense)
 * 61-65  = Rain (slight, moderate, heavy)
 * 71-75  = Snowfall (slight, moderate, heavy)
 * 80-82  = Rain showers
 * 95, 96, 99 = Thunderstorm
 */

export type AtmosphericEffect =
  | 'clear'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'snow'
  | 'thunderstorm';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'golden_hour' | 'dusk' | 'night';

export interface WeatherData {
  // Raw API data
  temperature: number;        // °C
  humidity: number;            // %
  windSpeed: number;           // km/h
  weatherCode: number;         // WMO Code
  isDay: boolean;
  sunrise: string;             // ISO time
  sunset: string;              // ISO time

  // Derived atmospheric data
  effect: AtmosphericEffect;
  season: Season;
  timeOfDay: TimeOfDay;
  
  // UI theming hints
  overlayOpacity: number;      // 0-0.6 for dim overlay on map
  particleDensity: number;     // 0-1 particle density multiplier
  colorTemperature: 'warm' | 'neutral' | 'cool';
  
  // Metadata
  fetchedAt: Date;
  isLoading: boolean;
  error: string | null;
}

// Default Hanoi coordinates
const HANOI_LAT = 21.0378;
const HANOI_LNG = 105.8396;

// Open-Meteo free API (no key needed)
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

function deriveEffect(code: number): AtmosphericEffect {
  if (code === 0) return 'clear';
  if (code >= 1 && code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 55) return 'drizzle';
  if (code >= 56 && code <= 57) return 'drizzle'; // freezing drizzle
  if (code >= 61 && code <= 63) return 'rain';
  if (code >= 64 && code <= 65) return 'heavy_rain';
  if (code >= 66 && code <= 67) return 'rain'; // freezing rain
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'snow'; // snow showers
  if (code >= 95) return 'thunderstorm';
  return 'clear';
}

function deriveSeason(month: number): Season {
  // Vietnamese seasons (Northern Vietnam / Hanoi context)
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter'; // Dec, Jan
}

function deriveTimeOfDay(now: Date, sunrise: string, sunset: string): TimeOfDay {
  const hour = now.getHours();
  const sunriseHour = new Date(sunrise).getHours();
  const sunsetHour = new Date(sunset).getHours();

  if (hour >= sunriseHour - 1 && hour < sunriseHour + 1) return 'dawn';
  if (hour >= sunriseHour + 1 && hour < 12) return 'morning';
  if (hour >= 12 && hour < sunsetHour - 1) return 'afternoon';
  if (hour >= sunsetHour - 1 && hour < sunsetHour + 1) return 'golden_hour';
  if (hour >= sunsetHour + 1 && hour < sunsetHour + 2) return 'dusk';
  return 'night';
}

function deriveOverlayOpacity(effect: AtmosphericEffect, isDay: boolean): number {
  const base: Record<AtmosphericEffect, number> = {
    clear: 0.07, // Subtle warm golden tint on clear days
    cloudy: 0.05,
    fog: 0.15,
    drizzle: 0.08,
    rain: 0.12,
    heavy_rain: 0.2,
    snow: 0.1,
    thunderstorm: 0.25,
  };
  return isDay ? base[effect] : Math.min(base[effect] + 0.15, 0.5);
}

function deriveParticleDensity(effect: AtmosphericEffect): number {
  const map: Record<AtmosphericEffect, number> = {
    clear: 1.0, // Full atmospheric particle fidelity
    cloudy: 0.5,
    fog: 0.3,
    drizzle: 0.5,
    rain: 0.8,
    heavy_rain: 1.0,
    snow: 0.6,
    thunderstorm: 0.9,
  };
  return map[effect];
}

function deriveColorTemp(effect: AtmosphericEffect, timeOfDay: TimeOfDay): 'warm' | 'neutral' | 'cool' {
  if (timeOfDay === 'golden_hour' || timeOfDay === 'dawn') return 'warm';
  if (effect === 'clear') return 'warm'; // Sunny days are warm
  if (effect === 'snow' || effect === 'fog') return 'cool';
  if (effect === 'rain' || effect === 'heavy_rain' || effect === 'thunderstorm') return 'cool';
  return 'neutral';
}

const INITIAL_WEATHER: WeatherData = {
  temperature: 25,
  humidity: 75,
  windSpeed: 8,
  weatherCode: 0,
  isDay: true,
  sunrise: '',
  sunset: '',
  effect: 'clear',
  season: 'autumn',
  timeOfDay: 'morning',
  overlayOpacity: 0,
  particleDensity: 0,
  colorTemperature: 'neutral',
  fetchedAt: new Date(),
  isLoading: true,
  error: null,
};

// Cache key for localStorage
const CACHE_KEY = 'chupgibaygio_weather_cache';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function useWeather(lat = HANOI_LAT, lng = HANOI_LNG) {
  const [weather, setWeather] = useState<WeatherData>(() => {
    // Try to restore from cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - new Date(parsed.fetchedAt).getTime() < CACHE_TTL_MS) {
          return { ...parsed, fetchedAt: new Date(parsed.fetchedAt), isLoading: false, error: null };
        }
      }
    } catch { /* ignore */ }
    return INITIAL_WEATHER;
  });

  const fetchWeather = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lng.toString(),
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
        daily: 'sunrise,sunset',
        timezone: 'Asia/Ho_Chi_Minh',
        forecast_days: '1',
      });

      const res = await fetch(`${OPEN_METEO_URL}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const current = data.current;
      const daily = data.daily;
      const now = new Date();

      const weatherCode = current.weather_code ?? 0;
      const isDay = current.is_day === 1;
      const sunrise = daily.sunrise?.[0] ?? '';
      const sunset = daily.sunset?.[0] ?? '';

      const effect = deriveEffect(weatherCode);
      const season = deriveSeason(now.getMonth() + 1);
      const timeOfDay = deriveTimeOfDay(now, sunrise, sunset);

      const newWeather: WeatherData = {
        temperature: Math.round(current.temperature_2m ?? 25),
        humidity: Math.round(current.relative_humidity_2m ?? 75),
        windSpeed: Math.round(current.wind_speed_10m ?? 8),
        weatherCode,
        isDay,
        sunrise,
        sunset,
        effect,
        season,
        timeOfDay,
        overlayOpacity: deriveOverlayOpacity(effect, isDay),
        particleDensity: deriveParticleDensity(effect),
        colorTemperature: deriveColorTemp(effect, timeOfDay),
        fetchedAt: now,
        isLoading: false,
        error: null,
      };

      setWeather(newWeather);

      // Persist to cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(newWeather));
      } catch { /* quota exceeded, ignore */ }

    } catch (err) {
      setWeather(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchWeather();

    // Re-fetch every 15 minutes
    const interval = setInterval(fetchWeather, CACHE_TTL_MS);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return weather;
}
