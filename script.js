// --- Global State & DOM Elements ---
let currentTheme = localStorage.getItem('focumia-theme') || 'light';
let currentTimerSettings = {
    pomodoroDuration: 25, shortBreakDuration: 5, longBreakDuration: 15,
    pomodorosBeforeLongBreak: 4, soundNotifications: true, browserNotifications: true
};
let tasksCache = [];
let pomodoroInterval = null;
let timeLeftInSeconds = currentTimerSettings.pomodoroDuration * 60;
let isTimerActive = false;
let isBreakTime = false;
let pomodorosSessionCount = 0;

let streaksData = {};
let currentWeekIdentifier = '';
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let streaksChartInstance = null;

// For Productivity Insights
let sessionHistory = [];
let focusedHoursChartInstance = null;

// For Focus Panel
let focusPanelWindow = null;
const FOCUS_PANEL_CHANNEL_NAME = 'focumia_focus_panel_channel';
let broadcastChannel = null;

// For Calendar
let calendarInstance = null;
const CALENDAR_NOTIFICATION_CHECK_INTERVAL = 60000; // 1 minute in ms
let notificationCheckIntervalId = null;


const bodyEl = document.body;
const splashScreenEl = document.getElementById('splash-screen');
const mainAppAreaEl = document.getElementById('main-app-area');
const pageContentEl = document.getElementById('page-content');
const allPages = document.querySelectorAll('.page');

const themeToggleButton = document.getElementById('theme-toggle-button');
const menuButton = document.getElementById('menu-button');
const menuDropdown = document.getElementById('menu-dropdown');
const logoFocumiaEl = document.getElementById('logo-focumia');
const openFocusPanelButton = document.getElementById('open-focus-panel-button');


const pomodoroStatusTextEl = document.getElementById('pomodoro-status-text');
const pomodoroTimeDisplayEl = document.getElementById('pomodoro-time-display');
const timerStartPauseButton = document.getElementById('timer-start-pause-button');
const timerResetButton = document.getElementById('timer-reset-button');
const timerSkipButton = document.getElementById('timer-skip-button');

const newTaskInput = document.getElementById('new-task-input');
const addTaskButton = document.getElementById('add-task-button');
const taskListUl = document.getElementById('task-list-ul');
const taskCounterHomeEl = document.getElementById('task-counter-home');

const timerSettingsForm = document.getElementById('timer-settings-form');
const settingsMessageDiv = document.getElementById('settings-message');
const notificationSound = document.getElementById('notification-sound');
const calendarDaysContainer = document.getElementById('calendar-days-container');

const homepageReviewSection = document.getElementById('homepage-review-section');
const homepageReviewTitle = document.getElementById('homepage-review-title');
const homepageReviewContent = document.getElementById('homepage-review-content');
const closeHomepageReviewButton = document.getElementById('close-homepage-review-button');

// Calendar Page Elements
const calendarEl = document.getElementById('calendar-container');
const calendarTaskModalEl = document.getElementById('calendar-task-modal');
const calendarTaskForm = document.getElementById('calendar-task-form');
const calendarTaskModalCloseButton = document.getElementById('calendar-task-modal-close-button');
const calendarAddTaskButton = document.getElementById('calendar-add-task-button');
const calendarTaskDeleteButton = document.getElementById('calendar-task-delete-button');


