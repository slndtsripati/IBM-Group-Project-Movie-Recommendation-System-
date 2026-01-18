const API_KEY = 'ab4e762a';
const BASE_URL = 'https://www.omdbapi.com/';

const main = document.querySelector('.movie-grid');
const search = document.getElementById('movieInput');
const btn = document.querySelector('.btn-recommend');
const resultsTitle = document.querySelector('.results h2');
const loader = document.getElementById('loader');

const navHome = document.getElementById('nav-home');
const navTopRated = document.getElementById('nav-top-rated');
const navTrending = document.getElementById('nav-genres');
const navWatchlist = document.getElementById('nav-watchlist');

// Modal Elements
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.querySelector('.close-modal');
const modalPoster = document.getElementById('modal-poster');
const modalTitle = document.getElementById('modal-title');
const modalRating = document.getElementById('modal-rating');
const modalOverview = document.getElementById('modal-overview');
const modalExtra = document.getElementById('modal-extra-info');

// --- Utility Functions ---

function showLoader() {
    loader.classList.remove('hidden');
    main.innerHTML = '';
}

function hideLoader() {
    loader.classList.add('hidden');
}

function setActiveNav(navElement) {
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    if (navElement) navElement.classList.add('active');
}

// --- Watchlist Logic ---

function getWatchlist() {
    const list = localStorage.getItem('watchlist');
    return list ? JSON.parse(list) : [];
}

function saveWatchlist(list) {
    localStorage.setItem('watchlist', JSON.stringify(list));
}

function isMovieSaved(id) {
    const list = getWatchlist();
    return list.some(movie => movie.imdbID === id);
}

function toggleWatchlist(movie) {
    let list = getWatchlist();
    if (isMovieSaved(movie.imdbID)) {
        list = list.filter(m => m.imdbID !== movie.imdbID);
    } else {
        list.push(movie);
    }
    saveWatchlist(list);

    // Update UI if on watchlist page
    if (navWatchlist.classList.contains('active')) {
        showWatchlistPage();
    } else {
        // Update button state in grid if visible
        updateWatchlistButtonState(movie.imdbID);
    }
}

function updateWatchlistButtonState(id) {
    const btn = document.querySelector(`.watchlist-btn[data-id="${id}"]`);
    if (btn) {
        if (isMovieSaved(id)) {
            btn.classList.add('active');
            btn.innerHTML = '&#10084;'; // Heart
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '&#9825;'; // Empty Heart
        }
    }
}

// --- Modal Logic ---

