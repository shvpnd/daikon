async function fetchAnimeDetails(id) {
    const response = await fetch(`https://amvstrm-api-olive.vercel.app/api/v2/info/${id}`);
    const data = await response.json();
    return data;
}

function createAnimeDetails(data) {
    const bannerImage = data.bannerImage || 'default-banner.jpg';
    const coverImage = data.coverImage ? data.coverImage.large : 'default-cover.jpg';
    const title = data.title?.english || data.title?.native || 'Unknown Title';
    const nativeName = data.title?.native || 'Unknown Native Name';
    const genres = data.genres ? data.genres.join(', ') : 'Unknown Genres';
    const additionalInfo = `${data.format || 'Unknown Format'} | ${data.season || 'Unknown Season'} | ${(data.score?.averageScore / 10).toFixed(1) || 'N/A'} | ${data.year || 'Unknown Year'} | ${data.episodes || 'Unknown Episodes'}`;
    const watchUrl = data.id_provider?.idGogo ? `watch.html?id=${data.id_provider.idGogo}` : '#';
    const popularity = data.popularity || 'Unknown';

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
            <div>
                <ul>
                    ${genres.split(', ').map(genre => `<li>${genre}</li>`).join('')}
                </ul>
            </div>
            <div>
                <p>${data.description || 'No description available.'}</p>
            </div>
            <div>
                <p>${additionalInfo}</p>
                <p>Popularity: ${popularity}</p>
            </div>
            <div>
                <a id="watch-now-link" href="${watchUrl}">Watch Now</a>
            </div>
        </div>
    `;
}

function setupWatchNowShortcut() {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'w') {
            const watchNowLink = document.getElementById('watch-now-link');
            if (watchNowLink && watchNowLink.href) {
                window.location.href = watchNowLink.href;
            }
        }
    });
}

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id');
    const animeData = await fetchAnimeDetails(animeId);
    document.getElementById('anime-details').innerHTML = createAnimeDetails(animeData);
    setupWatchNowShortcut();
}

init();

document.addEventListener('keydown', function (event) {
    if (event.key === 'd' || event.key === 'D') {
        window.location.href = 'index.html';
    }
});
