const panelStatusEl = document.getElementById('panel-status');
const panelTimeEl = document.getElementById('panel-time');
const bodyElPanel = document.body;

const FOCUS_PANEL_CHANNEL_NAME = 'focumia_focus_panel_channel'; // Must match main script
let broadcastChannel;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function applyPanelTheme(theme) {
    if (theme === 'dark') {
        bodyElPanel.style.backgroundColor = '#1f1f1f'; // Using a slightly off-black for panel
        bodyElPanel.style.color = '#FFFFFF';
    } else { // light
        bodyElPanel.style.backgroundColor = '#e0e0e0'; // Using a light grey for panel
        bodyElPanel.style.color = '#000000';
    }
}

try {
    broadcastChannel = new BroadcastChannel(FOCUS_PANEL_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
        const data = event.data;
        // console.log('Focus panel received:', data); // For debugging

        if (data.timeLeft !== undefined && panelTimeEl) {
            panelTimeEl.textContent = formatTime(data.timeLeft);
        }
        if (data.pomodoroStatusText && panelStatusEl) {
            panelStatusEl.textContent = data.pomodoroStatusText;
        }
        if (data.theme) {
            applyPanelTheme(data.theme);
        }
    };

    // Request initial state once the channel is established
    broadcastChannel.postMessage({ requestInitialState: true });

} catch (e) {
    console.error("BroadcastChannel API is not supported in this environment for the panel.", e);
    if (panelStatusEl) {
        panelStatusEl.textContent = "Error";
        panelTimeEl.textContent = "N/A";
    }
    // Optionally, try to get initial theme from localStorage as a fallback if BC fails completely,
    // though this isn't ideal as it won't update.
    const initialTheme = localStorage.getItem('focumia-theme') || 'light';
    applyPanelTheme(initialTheme);
}


window.addEventListener('beforeunload', () => {
    if (broadcastChannel) {
        broadcastChannel.close(); // Important to close the channel
    }
});