async function openModal(movieId) {
    modal.classList.remove('hidden');

    // Reset content
    modalPoster.src = '';
    modalTitle.innerText = 'Loading...';
    modalRating.innerText = '';
    modalOverview.innerText = '';
    modalExtra.innerHTML = '';

    try {
        const res = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${movieId}&plot=full`);
        const data = await res.json();

        if (data.Response === "True") {
            if (data.Poster && data.Poster !== 'N/A') {
                modalPoster.src = data.Poster;
            } else {
                modalPoster.src = 'https://via.placeholder.com/300x450?text=No+Poster';
            }

            modalTitle.innerText = data.Title;
            modalRating.innerText = `⭐ ${data.imdbRating} / 10`;
            modalOverview.innerText = data.Plot;

            modalExtra.innerHTML = `
                <p><strong>Year:</strong> ${data.Year}</p>
                <p><strong>Runtime:</strong> ${data.Runtime}</p>
                <p><strong>Genres:</strong> ${data.Genre}</p>
                <p><strong>Director:</strong> ${data.Director}</p>
                <p><strong>Cast:</strong> ${data.Actors}</p>
            `;
        } else {
            modalTitle.innerText = "Details not found.";
        }
    } catch (error) {
        console.error("Error fetching movie details:", error);
        modalTitle.innerText = "Error loading details.";
    }
}

function closeModal() {
    modal.classList.add('hidden');
}

// --- Fetch & Show Logic ---

// Wrapper to handle OMDB "Search" response
async function fetchAndShow(query, titleText) {
    showLoader();
    resultsTitle.innerText = titleText;
    const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        hideLoader();
        if (data.Response === "True" && data.Search) {
            showMovies(data.Search);
        } else {
            main.innerHTML = `<p class="error-msg">${data.Error || 'No movies found.'}</p>`;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        hideLoader();
        main.innerHTML = '<p class="error-msg">Something went wrong. Please check your connection.</p>';
    }
}

function showMovies(movies) {
    main.innerHTML = '';

    // If Watchlist page, show all. Else limit to 12.
    const limit = navWatchlist.classList.contains('active') ? movies.length : 12;

    movies.slice(0, limit).forEach((movie, index) => {
        const { Title, Year, imdbID, Poster } = movie;

        // Use placeholder if Poster is N/A or empty
        const posterSrc = (Poster && Poster !== 'N/A') ? Poster : 'https://via.placeholder.com/300x450?text=No+Poster';

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card', 'reveal');
        movieEl.style.transitionDelay = `${index * 0.05}s`;

        // Watchlist Button State
        const saved = isMovieSaved(imdbID);
        const heart = saved ? '&#10084;' : '&#9825;';
        const activeClass = saved ? 'active' : '';

        movieEl.innerHTML = `
            <button class="watchlist-btn ${activeClass}" data-id="${imdbID}" title="Add to Watchlist">
                ${heart}
            </button>
            <img src="${posterSrc}" alt="${Title}" onerror="this.src='https://via.placeholder.com/300x450?text=Image+Not+Found'">
            <div class="movie-info">
                <h3>${Title}</h3>
                <p>${Year}</p>
            </div>
        `;

        main.appendChild(movieEl);

        // Event Listeners

        // 1. Open Modal (Click on Card)
        movieEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('watchlist-btn') || e.target.parentElement.classList.contains('watchlist-btn')) return;
            openModal(imdbID);
        });

        // 2. Watchlist Toggle
        const wlBtn = movieEl.querySelector('.watchlist-btn');
        wlBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWatchlist({ Title, Year, imdbID, Poster: posterSrc });
        });

        // Animation
        setTimeout(() => { movieEl.classList.add('active'); }, 50);
        setTimeout(() => { movieEl.classList.add('revealed'); movieEl.style.transitionDelay = '0s'; }, (index * 50) + 500);
    });
}

function showWatchlistPage() {
    setActiveNav(navWatchlist);
    main.innerHTML = '';
    resultsTitle.innerText = "Your Watchlist";

    const watchlist = getWatchlist();
    if (watchlist.length === 0) {
        main.innerHTML = '<p style="text-align:center; width:100%; color:#777; margin-top:20px;">Your watchlist is empty.</p>';
        return;
    }

    showMovies(watchlist);
}

// --- Event Listeners ---

btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (search.value) {
        fetchAndShow(search.value, `Results for "${search.value}"`);
        search.value = '';
        scrollToResults();
    }
});

search.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && search.value) {
        fetchAndShow(search.value, `Results for "${search.value}"`);
        search.value = '';
        scrollToResults();
    }
});

// Simulate "Home", "Top Rated", "Trending" with arbitrary search queries
// since OMDB doesn't have discovery endpoints.

navHome.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav(navHome);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAndShow("Batman", "Home - Recommendations"); // Default "Home" content
});

navTopRated.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav(navTopRated);
    fetchAndShow("Oscar", "Award Winning Movies"); // Simulation for Top Rated
    scrollToResults();
});

navTrending.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav(navTrending);
    fetchAndShow("Marvel", "Trending Movies"); // Simulation for Trending
    scrollToResults();
});

navWatchlist.addEventListener('click', (e) => {
    e.preventDefault();
    showWatchlistPage();
    scrollToResults();
});

// Modal Events
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

function scrollToResults() {
    resultsTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Load Default Movies on page startup (Home)
window.onload = () => {
    setActiveNav(navHome);
    fetchAndShow("Batman", "Movie Recommendations");
};