const ICONS = {
    sun: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 12a2.25 2.25 0 00-2.25 2.25c0 1.37.295 2.655.82 3.801M12 12a2.25 2.25 0 01-2.25-2.25 2.25 2.25 0 012.25-2.25 2.25 2.25 0 012.25 2.25c-.001.745-.224 1.43-.606 2.005M15 15.75a3 3 0 01-6 0m3-10.5V4.5" /></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21c3.73 0 7.01-1.739 9.002-4.498z" /></svg>`,
    menu: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>`,
    play: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>`,
    pause: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>`,
    reset: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>`,
    skip: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" /></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" class="w-5 h-5 checkmark-icon"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>`,
    panel: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>`
};

// --- Date Utility Functions ---
function getCurrentISOWeekAndYear() {
    const date = new Date();
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getCurrentDayISO() { // 0 for Monday, 6 for Sunday
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
}

// --- Streaks Data Functions ---
function loadStreaksDataFromLocalStorage() {
    const storedStreaks = localStorage.getItem('focumia-streaksData');
    streaksData = storedStreaks ? JSON.parse(storedStreaks) : {};
    currentWeekIdentifier = getCurrentISOWeekAndYear();

    if (!streaksData[currentWeekIdentifier]) {
        streaksData[currentWeekIdentifier] = DAY_NAMES.map(dayName => ({
            day: dayName, tasksCompletedScore: 0, focusSessionsScore: 0, totalScore: 0
        }));
        saveStreaksDataToLocalStorage();
    } else {
        const currentWeekData = streaksData[currentWeekIdentifier];
        const validatedWeekData = DAY_NAMES.map((dayName, index) => {
            const existingDayData = currentWeekData.find(d => d.day === dayName) || (currentWeekData[index] && currentWeekData[index].day === dayName ? currentWeekData[index] : null) ;
            if (existingDayData) {
                const tasksScore = Number(existingDayData.tasksCompletedScore) || 0;
                const focusScore = Number(existingDayData.focusSessionsScore) || 0;
                return {
                    day: dayName,
                    tasksCompletedScore: tasksScore,
                    focusSessionsScore: focusScore,
                    totalScore: tasksScore + focusScore
                };
            }
            return { day: dayName, tasksCompletedScore: 0, focusSessionsScore: 0, totalScore: 0 };
        });
        streaksData[currentWeekIdentifier] = validatedWeekData;
    }
}

function saveStreaksDataToLocalStorage() {
    localStorage.setItem('focumia-streaksData', JSON.stringify(streaksData));
}

function updateStreakScore(type) {
    loadStreaksDataFromLocalStorage();
    const todayIndex = getCurrentDayISO();

    if (!streaksData[currentWeekIdentifier]) {
        streaksData[currentWeekIdentifier] = DAY_NAMES.map(dayName => ({
            day: dayName, tasksCompletedScore: 0, focusSessionsScore: 0, totalScore: 0
        }));
    }

    const dayData = streaksData[currentWeekIdentifier][todayIndex];

    if (dayData) {
        if (type === 'task') dayData.tasksCompletedScore += 10;
        else if (type === 'focus') dayData.focusSessionsScore += 5;
        dayData.totalScore = (dayData.tasksCompletedScore || 0) + (dayData.focusSessionsScore || 0);
        saveStreaksDataToLocalStorage();

        if (document.getElementById('streaks-page')?.classList.contains('active')) {
            renderStreaksTable();
            renderStreaksChart();
        }
    } else {
        console.error("Failed to update streak score for", currentWeekIdentifier, `day index: ${todayIndex}`);
    }
}

// --- Productivity Insights Data Functions ---
function loadSessionHistoryFromLocalStorage() {
    const storedHistory = localStorage.getItem('focumia-session-history');
    sessionHistory = storedHistory ? JSON.parse(storedHistory) : [];
}

function saveSessionHistoryToLocalStorage() {
    localStorage.setItem('focumia-session-history', JSON.stringify(sessionHistory));
}


// --- Core App Functions ---
function applyTheme(theme) {
    bodyEl.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.setProperty('--current-theme', theme);
    localStorage.setItem('focumia-theme', theme);
    if (themeToggleButton) themeToggleButton.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;

    const scrollbarStyle = document.getElementById('dynamic-scrollbar-style');
    if (scrollbarStyle) scrollbarStyle.remove();
    const newScrollbarStyle = document.createElement('style');
    newScrollbarStyle.id = 'dynamic-scrollbar-style';
    const computedStyles = getComputedStyle(bodyEl);
    newScrollbarStyle.innerHTML = `
        ::-webkit-scrollbar-track { background: ${computedStyles.getPropertyValue('--scrollbar-track')}; }
        ::-webkit-scrollbar-thumb { background: ${computedStyles.getPropertyValue('--scrollbar-thumb')}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${computedStyles.getPropertyValue('--scrollbar-thumb-hover')}; }
    `;
    document.head.appendChild(newScrollbarStyle);

    if (document.getElementById('home-page')?.classList.contains('active')) {
        renderTasks(tasksCache);
        renderWeeklyCalendar();
    }
    if (document.getElementById('streaks-page')?.classList.contains('active')) {
        renderStreaksChart();
    }
    if (document.getElementById('insights-page')?.classList.contains('active')) {
        renderFocusedHoursChart();
    }
    if (document.getElementById('calendar-page')?.classList.contains('active')) {
        refreshCalendarEvents(); // Re-render events with new theme colors
    }
    if (focusPanelWindow && !focusPanelWindow.closed) {
        notifyFocusPanel();
    }
}

function renderWeeklyCalendar() {
    if (!calendarDaysContainer) return;
    calendarDaysContainer.innerHTML = '';
    const today = new Date();
    const currentDayOfWeekISO = getCurrentDayISO();

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() - currentDayOfWeekISO + i);
        const dateStringForReview = dayDate.toISOString().split('T')[0];

        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day-item flex-1 flex flex-col items-center justify-center p-2 rounded-lg jersey-10-regular themed-bg-secondary';
        dayDiv.setAttribute('data-date', dateStringForReview);

        const dayNameSpan = document.createElement('span');
        dayNameSpan.className = 'text-lg md:text-xl themed-text-secondary';
        dayNameSpan.textContent = DAY_NAMES[i];
        const dateNumberSpan = document.createElement('span');
        dateNumberSpan.className = 'text-3xl md:text-4xl themed-text-primary mt-1';
        dateNumberSpan.textContent = dayDate.getDate();
        dayDiv.appendChild(dayNameSpan);
        dayDiv.appendChild(dateNumberSpan);

        if (i === currentDayOfWeekISO) {
            dayDiv.classList.remove('themed-bg-secondary');
            dayDiv.classList.add('themed-button-primary', 'current-calendar-day');
            const buttonPrimaryTextColor = getComputedStyle(bodyEl).getPropertyValue('--button-primary-text').trim();
            dayNameSpan.style.color = buttonPrimaryTextColor;
            dateNumberSpan.style.color = buttonPrimaryTextColor;
        }

        dayDiv.addEventListener('click', () => {
            showHomepageReview(dateStringForReview);
        });
        calendarDaysContainer.appendChild(dayDiv);
    }
}

function showPage(pageId) {
    allPages.forEach(page => {
        page.classList.toggle('active', page.id === pageId);
        page.classList.toggle('hidden', page.id !== pageId);
    });
    if (menuDropdown) menuDropdown.classList.add('hidden');

    if (pageId !== 'home-page' && homepageReviewSection && !homepageReviewSection.classList.contains('hidden')) {
        hideHomepageReview();
    }

    if (pageId === 'home-page') {
        renderTasks(tasksCache);
        renderWeeklyCalendar();
    } else if (pageId === 'streaks-page') {
        loadStreaksDataFromLocalStorage();
        renderStreaksTable();
        renderStreaksChart();
    } else if (pageId === 'insights-page') {
        renderInsightsPage();
    } else if (pageId === 'calendar-page') {
        initializeFocumiaCalendar();
    }
    window.scrollTo(0, 0);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    if (pomodoroTimeDisplayEl) pomodoroTimeDisplayEl.textContent = formatTime(timeLeftInSeconds);
    if (pomodoroStatusTextEl) pomodoroStatusTextEl.textContent = isBreakTime ? "Break Time" : "Focus Time";
    if (timerStartPauseButton) timerStartPauseButton.innerHTML = isTimerActive ? `${ICONS.pause} Pause` : `${ICONS.play} Start`;

    if (focusPanelWindow && !focusPanelWindow.closed) {
        notifyFocusPanel();
    }
}

function playNotifSound() {
    if (currentTimerSettings.soundNotifications && notificationSound) {
        notificationSound.currentTime = 0;
        notificationSound.play().catch(e => console.warn("Audio play failed:", e));
    }
}
function showBrowserNotification(title, body) {
    if (currentTimerSettings.browserNotifications && Notification.permission === "granted") {
        new Notification(title, { body, icon: 'logo.png' });
    }
}

function startNextCycle() {
    isTimerActive = false;
    if (isBreakTime) { // Break just finished, start focus
        isBreakTime = false;
        timeLeftInSeconds = currentTimerSettings.pomodoroDuration * 60;
        showBrowserNotification("Break Over!", "Time to get back to focus!");
    } else { // Focus just finished, start break & update score
        const sessionEndTime = new Date().toISOString();
        const sessionDuration = currentTimerSettings.pomodoroDuration;

        sessionHistory.push({
            type: 'focus',
            endTime: sessionEndTime,
            durationMinutes: sessionDuration,
            pomodorosBefore: pomodorosSessionCount
        });
        saveSessionHistoryToLocalStorage();

        updateStreakScore('focus');
        pomodorosSessionCount++;
        isBreakTime = true;
        timeLeftInSeconds = (pomodorosSessionCount % currentTimerSettings.pomodorosBeforeLongBreak === 0) ?
                            currentTimerSettings.longBreakDuration * 60 :
                            currentTimerSettings.shortBreakDuration * 60;
        showBrowserNotification("Pomodoro Complete!", "Time for a break!");
    }
    playNotifSound();
    updateTimerDisplay();
}

function tick() {
    if (timeLeftInSeconds > 0) {
        timeLeftInSeconds--;
        updateTimerDisplay();
    } else {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        startNextCycle();
    }
}

if (timerStartPauseButton) timerStartPauseButton.addEventListener('click', () => {
    isTimerActive = !isTimerActive;
    if (isTimerActive && !pomodoroInterval) pomodoroInterval = setInterval(tick, 1000);
    else if (!isTimerActive && pomodoroInterval) { clearInterval(pomodoroInterval); pomodoroInterval = null; }
    updateTimerDisplay();
});
if (timerResetButton) timerResetButton.addEventListener('click', () => {
    clearInterval(pomodoroInterval); pomodoroInterval = null;
    isTimerActive = false; isBreakTime = false; pomodorosSessionCount = 0;
    timeLeftInSeconds = currentTimerSettings.pomodoroDuration * 60;
    updateTimerDisplay();
});
if (timerSkipButton) timerSkipButton.addEventListener('click', () => {
    clearInterval(pomodoroInterval); pomodoroInterval = null;
    startNextCycle();
});

function saveTasksToLocalStorage() {localStorage.setItem('focumia-tasks', JSON.stringify(tasksCache));}
function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('focumia-tasks');
    tasksCache = storedTasks ? (JSON.parse(storedTasks) || []) : [];
    tasksCache.forEach(task => {
        if (task.completionDate === undefined) task.completionDate = null;
        if (task.hasAwardedCompletionPoints === undefined) {
            task.hasAwardedCompletionPoints = (task.completed && task.completionDate) ? true : false;
        }
        if (task.startDate === undefined) task.startDate = null;
        if (task.dueDate === undefined) task.dueDate = null;
        if (task.isAllDay === undefined) task.isAllDay = true;
        if (task.description === undefined) task.description = "";
        if (task.deadlineNotified === undefined) task.deadlineNotified = false;
    });
}

function renderTasks(tasks) {
    const completedTasksCount = tasks.filter(task => task.completed).length;
    const totalTasksCount = tasks.length;
    if (taskCounterHomeEl) taskCounterHomeEl.textContent = `${completedTasksCount}/${totalTasksCount} done`;
    if (!taskListUl) return;
    taskListUl.innerHTML = '';
    if (tasks.length === 0) {
        taskListUl.innerHTML = `<li class="text-center themed-text-secondary text-xl">No tasks yet. Add one!</li>`;
        return;
    }
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item flex items-center justify-between p-3 rounded-md themed-bg-secondary ${task.completed ? 'completed' : ''}`;
        const checkIconHTML = task.completed ? ICONS.check : '';
        li.innerHTML = `
            <div class="flex items-center flex-grow">
                <button data-task-id="${task.id}" class="task-toggle-button w-7 h-7 mr-4 rounded flex items-center justify-center transition-all ${task.completed ? 'completed' : 'incomplete'}">${checkIconHTML}</button>
                <span class="task-text text-2xl themed-text-primary">${escapeHtml(task.text)}</span>
            </div>
            <button data-task-id="${task.id}" class="task-delete-button text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-2xl px-2 ml-2" aria-label="Delete task">&times;</button>
        `;
        taskListUl.appendChild(li);
    });

    taskListUl.querySelectorAll('.task-toggle-button').forEach(button => button.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.taskId;
        const taskIndex = tasksCache.findIndex(t => t.id === id);
        if (taskIndex > -1) {
            const task = tasksCache[taskIndex];
            const wasCompleted = task.completed;
            task.completed = !task.completed;

            if (task.completed) {
                task.completionDate = new Date().toISOString().split('T')[0];
                if (!wasCompleted && !task.hasAwardedCompletionPoints) {
                    updateStreakScore('task');
                    task.hasAwardedCompletionPoints = true;
                }
            } else {
                task.completionDate = null;
            }
            saveTasksToLocalStorage();
            renderTasks(tasksCache);
            refreshCalendarEvents();
        }
    }));

    taskListUl.querySelectorAll('.task-delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.taskId;
            const taskIndex = tasksCache.findIndex(t => t.id === id);
            if (taskIndex > -1) {
                tasksCache.splice(taskIndex, 1);
                saveTasksToLocalStorage();
                renderTasks(tasksCache);
                refreshCalendarEvents();
            }
        });
    });
}
function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

