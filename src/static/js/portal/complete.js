// Minimal Larimar portal script (ES5: the Wii U browser is an old WebKit).
// The Miiverse applet keeps its loading screen up until a page calls
// wiiuBrowser.endStartUp(), so that has to happen on every first page load.
(function () {
    var started = false;

    function playSound(name) {
        if (name) {
            wiiuSound.playSoundByName(name, 1);
        }
    }

    function startUp() {
        if (started) {
            return;
        }
        started = true;
        wiiuBrowser.endStartUp();
        wiiuBrowser.lockUserOperation(false);
        wiiuSound.playSoundByName('BGM_OLV_MAIN', 3);
        setTimeout(function () {
            wiiuSound.playSoundByName('BGM_OLV_MAIN_LOOP_NOWAIT', 3);
        }, 90000);
    }

    function setupMenu() {
        var exit = document.querySelector('#global-menu-exit a');
        var back = document.getElementById('global-menu-back');

        if (exit) {
            exit.addEventListener('click', function (e) {
                e.preventDefault();
                wiiuBrowser.closeApplication();
            });
        }

        if (back) {
            if (wiiuBrowser.canHistoryBack()) {
                back.className = back.className.replace(/\bnone\b/, '');
            }
            back.addEventListener('click', function (e) {
                e.preventDefault();
                window.history.back();
            });
        }

        var sounds = document.querySelectorAll('[data-sound]');
        for (var i = 0; i < sounds.length; i++) {
            sounds[i].addEventListener('click', function () {
                playSound(this.getAttribute('data-sound'));
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        startUp();
    });
    // In case DOMContentLoaded already fired or a resource stalls it.
    window.addEventListener('load', startUp);
    setTimeout(startUp, 3000);
})();
