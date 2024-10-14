document.addEventListener('DOMContentLoaded', async () => {
  const baseApiUrl = 'https://amvstrm-api-olive.vercel.app/api/v2/stream';
  let art = null;

  const getQueryParam = (param) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
  };

  const id = getQueryParam('id');
  if (!id) {
      console.error('No ID provided in URL');
      return;
  }

  // Fetch video data function
  const fetchVideoData = async () => {
      const apiUrl = `${baseApiUrl}/${id}`;
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

  // Initialize player function
  const initializePlayer = (data) => {
      if (!data || !data.stream || !data.stream.multi || !data.stream.multi.main) {
          console.error('Invalid data received from API:', data);
          return;
      }

      const animeTitle = data.info.title;
      const episodeName = data.info.episode;
      const titleElement = document.createElement('h3');
      titleElement.innerText = `${animeTitle} - ${episodeName}`;

      const artPlayerApp = document.querySelector('.artplayer-app');
      if (artPlayerApp) {
          const parentTd = artPlayerApp.closest('td');

          parentTd.insertBefore(titleElement, artPlayerApp);
      } else {
          console.error('.artplayer-app not found in the DOM');
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
          screenshot: true,
          setting: false,
          autoplay: true,
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
              }
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

  const videoData = await fetchVideoData();
  if (videoData) {
      initializePlayer(videoData);
  }
});
