/*
MATTERMOST SEAMLESS ONLINE STATUS

CREATED BY @Nightyonlyy
*/


// Check every 2 minute [DEFAULT MATTERMOST INACTIVITY TIMEOUT IS 5 min]
const CHECK_INTERVAL_MINUTES = 2;


//Grabs the current data from a request to save it in the local storage 
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if (details.url.includes('/api/v4/channels/members/me/view') && details.method === 'POST') {
            chrome.cookies.getAll({ domain: new URL(details.url).hostname }, (cookies) => {
                let xRequestId = null;
                let userId = null;
                let csrfToken = null;

                cookies.forEach(cookie => {
                    if (cookie.name === 'MMAUTHTOKEN') {
                        xRequestId = cookie.value;
                    }
                    if (cookie.name === 'MMUSERID') {
                        userId = cookie.value;
                    }
                    if (cookie.name === 'MMCSRF') {
                        csrfToken = cookie.value;
                    }
                });

                if (xRequestId && userId && csrfToken) {
                    chrome.storage.local.set({ xRequestId, userId, csrfToken }, () => {
                        console.log('Captured data saved:', { xRequestId, userId, csrfToken });
                    });
                } else {
                    console.error('Missing data to save:', { xRequestId, userId, csrfToken });
                }
            });
        }
    },
    { urls: ["<all_urls>"], types: ["xmlhttprequest"] },
    ["requestHeaders", "extraHeaders"]
);

//CREATES an alarm which checks if you're still online or away
chrome.alarms.create("checkStatus", { periodInMinutes: CHECK_INTERVAL_MINUTES });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkStatus") {
        chrome.storage.local.get(["xRequestId", "userId", "csrfToken", ], (data) => {
            console.log("Alarm triggered, retrieved data:", data);
            if (data.xRequestId && data.userId && data.csrfToken) {
                getStatus(data.xRequestId, data.userId, data.csrfToken).then(status => {
                    console.log("Current status:", status);
                    if (status === "away") {
                        updateStatus(data.xRequestId, data.userId, data.csrfToken);
                    }
                });
            } else {
                console.error('Missing data on alarm:', data);
            }
        });
    }
});



//RETURNS the current state [online, away, dnd { => do not desturb}, offline]
//Only updates if state is away 
async function getStatus(xRequestId, userId, csrfToken) {
    try {
        const response = await fetch(`https://chat.orgacard.de/api/v4/users/${userId}/status`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-Token": csrfToken,
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

//SENDS the update request to set your sate to online again
async function updateStatus(xRequestId, userId, csrfToken) {
    try {
        console.log('Updating status with:', { xRequestId, userId, csrfToken });
        const response = await fetch(`https://chat.orgacard.de/api/v4/users/${userId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-Token": csrfToken,
                "X-Request-Id": xRequestId
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
