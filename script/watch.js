document.addEventListener('DOMContentLoaded', () => {
  const baseApiUrl = 'https://amvstrm-api-olive.vercel.app/api/v2/stream';
  let art = null;
  let thumbnail = null;

  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  const id = getQueryParam('id');
  if (!id) {
    console.error('No ID provided in URL');
    return;
  }

  const fetchVideoData = () => {
    const apiUrl = `${baseApiUrl}/${id}`;
    return fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .catch(error => {
        console.error('Error fetching API data:', error);
      });
  };

  const saveCurrentTime = (videoId, time) => {
    localStorage.setItem(`lastSeen-${videoId}`, time);
  };

  const getLastSeenTime = (videoId) => {
    return localStorage.getItem(`lastSeen-${videoId}`);
  };

  const initializePlayer = (data) => {
    if (!data || !data.stream || !data.stream.multi || !data.stream.multi.main) {
      console.error('Invalid data received from API:', data);
      return;
    }

    const animeTitle = data.info.title;
    const episodeName = data.info.episode;
    const titleElement = document.createElement('h3');
    titleElement.innerText = `${animeTitle} - ${episodeName}`;
    document.body.insertBefore(titleElement, document.querySelector('.artplayer-app'));

    const navButtons = document.createElement('div');
    navButtons.className = 'navigation-buttons';

    const prevButton = document.createElement('button');
    prevButton.innerText = 'Previous';
    prevButton.onclick = () => {
      console.log('Navigate to previous episode');
    };

    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.onclick = () => {
      console.log('Navigate to next episode');
    };

    navButtons.appendChild(prevButton);
    navButtons.appendChild(nextButton);
    document.body.insertBefore(navButtons, document.querySelector('.artplayer-app'));

    const videoSource = data.stream.multi.main.url;
    const thumbnailTrack = data.stream.tracks && data.stream.tracks.kind === 'thumbnails' ? {
      label: "Thumbnails",
      file: data.stream.tracks.file
    } : null;

    document.title = data.info.title;
    const lastSeenTime = getLastSeenTime(id);

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
            art.notice.show('Does not support playback of m3u8');
          }
        }
      },
      moreVideoAttr: {
        'webkit-playsinline': true,
        'playsinline': true,
      },
      lock: true,
    });

    art.on('video:timeupdate', () => {
      saveCurrentTime(id, art.currentTime);
    });

    if (lastSeenTime) {
      art.notice.show(
        `Resume from last seen position?`,
        [
          {
            html: 'Yes',
            onClick: () => {
              art.currentTime = parseFloat(lastSeenTime);
              art.notice.hide();
            },
          },
          {
            html: 'No',
            onClick: () => {
              art.notice.hide();
            },
          },
        ],
        5000,
      );
    }

    const backButton = document.createElement('div');
    backButton.innerHTML = '&lt;';
    backButton.style.position = 'absolute';
    backButton.style.top = '10px';
    backButton.style.left = '10px';
    backButton.style.fontSize = '24px';
    backButton.style.color = 'white';
    backButton.style.cursor = 'pointer';
    backButton.style.zIndex = '9999';

    backButton.addEventListener('click', () => {
      window.history.back();
    });

    const playerContainer = document.querySelector('.artplayer-app');
    playerContainer.appendChild(backButton);

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

    if (thumbnail) {
      thumbnail.destroy();
    }

    thumbnail = new ArtplayerToolThumbnail({
      fileInput: document.querySelector('.artplayer-app'),
      number: 60,
      width: 160,
      column: 10,
      begin: 0,
      end: NaN,
    });

    thumbnail.on('file', (file) => {
      console.log('Read video successfully: ' + file.name);
    });

    thumbnail.on('video', (video) => {
      console.log('Video size: ' + video.videoWidth + ' x ' + video.videoHeight);
      console.log('Video duration: ' + video.duration + 's');
      thumbnail.start();
    });

    thumbnail.on('canvas', (canvas) => {
      console.log('Build canvas successfully');
      console.log('Canvas size: ' + canvas.width + ' x ' + canvas.height);
      console.log('Preview density: ' + thumbnail.density + ' p/s');
    });

    thumbnail.on('update', (url, percentage) => {
      console.log('Processing: ' + Math.floor(percentage.toFixed(2) * 100) + '%');
    });

    thumbnail.on('download', (name) => {
      console.log('Start download preview: ' + name);
    });

    thumbnail.on('done', () => {
      console.log('Build preview image complete');
      thumbnail.download();

      new Artplayer({
        container: '.artplayer-app',
        url: videoSource,
        autoSize: true,
        poster: thumbnail.thumbnailUrl,
        thumbnails: {
          url: thumbnail.thumbnailUrl,
          number: thumbnail.option.number,
          column: thumbnail.option.column,
        },
      });

      console.log('Build player complete');
    });
  };

  fetchVideoData().then(initializePlayer);
});