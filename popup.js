document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('scanButton').addEventListener('click', scanMattermost);
    document.getElementById('autoStatusSwitch').addEventListener('change', toggleAutoStatus);

    // Restore switch state
    chrome.storage.local.get(["autoStatusEnabled"], (data) => {
        if (data.autoStatusEnabled) {
            document.getElementById('autoStatusSwitch').checked = true;
            updateStatus();
        }
    });
	
    updateUI();
});

function updateUI() {
    chrome.storage.local.get(["mattermostDomain", "userId", "xRequestId", "csrfToken", "authToken"], (data) => {
        if (data.mattermostDomain && data.userId) {
            document.getElementById('scanResult').innerHTML = `Domain: ${data.mattermostDomain}<br>
																User ID: ${data.userId}<br>
																X-Request-Id: ${data.xRequestId}<br>
																CSRF Token: ${data.csrfToken}<br>
																Auth Token: ${data.authToken}`;
        }
    });
}



async function scanMattermost() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let url = new URL(tab.url);
    let mattermostDomain = url.hostname;

    chrome.cookies.getAll({ domain: mattermostDomain }, (cookies) => {
        let userId = null;
        let authToken = null;
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

        if (userId && authToken && csrfToken) {
            chrome.storage.local.set({ mattermostDomain, userId, authToken, csrfToken }, () => {
                updateUI();
                alert('Data automatically fetched and saved.');
            });
        } else {
            alert('Could not fetch user ID, Auth Token, or CSRF Token.');
        }
    });
}


function toggleAutoStatus(event) {
    const isChecked = event.target.checked;
    chrome.storage.local.set({ autoStatusEnabled: isChecked });

    if (isChecked) {
        chrome.alarms.create("checkStatus", { periodInMinutes: 1 });
        updateStatus(); 
    } else {
        chrome.alarms.clear("checkStatus");
    }
}

function updateStatus() {
    chrome.storage.local.get(["authToken", "userId", "csrfToken"], (data) => {
        console.log("Running updateStatus with data:", data);
        if (data.authToken && data.userId && data.csrfToken) {
            fetch(`https://chat.orgacard.de/api/v4/users/${data.userId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-Token": data.csrfToken,
                    "X-Request-Id": data.authToken
                },
                body: JSON.stringify({
                    "user_id": data.userId,
                    "status": "online"
                }),
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    console.error("Error updating status:", response.statusText);
                } else {
                    console.log("Status successfully updated to 'online'");
                }
            })
            .catch(error => {
                console.error("Error updating status:", error);
            });
        } else {
            console.error("Missing necessary data to update status.");
        }
    });
}