if (addTaskButton && newTaskInput) {
    addTaskButton.addEventListener('click', () => {
        const text = newTaskInput.value.trim();
        if (text === '') return;
        tasksCache.push({
            id: Date.now().toString(), text: text, completed: false,
            createdAt: new Date().toISOString(), completionDate: null,
            hasAwardedCompletionPoints: false,
            startDate: null, dueDate: null, isAllDay: true, description: "", deadlineNotified: false
        });
        saveTasksToLocalStorage();
        renderTasks(tasksCache);
        refreshCalendarEvents();
        newTaskInput.value = '';
    });
    newTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTaskButton.click(); });
}

function loadTimerSettingsFromLocalStorage() {
    const storedSettings = localStorage.getItem('focumia-timer-settings');
    if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        currentTimerSettings.pomodoroDuration = parsedSettings.pomodoroDuration || 25;
        currentTimerSettings.shortBreakDuration = parsedSettings.shortBreakDuration || 5;
        currentTimerSettings.longBreakDuration = parsedSettings.longBreakDuration || 15;
        currentTimerSettings.pomodorosBeforeLongBreak = parsedSettings.pomodorosBeforeLongBreak || 4;
        currentTimerSettings.soundNotifications = typeof parsedSettings.soundNotifications === 'boolean' ? parsedSettings.soundNotifications : true;
        currentTimerSettings.browserNotifications = typeof parsedSettings.browserNotifications === 'boolean' ? parsedSettings.browserNotifications : true;
    }

    if (timerSettingsForm) {
        timerSettingsForm.pomodoroDuration.value = currentTimerSettings.pomodoroDuration;
        timerSettingsForm.shortBreakDuration.value = currentTimerSettings.shortBreakDuration;
        timerSettingsForm.longBreakDuration.value = currentTimerSettings.longBreakDuration;
        timerSettingsForm.pomodorosBeforeLongBreak.value = currentTimerSettings.pomodorosBeforeLongBreak;
        timerSettingsForm.soundNotifications.checked = currentTimerSettings.soundNotifications;
        timerSettingsForm.browserNotifications.checked = currentTimerSettings.browserNotifications;
    }
    timeLeftInSeconds = currentTimerSettings.pomodoroDuration * 60;
    updateTimerDisplay();
}

