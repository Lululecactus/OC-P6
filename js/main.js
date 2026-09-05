import { getMovies, getMovieDetails, getGenres } from "./api.js";

// Chaque liste doit contenir six films d'après le cahier des charges.
const MOVIES_PER_CATEGORY = 6;
// L'API contient actuellement 25 genres et accepte jusqu'à 50 résultats.
const GENRES_PAGE_SIZE = 50;
// La catégorie dynamique commencera sur un genre différent des catégories fixes.
const DEFAULT_DYNAMIC_GENRE = "Comedy";

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

  const detailsButton = featuredMovie.querySelector("button");
  detailsButton.dataset.movieId = movie.id;
  detailsButton.setAttribute(
    "aria-label",
    `Voir les détails de ${movie.title}`,
  );
}

/**
 * Charge le meilleur film et les six films suivants du classement IMDb.
 * La liste demande sept résultats : le premier alimente la bannière et les
 * six autres alimentent la grille « Films les mieux notés ».
 */
async function loadHomepageMovies() {
  const topRatedList = document.querySelector(
    ".top-rated-section .movie-list",
  );

  // Le signe moins devant imdb_score demande un tri décroissant.
  const topMoviesPage = await getMovies({
    sort_by: "-imdb_score",
    page_size: MOVIES_PER_CATEGORY + 1,
  });
  const allMovies = topMoviesPage.results;

  if (
    !Array.isArray(allMovies) ||
    allMovies.length < MOVIES_PER_CATEGORY + 1
  ) {
    throw new Error("La liste des films les mieux notés est incomplète.");
  }

  const bestMovieSummary = allMovies[0];
  const topRatedMovies = allMovies.slice(1, MOVIES_PER_CATEGORY + 1);
  const bestMovieDetails = await getMovieDetails(bestMovieSummary.id);

  // Le DOM n'est mis à jour qu'une fois les données nécessaires récupérées.
  renderBestMovie(bestMovieDetails);
  renderMovieList(topRatedList, topRatedMovies);
}

/**
 * Charge les six films les mieux notés d'un genre dans la liste demandée.
 * Le genre et le sélecteur sont passés en paramètres pour pouvoir réutiliser
 * cette fonction avec les autres catégories de la page.
 *
 * @param {string} genre Genre attendu par l'API, par exemple "Mystery".
 * @param {string} listSelector Sélecteur CSS de la liste à remplir.
 */
async function loadMovieCategory(genre, listSelector) {
  const movieList = document.querySelector(listSelector);
  const categoryPage = await getMovies({
    genre,
    sort_by: "-imdb_score",
    page_size: MOVIES_PER_CATEGORY,
  });
  const movies = categoryPage.results;

  if (!Array.isArray(movies) || movies.length < MOVIES_PER_CATEGORY) {
    throw new Error(`La liste de la catégorie ${genre} est incomplète.`);
  }

  renderMovieList(movieList, movies);
}

/**
 * Récupère les genres de l'API et construit les options du menu « Autres ».
 * Les options présentes dans le HTML restent disponibles comme contenu de
 * secours tant que la réponse complète n'a pas été validée.
 */
async function loadGenres() {
  const genreSelect = document.querySelector("#genre-select");
  const genresPage = await getGenres({ page_size: GENRES_PAGE_SIZE });
  const genres = genresPage.results;

  if (!Array.isArray(genres) || genres.length === 0) {
    throw new Error("Aucun genre retourné par l'API.");
  }

  const options = document.createDocumentFragment();

  for (const genre of genres) {
    const option = document.createElement("option");
    option.value = genre.name;
    option.textContent = genre.name;
    options.append(option);
  }

  genreSelect.replaceChildren(options);
  genreSelect.value = DEFAULT_DYNAMIC_GENRE;
}

/**
 * Charge les films du genre choisi dans la dernière section de la page.
 * La section revient à son état replié afin de respecter le nombre de
 * cartes prévu pour chaque taille d'écran.
 *
 * @param {string} genre Genre sélectionné dans le menu.
 */
