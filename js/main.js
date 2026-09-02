import { getMovies, getMovieDetails } from "./api.js";

// Une catégorie doit contenir six films d'après le cahier des charges.
const TOP_RATED_MOVIES_COUNT = 6;

// Cette image SVG est créée directement dans le navigateur. Elle évite
// d'afficher une icône cassée lorsqu'une affiche distante est indisponible.
const FALLBACK_POSTER = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="700" height="1030">
    <rect width="100%" height="100%" fill="#d9d9d9" />
    <text x="50%" y="50%" font-family="sans-serif" font-size="42"
          fill="#555" text-anchor="middle">Affiche indisponible</text>
  </svg>
`)}`;

// Le template HTML contient la structure commune à toutes les cartes.
const movieCardTemplate = document.querySelector("#movie-card-template");

/**
 * Affecte une affiche à une image et utilise l'image de secours si nécessaire.
 * Le gestionnaire d'erreur est retiré avant le remplacement pour éviter une
 * boucle si l'image de secours rencontrait elle-même un problème.
 *
 * @param {HTMLImageElement} imgElement Image à mettre à jour.
 * @param {string} url Adresse de l'affiche renvoyée par l'API.
 */
function setPosterImage(imgElement, url) {
  imgElement.src = url || FALLBACK_POSTER;
  imgElement.onerror = () => {
    imgElement.onerror = null;
    imgElement.src = FALLBACK_POSTER;
  };
}

/**
 * Construit une carte de film à partir du template HTML.
 *
 * @param {object} movie Film provenant d'une réponse de l'API.
 * @returns {DocumentFragment} Copie du template remplie avec les données.
 */
function createMovieCard(movie) {
  // cloneNode(true) copie le template ainsi que tous ses éléments enfants.
  const card = movieCardTemplate.content.cloneNode(true);

  const title = card.querySelector("h3");
  title.textContent = movie.title;

  const button = card.querySelector("button");
  // L'identifiant sera utilisé plus tard pour demander le détail du film
  // lors de l'ouverture de la fenêtre modale.
  button.dataset.movieId = movie.id;
  button.setAttribute("aria-label", `Voir les détails de ${movie.title}`);

  const poster = card.querySelector("img");
  setPosterImage(poster, movie.image_url);
  poster.alt = `Affiche de ${movie.title}`;

  return card;
}

/**
 * Remplace les cartes d'une liste par les films reçus en argument.
 *
 * @param {HTMLUListElement} movieList Liste HTML à remplir.
 * @param {object[]} movies Films à afficher.
 */
function renderMovieList(movieList, movies) {
  // Le fragment permet de préparer toutes les cartes avant une seule
  // modification du DOM.
  const fragment = document.createDocumentFragment();

  for (const movie of movies) {
    fragment.append(createMovieCard(movie));
  }

  movieList.replaceChildren(fragment);
}

/**
 * Met à jour la bannière du meilleur film avec ses informations détaillées.
 *
 * @param {object} movie Détail du meilleur film.
 */
function renderBestMovie(movie) {
  const featuredMovie = document.querySelector(".featured-movie");

  const posterImg = featuredMovie.querySelector("img");
  setPosterImage(posterImg, movie.image_url);
  posterImg.alt = `Affiche de ${movie.title}`;

  const titleEl = featuredMovie.querySelector("h3");
  titleEl.textContent = movie.title;

  const summaryEl = featuredMovie.querySelector("p");
  summaryEl.textContent = movie.description;
}

/**
 * Charge le meilleur film et les six films suivants du classement IMDb.
 * La liste demande sept résultats : le premier alimente la bannière et les
 * six autres alimentent la grille « Films les mieux notés ».
 */
async function loadHomepageMovies() {
  const loadingStatus = document.querySelector("#movies-loading-status");
  const topRatedList = document.querySelector(
    ".top-rated-section .movie-list",
  );

  loadingStatus.textContent = "Chargement des films en cours.";

  try {
    // Le signe moins devant imdb_score demande un tri décroissant.
    const topMoviesPage = await getMovies({
      sort_by: "-imdb_score",
      page_size: TOP_RATED_MOVIES_COUNT + 1,
    });
    const allMovies = topMoviesPage.results;

    const bestMovieSummary = allMovies[0];
    const topRatedMovies = allMovies.slice(1, TOP_RATED_MOVIES_COUNT + 1);

    if (!bestMovieSummary) {
      throw new Error("Aucun film retourné par l'API.");
    }

    const bestMovieDetails = await getMovieDetails(bestMovieSummary.id);

    // Le DOM n'est mis à jour qu'une fois les données nécessaires récupérées.
    renderBestMovie(bestMovieDetails);
    renderMovieList(topRatedList, topRatedMovies);

    loadingStatus.textContent = "";
  } catch (error) {
    console.error("Erreur lors du chargement des films :", error);
    // En cas d'échec, les contenus présents dans le HTML ne sont pas remplacés.
    loadingStatus.textContent =
      "Impossible de mettre à jour les films. Le contenu de secours reste affiché.";
  }
}

// Les requêtes démarrent lorsque la structure HTML est entièrement disponible.
document.addEventListener("DOMContentLoaded", loadHomepageMovies);