if (timerSettingsForm) timerSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentTimerSettings = {
        pomodoroDuration: parseInt(timerSettingsForm.pomodoroDuration.value) || 25,
        shortBreakDuration: parseInt(timerSettingsForm.shortBreakDuration.value) || 5,
        longBreakDuration: parseInt(timerSettingsForm.longBreakDuration.value) || 15,
        pomodorosBeforeLongBreak: parseInt(timerSettingsForm.pomodorosBeforeLongBreak.value) || 4,
        soundNotifications: timerSettingsForm.soundNotifications.checked,
        browserNotifications: timerSettingsForm.browserNotifications.checked,
    };
    localStorage.setItem('focumia-timer-settings', JSON.stringify(currentTimerSettings));

    if (settingsMessageDiv) {
        settingsMessageDiv.textContent = "Timer settings saved!";
        settingsMessageDiv.classList.remove('hidden');
        setTimeout(() => settingsMessageDiv.classList.add('hidden'), 3000);
    }

    if (!isTimerActive) {
        timeLeftInSeconds = currentTimerSettings.pomodoroDuration * 60;
        isBreakTime = false;
        pomodorosSessionCount = 0;
        updateTimerDisplay();
    }
});

// --- Streaks Page Rendering ---
function renderStreaksTable() {
    const container = document.getElementById('streaksTableContainer');
    if (!container) return;
    const weekData = streaksData[currentWeekIdentifier] || DAY_NAMES.map(dayName => ({day: dayName, tasksCompletedScore:0, focusSessionsScore:0, totalScore:0}));
    let tableHTML = `<table class="w-full text-left themed-text-primary text-xl md:text-2xl jersey-10-regular"><thead class="themed-border-b"><tr>
        <th class="p-2 sm:p-3">Day</th><th class="p-2 sm:p-3 text-right">Task Score</th><th class="p-2 sm:p-3 text-right">Focus Score</th><th class="p-2 sm:p-3 text-right font-bold">Total Score</th>
        </tr></thead><tbody>`;
    weekData.forEach(data => {
        tableHTML += `<tr class="themed-border-b"><td class="p-2 sm:p-3">${data.day}</td><td class="p-2 sm:p-3 text-right">${data.tasksCompletedScore}</td>
        <td class="p-2 sm:p-3 text-right">${data.focusSessionsScore}</td><td class="p-2 sm:p-3 text-right font-bold">${data.totalScore}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;
    container.innerHTML = tableHTML;
}

function renderStreaksChart() {
    const canvas = document.getElementById('streaksChartCanvas');
    if (!canvas || typeof Chart === 'undefined') return;
    const weekData = streaksData[currentWeekIdentifier] || DAY_NAMES.map(dName => ({ day: dName, totalScore: 0 }));
    const labels = weekData.map(d => d.day);
    const scores = weekData.map(d => d.totalScore);
    const bodyStyles = getComputedStyle(document.body);
    const primaryButtonBg = bodyStyles.getPropertyValue('--button-primary-bg').trim() || (currentTheme === 'dark' ? '#FFFFFF' : '#000000');
    const textColorSecondary = bodyStyles.getPropertyValue('--text-secondary').trim();
    const textColorPrimary = bodyStyles.getPropertyValue('--text-primary').trim();
    const borderColor = bodyStyles.getPropertyValue('--border-color').trim();

    function colorToRgba(color, alpha) {
        if (!color) color = '#000000';
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else if (color.startsWith('rgb(')) {
            return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
        } else if (color.startsWith('rgba(')) {
             return color.replace(/,\s*\d(\.\d+)?\)/, `, ${alpha})`);
        }
        return `rgba(0,0,0, ${alpha})`;
    }

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Daily Score', data: scores, fill: true,
            borderColor: primaryButtonBg,
            backgroundColor: colorToRgba(primaryButtonBg, 0.2),
            tension: 0.2, pointRadius: 5, pointBackgroundColor: primaryButtonBg,
        }]
    };
    if (streaksChartInstance) streaksChartInstance.destroy();
    streaksChartInstance = new Chart(canvas, {
        type: 'line', data: chartData,
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { color: textColorSecondary, font: { family: "'Jersey 10', sans-serif", size: 14 }}, grid: { color: borderColor }},
                x: { ticks: { color: textColorSecondary, font: { family: "'Jersey 10', sans-serif", size: 14 }}, grid: { display: false }}
            },
            plugins: { legend: { display: true, labels: { color: textColorPrimary, font: { family: "'Jersey 10', sans-serif", size: 16 }}}}
        }
    });
}

// --- Productivity Insights Page Rendering ---
function renderInsightsPage() {
    renderFocusedHoursChart();
    renderSessionHistory();
}

function renderFocusedHoursChart() {
    const canvas = document.getElementById('focusedHoursChartCanvas');
    const messageEl = document.getElementById('insights-focused-hours-message');
    if (!canvas || !messageEl || typeof Chart === 'undefined') {
        if (messageEl) messageEl.textContent = 'Chart library not loaded or canvas not found.';
        return;
    }

    if (sessionHistory.length === 0) {
        messageEl.textContent = 'No focus session data yet. Complete some Pomodoros to see your focused hours!';
        if (focusedHoursChartInstance) {
            focusedHoursChartInstance.destroy();
            focusedHoursChartInstance = null;
        }
        if (canvas) canvas.style.display = 'none';
        return;
    }
    if (canvas) canvas.style.display = 'block';
    messageEl.textContent = 'Distribution of your completed focus sessions by hour of the day.';

    const hoursData = new Array(24).fill(0);
    sessionHistory.forEach(session => {
        if (session.type === 'focus' && session.endTime) {
            const endDate = new Date(session.endTime);
            hoursData[endDate.getHours()]++;
        }
    });

    const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    const bodyStyles = getComputedStyle(document.body);
    const primaryButtonBg = bodyStyles.getPropertyValue('--button-primary-bg').trim() || (currentTheme === 'dark' ? '#FFFFFF' : '#000000');
    const textColorSecondary = bodyStyles.getPropertyValue('--text-secondary').trim();
    const textColorPrimary = bodyStyles.getPropertyValue('--text-primary').trim();
    const borderColor = bodyStyles.getPropertyValue('--border-color').trim();

    function colorToRgba(color, alpha) {
        if (!color) color = '#000000';
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else if (color.startsWith('rgb(')) {
            return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
        } else if (color.startsWith('rgba(')) {
             return color.replace(/,\s*\d(\.\d+)?\)/, `, ${alpha})`);
        }
        return `rgba(0,0,0, ${alpha})`;
    }

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Focus Sessions',
            data: hoursData,
            backgroundColor: colorToRgba(primaryButtonBg, 0.6),
            borderColor: primaryButtonBg,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.7
        }]
    };

    if (focusedHoursChartInstance) focusedHoursChartInstance.destroy();
    focusedHoursChartInstance = new Chart(canvas, {
        type: 'bar', data: chartData,
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { color: textColorSecondary, font: { family: "'Jersey 10', sans-serif", size: 14 }, stepSize: 1 }, grid: { color: borderColor }},
                x: { ticks: { color: textColorSecondary, font: { family: "'Jersey 10', sans-serif", size: 12 }}, grid: { display: false }}
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) label += context.parsed.y + (context.parsed.y === 1 ? ' session' : ' sessions');
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function renderSessionHistory() {
    const container = document.getElementById('sessionHistoryContainer');
    if (!container) return;

    if (sessionHistory.length === 0) {
        container.innerHTML = `<p class="themed-text-secondary text-xl">No focus sessions recorded yet.</p>`;
        return;
    }
    const recentSessions = sessionHistory.slice().reverse().slice(0, 50);
    let listHTML = `<ul class="space-y-3 jersey-10-regular text-xl md:text-2xl">`;
    recentSessions.forEach(session => {
        if (session.type === 'focus') {
            const endDate = new Date(session.endTime);
            const formattedDate = endDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            const formattedTime = endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            listHTML += `
                <li class="themed-text-primary p-3 themed-bg-tertiary rounded">
                    <span class="font-bold">${session.durationMinutes} min Focus</span>
                    <span class="themed-text-secondary text-lg"> - Completed at ${formattedTime} on ${formattedDate}</span>
                </li>`;
        }
    });
    listHTML += `</ul>`;
    container.innerHTML = listHTML;
}

// --- Focus Panel Functions ---
function openFocusPanel() {
    if (focusPanelWindow && !focusPanelWindow.closed) {
        focusPanelWindow.focus();
    } else {
        const panelWidth = 300;
        const panelHeight = 160;
        const left = (screen.width / 2) - (panelWidth / 2);
        const top = (screen.height / 2) - (panelHeight / 2);
        focusPanelWindow = window.open(
            'focus-panel.html',
            'FocumiaFocusPanel',
            `width=${panelWidth},height=${panelHeight},left=${left},top=${top},resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`
        );
    }
}

function notifyFocusPanel() {
    if (broadcastChannel) {
        broadcastChannel.postMessage({
            timeLeft: timeLeftInSeconds,
            pomodoroStatusText: pomodoroStatusTextEl ? pomodoroStatusTextEl.textContent : (isBreakTime ? "Break Time" : "Focus Time"),
            theme: currentTheme
        });
    }
}

// --- ICS Export Functions ---
function generateICS(tasks, dateString) {
    let icsContent = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Focumia//NONSGML v1.0//EN"];
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    tasks.forEach(task => {
        if (task.completed && task.completionDate === dateString) {
            const now = new Date().toISOString().replace(/-|:|\.\d+/g, "");
            const taskDateFormatted = `${year}${month.toString().padStart(2,'0')}${day.toString().padStart(2,'0')}`;
            icsContent.push("BEGIN:VEVENT");
            icsContent.push(`UID:${task.id}@focumia.app`);
            icsContent.push(`DTSTAMP:${now}Z`);
            icsContent.push(`DTSTART;VALUE=DATE:${taskDateFormatted}`);
            icsContent.push(`SUMMARY:Completed: ${escapeHtml(task.text)}`);
            icsContent.push("DESCRIPTION:Task completed in Focumia.");
            icsContent.push("STATUS:COMPLETED");
            icsContent.push("END:VEVENT");
        }
    });
    icsContent.push("END:VCALENDAR");
    return icsContent.join("\r\n");
}

function downloadICS(filename, icsData) {
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        alert("ICS download not supported by your browser.");
    }
}


// --- Delete History Function ---
function deleteApplicationHistory() {
    if (confirm("Are you sure you want to delete ALL application data (theme, tasks, settings, streaks, and session history)? This action cannot be undone.")) {
        localStorage.removeItem('focumia-theme');
        localStorage.removeItem('focumia-tasks');
        localStorage.removeItem('focumia-timer-settings');
        localStorage.removeItem('focumia-streaksData');
        localStorage.removeItem('focumia-session-history');

        tasksCache = [];
        streaksData = {};
        sessionHistory = [];
        currentTimerSettings = { pomodoroDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, pomodorosBeforeLongBreak: 4, soundNotifications: true, browserNotifications: true };

        alert("All application data has been deleted. The app will now reload.");
        location.reload();
    }
}

// --- Homepage Review Functions ---
function showHomepageReview(dateString) {
    if (!homepageReviewSection || !homepageReviewTitle || !homepageReviewContent) return;

    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);

    homepageReviewTitle.textContent = `Completed on ${dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}`;

    const tasksCompletedThatDay = tasksCache.filter(task => task.completed && task.completionDate === dateString);

    homepageReviewContent.innerHTML = '';

    if (tasksCompletedThatDay.length > 0) {
        const exportButtonContainer = document.createElement('div');
        exportButtonContainer.className = 'my-4 text-right';
        const exportButton = document.createElement('button');
        exportButton.id = 'export-review-ics-button';
        exportButton.className = 'themed-button-secondary px-4 py-2 rounded text-lg jersey-10-regular';
        exportButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 inline mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V12zM12 9.75h.008v.008H12V9.75zM14.25 9.75h.008v.008h-.008V9.75zM14.25 12h.008v.008h-.008V12zM16.5 9.75h.008v.008H16.5V9.75zM16.5 12h.008v.008H16.5V12z" /></svg>Export Day (.ics)`;
        exportButton.onclick = () => {
            const icsData = generateICS(tasksCompletedThatDay, dateString);
            downloadICS(`Focumia_Completed_${dateString}.ics`, icsData);
        };
        exportButtonContainer.appendChild(exportButton);
        homepageReviewContent.appendChild(exportButtonContainer);

        const ulCompleted = document.createElement('ul');
        ulCompleted.className = 'space-y-2 list-disc list-inside ml-0';
        tasksCompletedThatDay.forEach(task => {
            const li = document.createElement('li');
            li.className = 'themed-text-primary text-xl';
            li.textContent = escapeHtml(task.text);
            ulCompleted.appendChild(li);
        });
        homepageReviewContent.appendChild(ulCompleted);
    } else {
        const pNoneCompleted = document.createElement('p');
        pNoneCompleted.className = 'themed-text-secondary text-xl';
        pNoneCompleted.textContent = 'No tasks were completed on this day.';
        homepageReviewContent.appendChild(pNoneCompleted);
    }

    homepageReviewSection.classList.remove('hidden');
    homepageReviewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideHomepageReview() {
    if (homepageReviewSection) {
        homepageReviewSection.classList.add('hidden');
    }
}

