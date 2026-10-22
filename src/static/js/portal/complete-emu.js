// Stand-ins for the Wii U browser's built-in objects, so portal pages also
// work in a desktop browser. On a real Wii U these already exist and are kept.
(function () {
    if (typeof window.wiiuBrowser === 'undefined') {
        window.wiiuBrowser = {
            endStartUp: function () {},
            lockUserOperation: function () {},
            canHistoryBack: function () { return window.history.length > 1; },
            closeApplication: function () { window.close(); }
        };
    }
    if (typeof window.wiiuSound === 'undefined') {
        window.wiiuSound = { playSoundByName: function () {} };
    }
})();
