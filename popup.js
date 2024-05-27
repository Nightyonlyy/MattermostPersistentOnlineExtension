document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('scanButton').addEventListener('click', scanMattermost);
    document.getElementById('autoStatusSwitch').addEventListener('change', toggleAutoStatus);
    document.getElementById('viewDataButton').addEventListener('click', toggleStoredData);

    // Restore switch state
    chrome.storage.local.get(["autoStatusEnabled"], (data) => {
        if (data.autoStatusEnabled) {
            document.getElementById('autoStatusSwitch').checked = true;
            updateStatus();
        }
    });

    updateUI();
});

const updateUI = () => {
    chrome.storage.local.get(["mattermostDomain", "userId", "xRequestId", "csrfToken"], (data) => {
        if (data.mattermostDomain && data.userId) {
            document.getElementById('scanResult').innerHTML = `<p>Data successfully stored!</p>`;
        }
    });
}

async function scanMattermost() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let url = new URL(tab.url);
    let mattermostDomain = url.hostname;

    chrome.cookies.getAll({ domain: mattermostDomain }, (cookies) => {
        let userId = null;
        let xRequestId = null;
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

        if (userId && xRequestId && csrfToken) {
            chrome.storage.local.set({ mattermostDomain, userId, xRequestId, csrfToken }, () => {
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
    chrome.storage.local.get(["xRequestId", "userId", "csrfToken"], (data) => {
        console.log("Running updateStatus with data:", data);
        if (data.xRequestId && data.userId && data.csrfToken) {
            fetch(`https://chat.orgacard.de/api/v4/users/${data.userId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-Token": data.csrfToken,
                    "X-Request-Id": data.xRequestId
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

document.getElementById('viewDataButton').addEventListener('click', () => {
    const scanResult = document.getElementById('scanResult');
    if (scanResult.style.display === 'none' || scanResult.style.display === '') {
      viewStoredData();
      scanResult.style.display = 'block';
      document.body.style.height = 'auto';
    } else {
      scanResult.style.display = 'none';
      document.body.style.height = '300px';
    }
  });
  
  const viewStoredData = () => {
    chrome.storage.local.get(["mattermostDomain", "userId", "xRequestId", "csrfToken"], (data) => {
      if (data.mattermostDomain && data.userId) {
        document.getElementById('scanResult').innerHTML = `
          <strong>Stored Data:</strong><br>
          <span>Domain</span><br>
          <button class="copy-button" id="copyDomain">${data.mattermostDomain}</button><br>
          <span>User ID</span><br>
          <button class="copy-button" id="copyUserId">${data.userId}</button><br>
          <span>xRequestId</span><br>
          <button class="copy-button" id="copyXRequestId">${data.xRequestId}</button><br>
          <span>CSRF Token</span><br>
          <button class="copy-button" id="copyCsrfToken">${data.csrfToken}</button><br>
        `;
  
        document.getElementById('copyDomain').addEventListener('click', () => copyToClipboard(data.mattermostDomain));
        document.getElementById('copyUserId').addEventListener('click', () => copyToClipboard(data.userId));
        document.getElementById('copyXRequestId').addEventListener('click', () => copyToClipboard(data.xRequestId));
        document.getElementById('copyCsrfToken').addEventListener('click', () => copyToClipboard(data.csrfToken));
      }
    });
  }
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard');
    });
  }
  