if (closeHomepageReviewButton) closeHomepageReviewButton.addEventListener('click', hideHomepageReview);


// --- Calendar Functions ---
function focumiaTasksToCalendarEvents(focumiaTasks) {
    return focumiaTasks.map(task => {
        let eventBgColor, eventTextColor, eventBorderColor;
        const bodyStyles = getComputedStyle(document.body);

        if (task.completed) {
            eventBgColor = bodyStyles.getPropertyValue('--task-completed-bg').trim(); // Dark grey
            eventBorderColor = bodyStyles.getPropertyValue('--border-color').trim(); // Darker grey
            eventTextColor = bodyStyles.getPropertyValue('--task-completed-text').trim(); // Light grey
        } else if (task.dueDate && new Date(task.dueDate) < new Date() && !task.completed) { // Overdue
            eventBgColor = (currentTheme === 'dark') ? '#330000' : '#ffdddd'; // Dark red (dark), Light red (light)
            eventTextColor = (currentTheme === 'dark') ? '#ffdddd' : '#330000'; // Light red (dark), Dark red (light)
            eventBorderColor = (currentTheme === 'dark') ? '#440000' : '#ffaaaa';
        } else if (task.dueDate) { // Has a due date
            eventBgColor = bodyStyles.getPropertyValue('--button-secondary-bg').trim(); // Dark grey
            eventTextColor = bodyStyles.getPropertyValue('--button-secondary-text').trim(); // White
            eventBorderColor = bodyStyles.getPropertyValue('--border-color').trim(); // Darker grey
        } else { // Regular task
            eventBgColor = bodyStyles.getPropertyValue('--button-primary-bg').trim(); // White
            eventTextColor = bodyStyles.getPropertyValue('--button-primary-text').trim(); // Black
            eventBorderColor = bodyStyles.getPropertyValue('--border-color').trim(); // Darker grey
        }

        return {
            id: task.id,
            title: task.text,
            start: task.startDate,
            end: task.dueDate,
            allDay: task.isAllDay,
            extendedProps: { ...task },
            backgroundColor: eventBgColor,
            borderColor: eventBorderColor,
            textColor: eventTextColor,
            classNames: task.completed ? ['fc-event-completed-state'] : (task.dueDate && new Date(task.dueDate) < new Date() ? ['fc-event-overdue-state'] : [])
        };

        if (task.completed) {
            event.classNames.push('fc-event-completed-state');
        } else if (task.dueDate && new Date(task.dueDate) < new Date()) { // Only apply if not completed
            event.classNames.push('fc-event-overdue-state');
        }

        if (!task.startDate && task.dueDate) {
            event.start = task.dueDate;
        }
        return event;
    });
}


