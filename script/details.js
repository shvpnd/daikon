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
                <a href="${watchUrl}">Watch Now</a> <!-- Changed to point to watch.html -->
            </div>
        </div>
    `;
}
