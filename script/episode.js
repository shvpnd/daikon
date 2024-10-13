document.addEventListener('DOMContentLoaded', function () {
    const episodesContainer = document.getElementById('episodes-container');

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    function fetchEpisodes() {
        episodesContainer.innerHTML = '';
        const loader = document.createElement('div');
        loader.classList.add('loader');
        episodesContainer.appendChild(loader);

        const apiUrl = `https://amvstrm-api-olive.vercel.app/api/v1/episode/${id}`;
        console.log(apiUrl);

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                loader.remove();
                data.episodes.forEach(episode => {
                    const episodeCard = document.createElement('div');
                    episodeCard.classList.add('episode-card');

                    const episodeNumber = episode.id.match(/\d+/);
                    const button = document.createElement('button');
                    button.textContent = episodeNumber ? episodeNumber[0] : episode.id;
                    button.onclick = () => {
                        window.location.href = `watch.html?id=${episode.id}`;
                    };

                    episodeCard.appendChild(button);
                    episodesContainer.appendChild(episodeCard);
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                loader.remove();
                episodesContainer.innerHTML = '<p>Failed to load episodes. Please try again later.</p>';
            });
    }

    fetchEpisodes();
});