function initializeFocumiaCalendar() {
    if (!calendarEl || typeof FullCalendar === 'undefined') {
        console.error("Calendar element or FullCalendar library not found.");
        if (calendarEl) calendarEl.innerHTML = "<p class='text-center themed-text-secondary text-2xl p-10'>Calendar library could not be loaded.</p>";
        return;
    }

    if (calendarInstance) {
        calendarInstance.destroy();
    }

    const calendarViewButtons = {
        day: document.getElementById('calendar-day-view-button'),
        week: document.getElementById('calendar-week-view-button'),
        month: document.getElementById('calendar-month-view-button'),
    };
    function setActiveViewButton(view) {
        Object.values(calendarViewButtons).forEach(btn => btn?.classList.replace('themed-button-primary', 'themed-button-secondary'));
        let viewType = view.toLowerCase();
        if (viewType.includes('daygridmonth') || viewType.includes('month')) calendarViewButtons.month?.classList.replace('themed-button-secondary', 'themed-button-primary');
        else if (viewType.includes('timeweek') || viewType.includes('week')) calendarViewButtons.week?.classList.replace('themed-button-secondary', 'themed-button-primary');
        else if (viewType.includes('timeday') || viewType.includes('day')) calendarViewButtons.day?.classList.replace('themed-button-secondary', 'themed-button-primary');
        else calendarViewButtons.month?.classList.replace('themed-button-secondary', 'themed-button-primary'); // Default to month
    }


    calendarInstance = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: false,
        events: focumiaTasksToCalendarEvents(tasksCache),
        editable: true,
        selectable: true,
        height: 'auto', // Or try a fixed number like 650
        // aspectRatio: 1.8, // Can be useful
        dateClick: function(info) {
            openCalendarTaskModal(null, info.dateStr, info.allDay);
        },
        eventClick: function(info) {
            const taskData = info.event.extendedProps;
            openCalendarTaskModal(taskData);
        },
        eventDrop: function(info) {
            updateTaskFromCalendarEvent(info.event);
        },
        eventResize: function(info) {
            updateTaskFromCalendarEvent(info.event);
        },
        datesSet: function(dateInfo) { // Called when view or date range changes
            const calendarTitleEl = document.getElementById('calendar-title');
            if (calendarTitleEl) calendarTitleEl.textContent = dateInfo.view.title;
            setActiveViewButton(dateInfo.view.type); // Update button active state
        },
        eventDidMount: function(info) { // Add tooltips or custom rendering
            if (info.event.extendedProps.description) {
                 info.el.setAttribute('title', `Description: ${info.event.extendedProps.description}\nStatus: ${info.event.extendedProps.completed ? 'Completed' : 'Pending'}`);
            }
        }
    });

    calendarInstance.render();
    const calendarTitleEl = document.getElementById('calendar-title');
    if (calendarTitleEl && calendarInstance) calendarTitleEl.textContent = calendarInstance.view.title;
    setActiveViewButton(calendarInstance.view.type);


    document.getElementById('calendar-prev-button')?.addEventListener('click', () => calendarInstance.prev());
    document.getElementById('calendar-today-button')?.addEventListener('click', () => calendarInstance.today());
    document.getElementById('calendar-next-button')?.addEventListener('click', () => calendarInstance.next());
    calendarViewButtons.day?.addEventListener('click', () => calendarInstance.changeView('timeGridDay'));
    calendarViewButtons.week?.addEventListener('click', () => calendarInstance.changeView('timeGridWeek'));
    calendarViewButtons.month?.addEventListener('click', () => calendarInstance.changeView('dayGridMonth'));
}

function refreshCalendarEvents() {
    if (calendarInstance) {
        const events = focumiaTasksToCalendarEvents(tasksCache);
        calendarInstance.getEvents().forEach(event => event.remove());
        calendarInstance.addEventSource(events);
    }
}

