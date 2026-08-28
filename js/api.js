const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

/**
 * Envoie une requête à l’API OCMovies et retourne les données JSON.
 *
 * @param {string} path Chemin relatif de l’endpoint API.
 * @param {Record<string, string | number>} [params] Paramètres de recherche.
 * @returns {Promise<object>} Données retournées par l’API.
 */
async function fetchFromApi(path, params = {}) {
  const url = new URL(`${API_BASE_URL}/${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur API OCMovies : ${response.status}`);
  }

  return response.json();
}

/**
 * Récupère une page de films en appliquant les filtres demandés.
 *
 * @param {Record<string, string | number>} [params] Filtres acceptés par l’API.
 * @returns {Promise<object>} Page de résultats de films.
 */
export function getMovies(params = {}) {
  return fetchFromApi("titles/", params);
}

/**
 * Récupère les informations complètes d’un film.
 *
 * @param {number} movieId Identifiant du film.
 * @returns {Promise<object>} Détails complets du film.
 */
export function getMovieDetails(movieId) {
  return fetchFromApi(`titles/${movieId}/`);
}
