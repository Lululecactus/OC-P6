// Adresse commune à toutes les routes de l'API locale OCMovies.
const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

/**
 * Effectue une requête vers l'API et retourne la réponse JSON.
 * Cette fonction centralise la construction des URL et la gestion des erreurs
 * afin d'éviter de répéter la même logique dans chaque requête.
 *
 * @param {string} path Chemin de la ressource à partir de l'URL de base.
 * @param {Record<string, string | number>} [params] Paramètres de recherche.
 * @returns {Promise<object>} Données JSON renvoyées par l'API.
 */
async function fetchFromApi(path, params = {}) {
  const url = new URL(`${API_BASE_URL}/${path}`);

  // Les valeurs vides ne sont pas ajoutées à l'URL pour ne pas envoyer
  // de filtres inutiles à l'API.
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url);

  // fetch ne considère pas une réponse HTTP 404 ou 500 comme une erreur
  // JavaScript : il faut donc vérifier explicitement response.ok.
  if (!response.ok) {
    throw new Error(`Erreur API OCMovies : ${response.status}`);
  }

  return response.json();
}

/**
 * Récupère une page de films avec les filtres demandés.
 *
 * @param {Record<string, string | number>} [params] Filtres acceptés par l'API.
 * @returns {Promise<object>} Page contenant notamment un tableau results.
 */
export function getMovies(params = {}) {
  return fetchFromApi("titles/", params);
}

/**
 * Récupère toutes les informations d'un film à partir de son identifiant.
 *
 * @param {number} movieId Identifiant du film dans OCMovies.
 * @returns {Promise<object>} Détail complet du film.
 */
export function getMovieDetails(movieId) {
  return fetchFromApi(`titles/${movieId}`);
}

/**
 * Récupère les genres disponibles dans l'API.
 * Cette fonction sera utilisée pour construire la catégorie dynamique.
 *
 * @param {Record<string, string | number>} [params] Paramètres optionnels.
 * @returns {Promise<object>} Page contenant les genres.
 */
export function getGenres(params = {}) {
  return fetchFromApi("genres/", params);
}
