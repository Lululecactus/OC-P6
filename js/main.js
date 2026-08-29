import { getMovies, getMovieDetails } from "./api.js";

/**
 * Injecte les données d'un film dans la zone "Meilleur film" du DOM.
 * Les sélecteurs sont scopés à `.featured-movie`, pas besoin d'ajouter
 * d'id supplémentaires dans le HTML : il n'y a qu'un seul film vedette.
 *
 * @param {object} movie - détail complet du film (issu de getMovieDetails)
 */
function renderBestMovie(movie) {
  const featuredMovie = document.querySelector(".featured-movie");

  const posterImg = featuredMovie.querySelector("img");
  posterImg.src = movie.image_url;
  posterImg.alt = `Affiche de ${movie.title}`;

  const titleEl = featuredMovie.querySelector("h3");
  titleEl.textContent = movie.title;

  const summaryEl = featuredMovie.querySelector("p");
  summaryEl.textContent = movie.description;

  // Le clic sur "Détails" (ouverture de la fenêtre modale) sera branché
  // à l'étape 7 — pour l'instant on affiche juste les infos.
}

/**
 * Récupère et affiche le meilleur film (meilleure note IMDB, toutes
 * catégories confondues).
 *
 * Deux appels sont nécessaires :
 * 1. getMovies() trié par note décroissante, pour connaître l'id du
 *    meilleur film (la liste ne contient pas le résumé complet).
 * 2. getMovieDetails(id) pour récupérer toutes ses informations,
 *    dont la description et l'image.
 */
async function loadBestMovie() {
  const bestMoviesList = await getMovies({
    sort_by: "-imdb_score",
    page_size: 1,
  });

  const bestMovieSummary = bestMoviesList.results[0];
  const bestMovieDetails = await getMovieDetails(bestMovieSummary.id);

  renderBestMovie(bestMovieDetails);
}

document.addEventListener("DOMContentLoaded", loadBestMovie);