async function loadDynamicMovieCategory(genre) {
  const movieSection = document.querySelector(".other-category-section");
  const movieList = document.querySelector("#other-movie-list");
  const sectionTitle = document.querySelector("#other-category-title");
  const showMoreButton = movieSection.querySelector(".show-more-button");

  await loadMovieCategory(genre, "#other-movie-list");

  sectionTitle.textContent = `Autres films : ${genre}`;
  movieList.setAttribute("aria-label", `Films du genre ${genre}`);
  movieSection.classList.remove("is-expanded");
  showMoreButton.textContent = "Voir plus";
  showMoreButton.setAttribute("aria-expanded", "false");
}

/**
 * Construit le menu des genres puis affiche sa catégorie par défaut.
 * L'ordre est important : la valeur sélectionnée ne peut être définie
 * qu'une fois les options reçues depuis l'API.
 */
async function loadGenresAndDefaultCategory() {
  const genreSelect = document.querySelector("#genre-select");
  genreSelect.disabled = true;

  try {
    await loadGenres();
    await loadDynamicMovieCategory(DEFAULT_DYNAMIC_GENRE);
  } finally {
    genreSelect.disabled = false;
  }
}

/**
 * Recharge la dernière grille lorsque l'utilisateur choisit un genre.
 * Le menu est temporairement désactivé pour empêcher deux requêtes
 * concurrentes de remplacer les cartes dans le mauvais ordre.
 */
function setupGenreSelection() {
  const genreSelect = document.querySelector("#genre-select");
  const loadingStatus = document.querySelector("#movies-loading-status");

  genreSelect.addEventListener("change", async () => {
    genreSelect.disabled = true;
    loadingStatus.textContent =
      `Chargement des films du genre ${genreSelect.value}.`;

    try {
      await loadDynamicMovieCategory(genreSelect.value);
      loadingStatus.textContent = "";
    } catch {
      loadingStatus.textContent =
        "Impossible de charger les films du genre sélectionné.";
    } finally {
      genreSelect.disabled = false;
    }
  });
}

/**
 * Active les boutons « Voir plus / Voir moins » de chaque catégorie.
 * La classe est appliquée à la section complète afin que le CSS puisse
 * réafficher les cartes masquées sans modifier leur style directement en JS.
 */
function setupShowMoreButtons() {
  const showMoreButtons = document.querySelectorAll(".show-more-button");

  for (const button of showMoreButtons) {
    button.addEventListener("click", () => {
      const movieSection = button.closest(".movie-section");

      if (!movieSection) {
        return;
      }

      const isExpanded = movieSection.classList.toggle("is-expanded");

      button.textContent = isExpanded ? "Voir moins" : "Voir plus";
      button.setAttribute("aria-expanded", String(isExpanded));
    });
  }
}

/**
 * Retourne une liste lisible ou un texte de remplacement si elle est vide.
 *
 * @param {string[]} values Valeurs retournées par l'API.
 * @returns {string} Valeurs séparées par des virgules.
 */
function formatList(values) {
  return Array.isArray(values) && values.length > 0
    ? values.join(", ")
    : "Non renseigné";
}

/**
 * Formate une recette de box-office avec des séparateurs adaptés au français.
 * Le revenu mondial est prioritaire ; le revenu américain sert de secours.
 *
 * @param {object} movie Détail complet d'un film.
 * @returns {string} Recette formatée ou texte de remplacement.
 */
function formatBoxOffice(movie) {
  const income = movie.worldwide_gross_income ?? movie.usa_gross_income;

  if (income === null || income === undefined) {
    return "Non renseigné";
  }

  return `${new Intl.NumberFormat("fr-FR").format(income)} USD`;
}

/**
 * Injecte le détail complet d'un film dans la fenêtre modale.
 * textContent est utilisé pour ne jamais interpréter les données de l'API
 * comme du code HTML.
 *
 * @param {object} movie Détail complet du film.
 */
