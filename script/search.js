document.getElementById('searchBar').addEventListener('input', async function () {
    const query = this.value;
    if (query.length < 1) {
        document.getElementById('suggestions').style.display = 'none';
        return;
    }
    const response = await fetch(`https://amvstrm-api-olive.vercel.app/api/v2/search?q=${query}`);
    const data = await response.json();
    const suggestions = data.results.map(item => `
        <a href="./details.html?id=${item.id}" class="suggestion-item">
            <img src="${item.coverImage.extraLarge}" alt="${item.title.userPreferred}">
            <div class="suggestion-details">
                <div class="suggestion-title">${item.title.userPreferred}</div>
                <div class="suggestion-info">${item.genres.join(', ')}</div>
                <div class="suggestion-info">${item.type} | ${item.format} | ${item.seasonYear} | ${(item.averageScore / 10).toFixed(1)}</div>
            </div>
        </a>
    `).join('');
    document.getElementById('suggestions').innerHTML = suggestions;
    document.getElementById('suggestions').style.display = 'block';
});

document.addEventListener('click', function (event) {
    const suggestions = document.getElementById('suggestions');
    const searchBar = document.getElementById('searchBar');
    if (!suggestions.contains(event.target) && !searchBar.contains(event.target)) {
        suggestions.style.display = 'none';
    }
});
