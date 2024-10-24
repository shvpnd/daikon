document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('shortcutsPopup');
    const searchBar = document.getElementById('searchBar');

    document.addEventListener('keydown', function (event) {
        const isSearchBarFocused = document.activeElement === searchBar;

        if (event.key === 'h' || event.key === 'H') {
            if (!isSearchBarFocused) {
                popup.style.display = (popup.style.display === 'flex') ? 'none' : 'flex';
            }
        }

        if (event.key === 'Escape') {
            popup.style.display = 'none';
        }
    });

    window.onclick = function (event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    };
});