function renderMovieDetails(movie) {
  const dialog = document.querySelector("#movie-details");
  const poster = dialog.querySelector("#movie-details-poster");

  dialog.querySelector("#movie-details-title").textContent = movie.title;
  setPosterImage(poster, movie.image_url);
  poster.alt = `Affiche de ${movie.title}`;

  dialog.querySelector("#movie-details-genres").textContent = formatList(
    movie.genres,
  );
  dialog.querySelector("#movie-details-date").textContent =
    movie.date_published || "Non renseignée";
  dialog.querySelector("#movie-details-rated").textContent =
    movie.rated || "Non renseignée";
  dialog.querySelector("#movie-details-score").textContent =
    movie.imdb_score !== null && movie.imdb_score !== undefined
      ? `${movie.imdb_score} / 10`
      : "Non renseigné";
  dialog.querySelector("#movie-details-directors").textContent = formatList(
    movie.directors,
  );
  dialog.querySelector("#movie-details-actors").textContent = formatList(
    movie.actors,
  );
  dialog.querySelector("#movie-details-duration").textContent = movie.duration
    ? `${movie.duration} minutes`
    : "Non renseignée";
  dialog.querySelector("#movie-details-countries").textContent = formatList(
    movie.countries,
  );
  dialog.querySelector("#movie-details-box-office").textContent =
    formatBoxOffice(movie);
  dialog.querySelector("#movie-details-description").textContent =
    movie.long_description || movie.description || "Résumé non renseigné.";
}

/**
 * Récupère le détail d'un film puis ouvre la fenêtre modale native.
 *
 * @param {string} movieId Identifiant stocké dans data-movie-id.
 */
async function openMovieDetails(movieId) {
  const loadingStatus = document.querySelector("#movies-loading-status");

  try {
    loadingStatus.textContent = "Chargement des détails du film.";
    const movie = await getMovieDetails(movieId);

    renderMovieDetails(movie);
    const dialog = document.querySelector("#movie-details");
    dialog.showModal();
    // Le focus reste en haut de la fiche au lieu de faire défiler la modale
    // jusqu'au bouton de fermeture placé en bas sur ordinateur.
    dialog.focus({ preventScroll: true });
    dialog.scrollTop = 0;
    loadingStatus.textContent = "";
  } catch {
    loadingStatus.textContent =
      "Impossible de charger les informations de ce film.";
  }
}

/**
 * Écoute les clics dans le contenu principal de la page.
 * La délégation d'évènement fonctionne aussi avec les cartes ajoutées après
 * le chargement initial, car l'écouteur est placé sur l'élément main.
 */
function setupMovieDetailsDialog() {
  const mainContent = document.querySelector("main");
  const dialog = document.querySelector("#movie-details");

  mainContent.addEventListener("click", (event) => {
    const clickedElement = event.target;

    if (!(clickedElement instanceof Element)) {
      return;
    }

    const detailsButton = clickedElement.closest("[data-movie-id]");

    if (!detailsButton) {
      return;
    }

    openMovieDetails(detailsButton.dataset.movieId);
  });

  dialog.addEventListener("click", (event) => {
    const dialogBounds = dialog.getBoundingClientRect();
    const isOutsideDialog =
      event.clientX < dialogBounds.left ||
      event.clientX > dialogBounds.right ||
      event.clientY < dialogBounds.top ||
      event.clientY > dialogBounds.bottom;

    // Le fond assombri appartient techniquement à l'élément dialog.
    // Les coordonnées permettent de le distinguer du panneau blanc visible.
    if (event.target === dialog && isOutsideDialog) {
      dialog.close();
    }
  });
}

/**
 * Lance les chargements nécessaires à l'affichage initial de la page.
 * Promise.all permet d'effectuer les requêtes indépendantes en parallèle.
 */
async function initializeHomepage() {
  const loadingStatus = document.querySelector("#movies-loading-status");
  setupShowMoreButtons();
  setupMovieDetailsDialog();
  setupGenreSelection();
  loadingStatus.textContent = "Chargement des films en cours.";

  try {
    await Promise.all([
      loadHomepageMovies(),
      loadMovieCategory("Mystery", "#mystery-movie-list"),
      loadMovieCategory("Action", "#action-movie-list"),
      loadGenresAndDefaultCategory(),
    ]);

    loadingStatus.textContent = "";
  } catch {
    // Les contenus de secours restent dans le HTML si une requête échoue.
    loadingStatus.textContent =
      "Impossible de mettre à jour certains films. Le contenu de secours reste affiché.";
  }
}

// Les requêtes démarrent lorsque la structure HTML est entièrement disponible.
document.addEventListener("DOMContentLoaded", initializeHomepage);
