function extractVideoId(url) {
    var regex = /[?&]v=([^&#]*)/;
    var match = url.match(regex);
    if (match && match[1]) {
        return match[1];
    } else {
        return null;
    }
}

function resetExtensionIcon() {
    chrome.action.setIcon({
        path: {
            "16": "icon16.png",
            "48": "icon48.png",
            "128": "icon128.png"
        }
    });
}

function checkRedirectUrlAvailability(videoId) {
    var redirectUrl = "https://archive.org/details/youtube-" + escape(videoId);

    fetch(redirectUrl)
        .then(response => {
            if (response.ok) {
                chrome.action.setIcon({
                    path: {
                        "16": "icon16-green.png",
                        "48": "icon48-green.png",
                        "128": "icon128-green.png"
                    }
                });
            } else {
                chrome.action.setIcon({
                    path: {
                        "16": "icon16-red.png",
                        "48": "icon48-red.png",
                        "128": "icon128-red.png"
                    }
                });
            }
        })
        .catch(error => {
            console.error("Error checking redirect URL availability:", error);
        });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.tabs.create({
            url: "onboarding.html"
        });
    }
});

chrome.action.onClicked.addListener(function (tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentUrl = tabs[0].url;
        var videoId = extractVideoId(currentUrl);
        if (videoId) {
            var redirectUrl = "https://archive.org/details/youtube-" + escape(videoId);
            chrome.tabs.create({ url: redirectUrl });
        }
    });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        if (tab && tab.url && tab.url.startsWith("http")) {
            var videoId = extractVideoId(tab.url);
            if (videoId) {
                checkRedirectUrlAvailability(videoId);
            } else {
                resetExtensionIcon();
            }
        } else {
            resetExtensionIcon();
        }
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.active && changeInfo.url && changeInfo.url.startsWith("http")) {
        var videoId = extractVideoId(changeInfo.url);
        if (videoId) {
            checkRedirectUrlAvailability(videoId);
        } else {
            resetExtensionIcon();
        }
    }
});