function updateTaskFromCalendarEvent(calendarEvent) {
    const taskIndex = tasksCache.findIndex(t => t.id === calendarEvent.id);
    if (taskIndex > -1) {
        tasksCache[taskIndex].startDate = calendarEvent.start ? calendarEvent.start.toISOString() : null;
        // FullCalendar's `end` can be exclusive for all-day. For deadline, just take the date part.
        // If using as a duration, it's fine. If it's purely a deadline, maybe it's just the start date.
        let endDate = null;
        if (calendarEvent.end) {
            endDate = calendarEvent.end.toISOString();
            if (calendarEvent.allDay && calendarEvent.start && calendarEvent.end) {
                // If all-day and FC provides end as next day midnight, adjust to end of current day for our dueDate
                const startDateObj = new Date(calendarEvent.start);
                const endDateObj = new Date(calendarEvent.end);
                if (endDateObj.getTime() > startDateObj.getTime() && endDateObj.getHours() === 0 && endDateObj.getMinutes() === 0) {
                    const correctedEnd = new Date(endDateObj.getTime() - 1); // End of previous day
                    endDate = correctedEnd.toISOString();
                }
            }
        } else if (calendarEvent.start) {
            endDate = calendarEvent.start.toISOString(); // If no end, dueDate is same as start
        }
        tasksCache[taskIndex].dueDate = endDate;
        tasksCache[taskIndex].isAllDay = calendarEvent.allDay;
        tasksCache[taskIndex].text = calendarEvent.title; // Update title if changed by FC (some libs allow this)

        saveTasksToLocalStorage();
        renderTasks(tasksCache); // Refresh home page list
        // FC usually updates its own UI on drag/resize, but a full refresh ensures our source of truth is reflected
        // refreshCalendarEvents(); // Not strictly needed if FC handles its UI, but good for consistency from our data.
                                 // However, this might cause a flicker. Let's rely on FC's update and only refresh if other props changed.
    }
}

function openCalendarTaskModal(task = null, defaultDateStr = null, isAllDayDefault = true) {
    if (!calendarTaskModalEl || !calendarTaskForm) return;
    calendarTaskForm.reset();
    const modalTitleEl = document.getElementById('calendar-task-modal-title');
    const taskIdInput = document.getElementById('calendar-task-id');
    const taskTextInput = document.getElementById('calendar-task-text');
    const taskDescriptionInput = document.getElementById('calendar-task-description');
    const taskStartDateInput = document.getElementById('calendar-task-start-date');
    const taskDueDateInput = document.getElementById('calendar-task-due-date');
    const taskAllDayCheckbox = document.getElementById('calendar-task-all-day');

    if (task) {
        modalTitleEl.textContent = "Edit Task";
        taskIdInput.value = task.id;
        taskTextInput.value = task.text;
        taskDescriptionInput.value = task.description || "";
        // Format for datetime-local: YYYY-MM-DDTHH:mm
        taskStartDateInput.value = task.startDate ? task.startDate.substring(0, 16) : "";
        taskDueDateInput.value = task.dueDate ? task.dueDate.substring(0, 16) : "";
        taskAllDayCheckbox.checked = task.isAllDay !== undefined ? task.isAllDay : true;
        if (calendarTaskDeleteButton) calendarTaskDeleteButton.classList.remove('hidden');
    } else {
        modalTitleEl.textContent = "Add New Task";
        taskIdInput.value = "";
        taskAllDayCheckbox.checked = isAllDayDefault;
        if (defaultDateStr) {
            let initialDateTime = "";
            if (defaultDateStr.includes('T')) { // Already has time
                initialDateTime = defaultDateStr.substring(0, 16);
            } else { // Just a date string
                initialDateTime = `${defaultDateStr}T09:00`; // Default to 9 AM
            }
            taskStartDateInput.value = initialDateTime;
        }
        if (calendarTaskDeleteButton) calendarTaskDeleteButton.classList.add('hidden');
    }
    calendarTaskModalEl.classList.remove('hidden');
    calendarTaskModalEl.classList.add('flex');
    taskTextInput.focus();
}

function closeCalendarTaskModal() {
    if (calendarTaskModalEl) {
        calendarTaskModalEl.classList.add('hidden');
        calendarTaskModalEl.classList.remove('flex');
    }
}

if (calendarTaskModalCloseButton) calendarTaskModalCloseButton.addEventListener('click', closeCalendarTaskModal);
if (calendarAddTaskButton) calendarAddTaskButton.addEventListener('click', () => openCalendarTaskModal(null, new Date().toISOString().split('T')[0]));

if (calendarTaskForm) {
    calendarTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('calendar-task-id').value;
        const text = document.getElementById('calendar-task-text').value.trim();
        const description = document.getElementById('calendar-task-description').value.trim();
        let startDateVal = document.getElementById('calendar-task-start-date').value;
        let dueDateVal = document.getElementById('calendar-task-due-date').value;
        const isAllDay = document.getElementById('calendar-task-all-day').checked;

        if (!text) { alert("Task title is required."); return; }

        let startDate = startDateVal ? new Date(startDateVal).toISOString() : null;
        let dueDate = dueDateVal ? new Date(dueDateVal).toISOString() : null;

        if (isAllDay) { // For all-day events, clear time part or set to start of day for consistency
            if (startDate) startDate = new Date(startDate.split('T')[0] + 'T00:00:00.000Z').toISOString();
            if (dueDate) dueDate = new Date(dueDate.split('T')[0] + 'T23:59:59.999Z').toISOString(); // End of day
        }


        if (id) {
            const taskIndex = tasksCache.findIndex(t => t.id === id);
            if (taskIndex > -1) {
                tasksCache[taskIndex].text = text;
                tasksCache[taskIndex].description = description;
                tasksCache[taskIndex].startDate = startDate;
                tasksCache[taskIndex].dueDate = dueDate;
                tasksCache[taskIndex].isAllDay = isAllDay;
                tasksCache[taskIndex].deadlineNotified = false;
            }
        } else {
            tasksCache.push({
                id: Date.now().toString(), text: text, description: description,
                startDate: startDate, dueDate: dueDate, isAllDay: isAllDay,
                completed: false, createdAt: new Date().toISOString(), completionDate: null,
                hasAwardedCompletionPoints: false, deadlineNotified: false
            });
        }
        saveTasksToLocalStorage();
        renderTasks(tasksCache);
        refreshCalendarEvents();
        closeCalendarTaskModal();
    });
}

