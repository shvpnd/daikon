async function fetchSchedule(day = 'monday') {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day}`);
        const data = await response.json();

        const popularityThreshold = 6.5;

        const processedShows = data.data
            .filter(show => show.score >= popularityThreshold)
            .map(show => {
                const localTime = convertToLocalTime(show.broadcast.string);
                return { ...show, localTime };
            });

        processedShows.sort((a, b) => a.localTime.date - b.localTime.date);

        displaySchedule(processedShows);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


function convertToLocalTime(broadcastString) {
    const timeRegex = /(\d{2}:\d{2})/;
    const match = broadcastString.match(timeRegex);

    if (match) {
        const timeInJST = match[0];
        const [hours, minutes] = timeInJST.split(':');

        const jstDate = new Date();
        jstDate.setUTCHours(parseInt(hours) - 9);
        jstDate.setUTCMinutes(parseInt(minutes));

        const localDate = new Date(jstDate.toLocaleString("en-US", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));

        const localTimeString = localDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZoneName: 'short'
        });

        return { time: localTimeString, date: localDate };
    }
    return { time: broadcastString, date: null };
}

function displaySchedule(shows) {
    const scheduleContainer = document.getElementById('schedule');
    scheduleContainer.innerHTML = '';

    shows.forEach(show => {
        const showElement = document.createElement('div');
        showElement.classList.add('show');

        showElement.innerHTML = `
<img src="${show.images.jpg.image_url}" alt="${show.title}" width="70px"/>
</a>
<p>${show.titles[0].title}</p>
<small>Airs on: ${show.localTime.time}</small>
`;


        scheduleContainer.appendChild(showElement);
    });
}

function handleDaySelection(event) {
    const selectedDay = event.target.getAttribute('data-day');

    document.querySelectorAll('.day-selector').forEach(selector => {
        selector.classList.remove('active');
    });

    event.target.classList.add('active');
    fetchSchedule(selectedDay);
}

function getCurrentDay() {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayIndex = new Date().getDay();
    return daysOfWeek[currentDayIndex];
}

document.addEventListener('DOMContentLoaded', () => {
    const currentDay = getCurrentDay();
    const currentDaySelector = document.querySelector(`.day-selector[data-day="${currentDay}"]`);
    currentDaySelector.classList.add('active');
    fetchSchedule(currentDay);
});

document.querySelectorAll('.day-selector').forEach(selector => {
    selector.addEventListener('click', handleDaySelection);
});

function updateClock() {
    const now = new Date();
    const utcDate = now.toUTCString();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' };
    const formattedDate = now.toLocaleString('en-US', options);

    document.getElementById('clock').innerText = formattedDate;
}

updateClock();
setInterval(updateClock, 1000);
