import { useMemo } from 'react';
import countriesData from '../data/countries.json';

interface City {
  name: string;
  state: string;
}

interface State {
  name: string;
  cities: string[];
}

interface Country {
  code: string;
  name: string;
  region: string;
  states: State[];
}

interface CountriesData {
  countries: Country[];
}

export function useCountries(userCountryCode?: string) {
  const data = countriesData as CountriesData;

  // Ordenar países: usuario primero, luego Latinoamérica, luego resto
  const sortedCountries = useMemo(() => {
    const latinAmerica = data.countries.filter(c => c.region === 'latinoamerica');
    const others = data.countries.filter(c => c.region !== 'latinoamerica');

    // Si hay país de usuario, ponerlo primero
    if (userCountryCode) {
      const userCountry = data.countries.find(c => c.code === userCountryCode);
      const latinAmericaWithoutUser = latinAmerica.filter(c => c.code !== userCountryCode);
      const othersWithoutUser = others.filter(c => c.code !== userCountryCode);

      if (userCountry) {
        return [userCountry, ...latinAmericaWithoutUser, ...othersWithoutUser];
      }
    }

    return [...latinAmerica, ...others];
  }, [userCountryCode]);

  // Obtener país por código
  const getCountry = (code: string): Country | undefined => {
    return data.countries.find(c => c.code === code);
  };

  // Obtener estados de un país
  const getStates = (countryCode: string): State[] => {
    const country = getCountry(countryCode);
    return country?.states || [];
  };

  // Obtener ciudades de un país
  const getCities = (countryCode: string): City[] => {
    const country = getCountry(countryCode);
    if (!country) return [];

    const cities: City[] = [];
    country.states.forEach(state => {
      state.cities.forEach(city => {
        cities.push({ name: city, state: state.name });
      });
    });

    return cities.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Buscar estado de una ciudad
  const getStateByCity = (countryCode: string, cityName: string): string | undefined => {
    const country = getCountry(countryCode);
    if (!country) return undefined;

    for (const state of country.states) {
      if (state.cities.includes(cityName)) {
        return state.name;
      }
    }

    return undefined;
  };

  return {
    countries: sortedCountries,
    getCountry,
    getStates,
    getCities,
    getStateByCity,
  };
}