if (calendarTaskDeleteButton) {
    calendarTaskDeleteButton.addEventListener('click', () => {
        const id = document.getElementById('calendar-task-id').value;
        if (id && confirm("Are you sure you want to delete this task?")) {
            const taskIndex = tasksCache.findIndex(t => t.id === id);
            if (taskIndex > -1) {
                tasksCache.splice(taskIndex, 1);
                saveTasksToLocalStorage();
                renderTasks(tasksCache);
                refreshCalendarEvents();
                closeCalendarTaskModal();
            }
        }
    });
}

// --- Deadline Notification Logic ---
function checkTaskDeadlines() {
    if (!currentTimerSettings.browserNotifications || Notification.permission !== "granted") {
        return;
    }
    const now = new Date();
    tasksCache.forEach(task => {
        if (!task.completed && task.dueDate && !task.deadlineNotified) {
            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate.getTime() - now.getTime(); // Milliseconds
            // Notify if due within 1 hour or if it's already past due and not notified
            if (timeDiff <= (60 * 60 * 1000)) { // 1 hour in ms or less (including past due)
                 new Notification("Focumia: Task Deadline!", {
                    body: `Task "${task.text}" is ${timeDiff < 0 ? 'overdue' : 'due soon'}: ${dueDate.toLocaleString()}`,
                    icon: 'logo.png'
                });
                task.deadlineNotified = true;
            }
        }
    });
    saveTasksToLocalStorage();
}

// --- App Initialization ---
const FOOTER_HTML = `
    <p>
        Powered by <a href="https://github.com/codliro" target="_blank" rel="noopener noreferrer" class="themed-text-primary hover:underline">CodliRo</a>.
        Follow us on <a href="https://github.com/codliro" target="_blank" rel="noopener noreferrer" class="themed-text-primary hover:underline">GitHub</a>.
    </p>
    <p class="mt-2">
        <a href="https://github.com/codliro/focumia/issues" target="_blank" rel="noopener noreferrer" class="menu-item-link themed-text-primary hover:underline" data-page="bug-report-external">Report a Bug</a> |
        <a href="#" class="menu-item-link themed-text-primary hover:underline" data-page="privacy-policy">Privacy Policy</a> |
        <a href="#" class="menu-item-link themed-text-primary hover:underline" data-page="cookie-policy">Cookie Policy</a> |
        <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="menu-item-link themed-text-primary hover:underline" data-page="license-external">MIT License</a>
    </p>
`;

function initApp() {
    console.log("Initializing Focumia App (Enhanced Edition)...");
    loadTimerSettingsFromLocalStorage();
    loadTasksFromLocalStorage();
    loadStreaksDataFromLocalStorage();
    loadSessionHistoryFromLocalStorage();

    try {
        broadcastChannel = new BroadcastChannel(FOCUS_PANEL_CHANNEL_NAME);
        broadcastChannel.onmessage = (event) => {
            if (event.data && event.data.requestInitialState) {
                notifyFocusPanel();
            }
        };
    } catch (e) {
        console.error("BroadcastChannel API is not supported.", e);
        if(openFocusPanelButton) {
            openFocusPanelButton.disabled = true;
            openFocusPanelButton.title = "Mini Timer Panel requires modern browser features.";
        }
    }

    applyTheme(currentTheme);

    document.querySelectorAll('.page-footer').forEach(footer => {
        footer.innerHTML = FOOTER_HTML;
    });

    if (logoFocumiaEl) {
        logoFocumiaEl.addEventListener('click', () => {
            showPage('home-page');
            if (homepageReviewSection && !homepageReviewSection.classList.contains('hidden')) {
                hideHomepageReview();
            }
        });
    }

    if (menuButton) menuButton.innerHTML = ICONS.menu;
    if (timerStartPauseButton) timerStartPauseButton.innerHTML = ICONS.play + " Start";
    if (timerResetButton) timerResetButton.innerHTML = ICONS.reset + " Reset";
    if (timerSkipButton) timerSkipButton.innerHTML = ICONS.skip + " Skip";
    if (addTaskButton) addTaskButton.innerHTML = ICONS.plus;
    if (openFocusPanelButton) openFocusPanelButton.innerHTML = ICONS.panel;


    if (themeToggleButton) themeToggleButton.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark'; applyTheme(currentTheme);
    });
    if (menuButton && menuDropdown) {
        menuButton.addEventListener('click', (e) => { e.stopPropagation(); menuDropdown.classList.toggle('hidden'); });
        bodyEl.addEventListener('click', (e) => {
            if (menuDropdown && !menuDropdown.classList.contains('hidden') && !menuDropdown.contains(e.target) && e.target !== menuButton && !menuButton.contains(e.target)) {
                 menuDropdown.classList.add('hidden');
            }
        });
        menuDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    document.querySelectorAll('.menu-item, .menu-item-link').forEach(item => {
        const pageName = item.dataset.page;
        if (pageName && !pageName.endsWith('-external')) {
            item.addEventListener('click', (e) => {
                if(item.getAttribute('href') === '#') e.preventDefault();
                const pageId = pageName + '-page';
                showPage(pageId);
                if (item.closest('#menu-dropdown') && menuDropdown) {
                    menuDropdown.classList.add('hidden');
                }
            });
        }
    });

    const deleteHistoryButton = document.getElementById('delete-history-button');
    if (deleteHistoryButton) {
        deleteHistoryButton.addEventListener('click', deleteApplicationHistory);
    }

    if (openFocusPanelButton) {
        openFocusPanelButton.addEventListener('click', openFocusPanel);
    }

    if (notificationCheckIntervalId) clearInterval(notificationCheckIntervalId);
    notificationCheckIntervalId = setInterval(checkTaskDeadlines, CALENDAR_NOTIFICATION_CHECK_INTERVAL);


    if (mainAppAreaEl) mainAppAreaEl.classList.remove('hidden');
    showPage('home-page');
    if (splashScreenEl) {
        setTimeout(() => {
            splashScreenEl.style.opacity = '0';
            splashScreenEl.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                splashScreenEl.classList.remove('active');
                splashScreenEl.classList.add('hidden');
            }, 500);
        }, 1200);
    }
    if (currentTimerSettings.browserNotifications && typeof Notification !== 'undefined' && Notification.permission !== "granted" && Notification.permission !== "denied") {
         Notification.requestPermission().then(p => console.log("Browser Notification Permission:", p));
    }
    updateTimerDisplay();
    renderWeeklyCalendar();
}

window.addEventListener('beforeunload', () => {
    if (broadcastChannel) {
        broadcastChannel.close();
    }
    if (notificationCheckIntervalId) {
        clearInterval(notificationCheckIntervalId);
    }
});

document.addEventListener('DOMContentLoaded', initApp);