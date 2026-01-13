const API_KEY = "abaf5ddb378772eba758d5b4c3ea8e4d";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";

const grid = document.querySelector(".movie-grid");
const input = document.getElementById("movieInput");
const recommendBtn = document.querySelector(".btn-recommend");
const resultsTitle = document.querySelector(".results h2");
const loader = document.getElementById("loader");

const navHome = document.getElementById("nav-home");
const navTopRated = document.getElementById("nav-top-rated");
const navTrending = document.getElementById("nav-genres");

// --- Helpers ---
const showLoader = () => {
  loader.classList.remove("hidden");
  grid.innerHTML = "";
};

const hideLoader = () => loader.classList.add("hidden");

const setActiveNav = (activeEl) => {
  document.querySelectorAll(".nav-links a").forEach((el) => el.classList.remove("active"));
  if (activeEl) activeEl.classList.add("active");
};

async function fetchAndShow(url, titleText) {
  showLoader();
  resultsTitle.innerText = titleText;

  try {
    const res = await fetch(url);
    const data = await res.json();
    hideLoader();

    if (data?.results?.length) showMovies(data.results);
    else grid.innerHTML = `<p class="error-msg">No movies found.</p>`;
  } catch (err) {
    console.error("Fetch error:", err);
    hideLoader();
    grid.innerHTML = `<p class="error-msg">Something went wrong. Please try again later.</p>`;
  }
}

async function getRecommendations(query) {
  setActiveNav(null);
  showLoader();

  const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query.trim())}`;

  try {
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (!data?.results?.length) {
      hideLoader();
      resultsTitle.innerText = "No movies found. Try another search!";
      grid.innerHTML = "";
      return;
    }

    const best = data.results[0];
    resultsTitle.innerText = `Because you liked "${best.title}"...`;

    const recUrl = `${BASE_URL}/movie/${best.id}/recommendations?api_key=${API_KEY}`;
    const recRes = await fetch(recUrl);
    const recData = await recRes.json();

    hideLoader();
    showMovies(recData?.results || []);
  } catch (err) {
    console.error("Recommendation error:", err);
    hideLoader();
    resultsTitle.innerText = "Error finding recommendations.";
  }
}

function showMovies(movies) {
  grid.innerHTML = "";

  movies.slice(0, 12).forEach((movie, idx) => {
    const { title, poster_path, vote_average, release_date } = movie;
    if (!poster_path) return;

    const card = document.createElement("div");
    card.className = "movie-card reveal";
    card.style.transitionDelay = `${idx * 0.1}s`;

    card.innerHTML = `
      <img src="${IMG_PATH}${poster_path}" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
        <p>⭐ ${Number(vote_average).toFixed(1)} | ${release_date ? release_date.slice(0, 4) : "N/A"}</p>
      </div>
    `;

    grid.appendChild(card);

    requestAnimationFrame(() => card.classList.add("active"));

    setTimeout(() => {
      card.classList.add("revealed");
      card.style.transitionDelay = "0s";
    }, idx * 100 + 800);
  });
}

function scrollToResults() {
  resultsTitle.scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- Events ---
recommendBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;
  getRecommendations(input.value);
  input.value = "";
  scrollToResults();
});

input.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (!input.value.trim()) return;
  getRecommendations(input.value);
  input.value = "";
  scrollToResults();
});

navHome.addEventListener("click", (e) => {
  e.preventDefault();
  setActiveNav(navHome);
  window.scrollTo({ top: 0, behavior: "smooth" });
  fetchAndShow(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, "Trending This Week");
});

navTopRated.addEventListener("click", (e) => {
  e.preventDefault();
  setActiveNav(navTopRated);
  fetchAndShow(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`, "Top Rated Movies");
  scrollToResults();
});

navTrending.addEventListener("click", (e) => {
  e.preventDefault();
  setActiveNav(navTrending);
  fetchAndShow(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`, "Trending Today");
  scrollToResults();
});

// Startup load
document.addEventListener("DOMContentLoaded", () => {
  setActiveNav(navHome);
  fetchAndShow(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, "Trending This Week");
});        hideLoader();
        if (data.results && data.results.length > 0) {
            showMovies(data.results);
        } else {
            main.innerHTML = '<p class="error-msg">No movies found.</p>';
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        hideLoader();
        main.innerHTML = '<p class="error-msg">Something went wrong. Please try again later.</p>';
    }
}

// --- Main Logic ---

async function getRecommendations(query) {
    setActiveNav(null); // Clear nav selection for search
    showLoader();

    const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            const bestMatch = data.results[0];
            const movieId = bestMatch.id;

            resultsTitle.innerText = `Because you liked "${bestMatch.title}"...`;

            const recUrl = `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}`;
            const recRes = await fetch(recUrl);
            const recData = await recRes.json();

            hideLoader();
            showMovies(recData.results);
        } else {
            hideLoader();
            resultsTitle.innerText = "No movies found. Try another search!";
            main.innerHTML = '';
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        hideLoader();
        resultsTitle.innerText = "Error finding recommendations.";
    }
}

function showMovies(movies) {
    main.innerHTML = '';

    // Take the top 12 recommendations
    movies.slice(0, 12).forEach((movie, index) => {
        const { title, poster_path, vote_average, release_date } = movie;

        if (!poster_path) return;

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card', 'reveal');

        // Staggered delay
        movieEl.style.transitionDelay = `${index * 0.1}s`;

        movieEl.innerHTML = `
            <img src="${IMG_PATH + poster_path}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <p>⭐ ${vote_average.toFixed(1)} | ${release_date ? release_date.split('-')[0] : 'N/A'}</p>
            </div>
        `;

        main.appendChild(movieEl);

        // Trigger animation
        setTimeout(() => {
            movieEl.classList.add('active');
        }, 50); // Small buffer to ensure DOM render

        // Allow fast hover after entry animation (0.8s + delay)
        setTimeout(() => {
            movieEl.classList.add('revealed');
            movieEl.style.transitionDelay = '0s'; // Reset delay so hover is instant
        }, (index * 100) + 800);
    });
}

// --- Event Listeners ---

btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (search.value) {
        getRecommendations(search.value);
        search.value = '';
        scrollToResults();
    }
});

search.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && search.value) {
        getRecommendations(search.value);
        search.value = '';
        scrollToResults();
    }
});

navHome.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav(navHome);
    // Return to top for Home
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAndShow(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, "Trending This Week");
});

navTopRated.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav(navTopRated);
    fetchAndShow(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`, "Top Rated Movies");
    scrollToResults();
});

navTrending.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav(navTrending);
    // Trending button fetches Trending Day for variety
    fetchAndShow(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`, "Trending Today");
    scrollToResults();
});

function scrollToResults() {
    resultsTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Load Trending Movies on page startup (Home)
window.onload = () => {
    setActiveNav(navHome);
    fetchAndShow(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, "Trending This Week");
};
