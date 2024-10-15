document.addEventListener('DOMContentLoaded', async () => {
    const baseApiUrl = 'https://amvstrm-api-olive.vercel.app/api/v2/stream';
    const episodeApiUrl = 'https://amvstrm-api-olive.vercel.app/api/v1/episode';
    let art = null;
    let episodeList = [];
    let currentEpisodeIndex = 0;

    const getQueryParam = (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    };

    const id = getQueryParam('id');
    if (!id) {
        console.error('No ID provided in URL');
        return;
    }

    const fetchVideoData = async (episodeId) => {
        const apiUrl = `${baseApiUrl}/${episodeId || id}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching API data:', error);
        }
    };

    const initializePlayer = (data) => {
        if (!data || !data.stream || !data.stream.multi || !data.stream.multi.main) {
            console.error('Invalid data received from API:', data);
            return;
        }

        const videoSource = data.stream.multi.main.url;

        if (art) {
            art.destroy();
        }

        art = new Artplayer({
            container: '.artplayer-app',
            url: videoSource,
            type: 'm3u8',
            autoplay: true,
            screenshot: true,
            setting: false,
            fullscreen: true,
            fullscreenWeb: true,
            airplay: true,
            playsInline: true,
            theme: '#c1c1c1',
            icons: {
                state: '<img width="150px" src="/assets/logo.png">',
                indicator: '<img src="/assets/logo.png">',
            },
            customType: {
                m3u8: function (video, url) {
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            video.play();
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                        video.addEventListener('loadedmetadata', () => {
                            video.play();
                        });
                    } else {
                        console.error('Does not support playback of m3u8');
                    }
                },
            },
            moreVideoAttr: {
                'webkit-playsinline': true,
                'playsinline': true,
            },
            lock: true,
        });

        art.on('fullscreen', (state) => {
            if (state) {
                screen.orientation.lock('landscape').catch(() => {
                    console.error('Screen orientation lock failed');
                });
            } else {
                screen.orientation.unlock().catch(() => {
                    console.error('Screen orientation unlock failed');
                });
            }
        });
    };

    const fetchEpisodes = async () => {
        const episodesContainer = document.getElementById('episodes-container');

        const idWithEpisode = getQueryParam('id');
        const baseAnimeId = idWithEpisode.split('-episode')[0];

        const apiUrl = `https://amvstrm-api-olive.vercel.app/api/v1/episode/${baseAnimeId}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data || !Array.isArray(data.episodes) || data.episodes.length === 0) {
                throw new Error('No episodes found in the response.');
            }

            episodeList = data.episodes;

            displayEpisodes();
        } catch (error) {
            console.error('Error fetching episode list:', error);
            episodesContainer.innerHTML = '<p>Failed to load episodes. Please try again later.</p>';
        }
    };


    const displayEpisodes = () => {
        const episodesContainer = document.getElementById('episodes-container');
        episodesContainer.innerHTML = '';

        if (episodeList && episodeList.length > 0) {
            const reversedEpisodeList = [...episodeList].reverse();

            reversedEpisodeList.forEach((episode, index) => {
                const episodeNumber = reversedEpisodeList.length - index;
                const button = document.createElement('button');
                button.textContent = `${episodeNumber}`;
                button.onclick = () => loadEpisode(index);
                episodesContainer.appendChild(button);
            });
        } else {
            episodesContainer.innerHTML = '<p>No episodes available.</p>';
        }
    };

    const loadEpisode = async (index) => {
        currentEpisodeIndex = index;

        const episodeId = episodeList[index].id;

        const newUrl = `watch.html?id=${episodeId}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        const videoData = await fetchVideoData(episodeId);
        initializePlayer(videoData);
    };


    document.getElementById('prev-episode').addEventListener('click', () => {
        if (currentEpisodeIndex < episodeList.length - 1) {
            loadEpisode(currentEpisodeIndex + 1);
        }
    });

    document.getElementById('next-episode').addEventListener('click', () => {
        if (currentEpisodeIndex > 0) {
            loadEpisode(currentEpisodeIndex - 1);
        }
    });

    const videoData = await fetchVideoData();
    if (videoData) {
        initializePlayer(videoData);
    }

    await fetchEpisodes();
});
