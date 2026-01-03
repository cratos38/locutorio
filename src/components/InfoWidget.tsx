"use client";

import { useEffect, useState } from 'react';

type WeatherData = {
  main: {
    temp: number;
  };
  name: string;
};

type BCVData = {
  price: string;
};

export default function InfoWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [bcv, setBcv] = useState<BCVData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener clima de Caracas usando Open-Meteo (100% gratis, sin API key)
    fetch('https://api.open-meteo.com/v1/forecast?latitude=10.4806&longitude=-66.9036&current_weather=true&timezone=America/Caracas')
      .then(res => res.json())
      .then(data => {
        if (data.current_weather) {
          setWeather({ 
            main: { temp: data.current_weather.temperature },
            name: 'Caracas'
          });
        }
      })
      .catch(() => {
        // Fallback si falla la API
        setWeather({ main: { temp: 28 }, name: 'Caracas' });
      });

    // Obtener tasa BCV
    fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar/page/bcv')
      .then(res => res.json())
      .then(data => {
        if (data.price) {
          setBcv(data);
        }
      })
      .catch(() => {
        // Fallback si falla la API
        setBcv({ price: '36.50' });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Tiempo - PRIMERO */}
      {weather && (
        <div className="flex items-center gap-1.5 text-gray-300 hover:text-primary transition-colors">
          <span className="text-base">🌤️</span>
          <span className="font-medium">{Math.round(weather.main.temp)}°C</span>
        </div>
      )}
      
      {/* Separador */}
      <span className="text-gray-600">|</span>
      
      {/* BCV - DESPUÉS (con símbolo $) */}
      {bcv && (
        <div className="flex items-center gap-1.5 text-gray-300 hover:text-primary transition-colors">
          <span className="font-medium">$ {bcv.price} Bs</span>
        </div>
      )}
    </div>
  );
}
