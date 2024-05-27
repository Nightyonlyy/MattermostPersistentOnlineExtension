const CHECK_INTERVAL_MINUTES = 1; // Check every 1 minute

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if (details.url.includes('/api/v4/channels/members/me/view') && details.method === 'POST') {
            let xRequestId = null;

            details.requestHeaders.forEach(header => {
                if (header.name.toLowerCase() === 'x-request-id') {
                    xRequestId = header.value;
                }
            });

            console.log("Captured xRequestId:", xRequestId);

            chrome.cookies.getAll({ domain: new URL(details.url).hostname }, (cookies) => {
                let authToken = null;
                let userId = null;
                let csrfToken = null;

                cookies.forEach(cookie => {
                    if (cookie.name === 'MMAUTHTOKEN') {
                        authToken = cookie.value;
                    }
                    if (cookie.name === 'MMUSERID') {
                        userId = cookie.value;
                    }
                    if (cookie.name === 'MMCSRF') {
                        csrfToken = cookie.value;
                    }
                });

                if (authToken && userId && csrfToken) {
                    chrome.storage.local.set({authToken, userId, csrfToken }, () => {
                        console.log('Captured data saved:', { authToken, userId, csrfToken });
                    });
                } else {
                    console.error('Missing data to save:', {  authToken, userId, csrfToken });
                }
            });
        }
    },
    { urls: ["<all_urls>"], types: ["xmlhttprequest"] },
    ["requestHeaders", "extraHeaders"]
);

chrome.alarms.create("checkStatus", { periodInMinutes: CHECK_INTERVAL_MINUTES });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkStatus") {
        chrome.storage.local.get(["authToken", "userId", "csrfToken", ], (data) => {
            console.log("Alarm triggered, retrieved data:", data);
            if (data.authToken && data.userId && data.csrfToken) {
                getStatus(data.authToken, data.userId, data.csrfToken).then(status => {
                    console.log("Current status:", status);
                    if (status === "away") {
                        updateStatus(data.authToken, data.userId, data.csrfToken);
                    }
                });
            } else {
                console.error('Missing data on alarm:', data);
            }
        });
    }
});

async function getStatus(authToken, userId, csrfToken) {
    try {
        const response = await fetch(`https://chat.orgacard.de/api/v4/users/${userId}/status`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-Token": csrfToken,
                "Authorization": `Bearer ${authToken}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            console.error("Error fetching status:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data.status;
    } catch (error) {
        console.error("Error fetching status:", error);
        return null;
    }
}

async function updateStatus(authToken, userId, csrfToken) {
    try {
        console.log('Updating status with:', { authToken, userId, csrfToken });
        const response = await fetch(`https://chat.orgacard.de/api/v4/users/${userId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-Token": csrfToken,
                "Authorization": `Bearer ${authToken}`,
                "X-Request-Id": authToken
            },
            body: JSON.stringify({
                "user_id": userId,
                "status": "online"
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            console.error("Error updating status:", response.statusText);
        } else {
            console.log("Status successfully updated to 'online'");
        }
    } catch (error) {
        console.error("Error updating status:", error);
    }
}
