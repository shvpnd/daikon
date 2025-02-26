async function fetchAnimeDetails(id) {
    try {
        const response = await fetch(`https://amvstrm-api-olive.vercel.app/api/v2/info/${id}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch anime details:", error);
        return null; // Return null to handle errors in UI
    }
}

function createAnimeDetails(data) {
    if (!data) {
        return `<p class="error-message">Failed to load anime details. Please try again later.</p>`;
    }

    const bannerImage = data.bannerImage || 'default-banner.jpg';
    const coverImage = data.coverImage?.large || 'default-cover.jpg';
    const title = data.title?.english || data.title?.native || 'Unknown Title';
    const nativeName = data.title?.native || 'Unknown Native Name';
    const genres = data.genres?.join(', ') || 'Unknown Genres';
    const additionalInfo = [
        data.format || 'Unknown Format',
        data.season || 'Unknown Season',
        data.year || 'Unknown Year',
        data.episodes || 'Unknown Episodes'
    ].join(" | ");

    const score = data.score?.averageScore ? (data.score.averageScore / 10).toFixed(1) : 'N/A';
    const watchUrl = data.id_provider?.idGogo ? `watch.html?id=${data.id_provider.idGogo}` : '#';
    const popularity = data.popularity || 'Unknown';
    const description = data.description || 'No description available.';

    document.title = title;

    return `
        <div class="banner" style="background-image: url(${bannerImage});">
            <div class="banner-overlay"></div>
        </div>
        <div class="anime-card">
            <img src="${coverImage}" alt="${title}">
        </div>
        <div class="anime-details">
            <h1>${title}</h1>
            <h2>${nativeName}</h2>
            <div class="genres">
                <ul>${genres.split(', ').map(genre => `<li>${genre}</li>`).join('')}</ul>
            </div>
            <div class="description">
                <p>${description}</p>
            </div>
            <div class="info">
                <p>${additionalInfo} | Score: ${score}</p>
                <p>Popularity: ${popularity}</p>
            </div>
            <div class="watch-now">
                <a id="watch-now-link" href="${watchUrl}">Watch Now</a>
            </div>
        </div>
    `;
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (key === 'w') {
            const watchNowLink = document.getElementById('watch-now-link');
            if (watchNowLink && watchNowLink.href !== '#') {
                window.location.href = watchNowLink.href;
            }
        } else if (key === 'd') {
            window.location.href = 'index.html';
        }
    });
}

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id');

    if (!animeId) {
        document.getElementById('anime-details').innerHTML = `<p class="error-message">Anime ID is missing in the URL.</p>`;
        return;
    }

    const animeData = await fetchAnimeDetails(animeId);
    document.getElementById('anime-details').innerHTML = createAnimeDetails(animeData);
    setupKeyboardShortcuts();
}

document.addEventListener('DOMContentLoaded', init);
