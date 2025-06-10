// src/tmdb.js
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // Si usas Vite
const BASE_URL = "https://api.themoviedb.org/3";

export async function fetchPopularMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`);
  const data = await res.json();
  return data.results;
}

export async function fetchPopularTV() {
  const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES&page=1`);
  const data = await res.json();
  return data.results;
}

