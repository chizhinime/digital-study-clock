// DOM Elements
const clock = document.getElementById('clock');
const ampmElement = document.getElementById('ampm');
const dateElement = document.getElementById('date');
const progressBar = document.getElementById('progress-bar');
const timerDisplay = document.getElementById('timer-display');
const startFocusBtn = document.getElementById('start-focus');
const startShortBreakBtn = document.getElementById('start-short-break');
const startLongBreakBtn = document.getElementById('start-long-break');
const pauseTimerBtn = document.getElementById('pause-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const saveSettingsBtn = document.getElementById('save-settings');
const sessionCounter = document.getElementById('session-counter');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const studyTip = document.getElementById('study-tip');
const darkModeBtn = document.getElementById('dark-mode-btn');
const darkModeIcon = document.getElementById('dark-mode-icon');
const darkModeCheckbox = document.getElementById('dark-mode');
const timeFormatSelect = document.getElementById('time-format');
const body = document.body;
const orientationMessage = document.querySelector('.orientation-message');

// Timer variables
let timer;
let timerRunning = false;
let timerPaused = false;
let timeLeft = 0;
let totalTime = 0;
let timerEndTime;
let timerType = '';
let sessionsCompleted = 0;
let settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStart: false,
  soundEnabled: true,
  notificationsEnabled: true,
  darkMode: false,
  timeFormat: '12'
};

// Study tips
const studyTips = [
  "Tip: Try the Pomodoro technique - focused work sessions followed by short breaks.",
  "Tip: Eliminate distractions by putting your phone in another room.",
  "Tip: Keep a notepad nearby to jot down distracting thoughts.",
  "Tip: Stand up and stretch during your breaks to improve circulation.",
  "Tip: Drink water regularly to stay hydrated and maintain focus.",
  "Tip: Review what you've learned at the end of each study session.",
  "Tip: Use active recall techniques instead of passive reading.",
  "Tip: Organize your study space before starting for better focus."
];

// Initialize
function init() {
  loadSettings();
  updateClock();
  updateSessionCounter();
  setRandomStudyTip();
  
  // Set initial button states
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = true;
  
  // Request notification permission
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
  
  // Check orientation on load
  checkOrientation();
  
  // Add orientation change listener
  window.addEventListener('resize', checkOrientation);
}

// Update clock with 12/24 hour format
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes().toString().padStart(2, '0');
  let ampm = '';
  
  if (settings.timeFormat === '12') {
    ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    ampmElement.textContent = ampm;
    ampmElement.style.display = 'block';
  } else {
    hours = hours.toString().padStart(2, '0');
    ampmElement.style.display = 'none';
  }
  
  clock.textContent = `${hours}:${minutes}`;
  
  // Update date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = now.toLocaleDateString('en-US', options);
  
  // Update timer if running
  if (timerRunning && !timerPaused) {
    updateTimer();
  }
  
  requestAnimationFrame(updateClock);
}

// Timer functions
function startTimer(duration, type) {
  clearInterval(timer);
  timerRunning = true;
  timerPaused = false;
  timeLeft = duration * 60;
  totalTime = timeLeft;
  timerEndTime = Date.now() + timeLeft * 1000;
  timerType = type;
  
  // Update UI
  body.className = `${type.replace(' ', '-')}-mode ${settings.darkMode ? 'dark-mode' : ''}`;
  startFocusBtn.disabled = true;
  startShortBreakBtn.disabled = true;
  startLongBreakBtn.disabled = true;
  pauseTimerBtn.disabled = false;
  resetTimerBtn.disabled = false;
  pauseTimerBtn.textContent = 'Pause';
  
  updateTimerDisplay();
  timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const now = Date.now();
  timeLeft = Math.max(0, Math.round((timerEndTime - now) / 1000));
  
  updateTimerDisplay();
  
  if (timeLeft <= 0) {
    timerComplete();
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  
  timerDisplay.textContent = `${minutes}:${seconds}`;
  progressBar.style.width = `${((totalTime - timeLeft) / totalTime) * 100}%`;
}

function timerComplete() {
  clearInterval(timer);
  timerRunning = false;
  
  // Play sound if enabled
  if (settings.soundEnabled) {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.play();
  }
  
  // Show notification if enabled
  if (settings.notificationsEnabled && Notification.permission === 'granted') {
    new Notification(`Timer Complete!`, {
      body: `Your ${timerType === 'focus' ? 'focus session' : timerType + ' break'} is over.`,
      icon: 'https://cdn-icons-png.flaticon.com/512/3114/3114883.png'
    });
  }
  
  // Update session counter for focus sessions
  if (timerType === 'focus') {
    sessionsCompleted++;
    updateSessionCounter();
  }
  
  // Reset UI
  body.className = settings.darkMode ? 'dark-mode' : '';
  startFocusBtn.disabled = false;
  startShortBreakBtn.disabled = false;
  startLongBreakBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = true;
  
  // Flash timer display
  let flashCount = 0;
  const flashInterval = setInterval(() => {
    timerDisplay.style.visibility = timerDisplay.style.visibility === 'hidden' ? 'visible' : 'hidden';
    flashCount++;
    
    if (flashCount >= 6) {
      clearInterval(flashInterval);
      timerDisplay.style.visibility = 'visible';
      
      if (timerType === 'focus') {
        const nextBreakType = sessionsCompleted % settings.sessionsBeforeLongBreak === 0 ? 'long' : 'short';
        timerDisplay.textContent = `Time for ${nextBreakType} break!`;
        
        if (settings.autoStart) {
          const breakDuration = nextBreakType === 'long' ? settings.longBreakDuration : settings.shortBreakDuration;
          setTimeout(() => startTimer(breakDuration, `${nextBreakType} break`), 1500);
        }
      } else {
        timerDisplay.textContent = 'Ready to focus?';
        
        if (settings.autoStart) {
          setTimeout(() => startTimer(settings.focusDuration, 'focus'), 1500);
        }
      }
    }
  }, 500);
  
  // Set random study tip
  setRandomStudyTip();
}

function pauseTimer() {
  if (timerPaused) {
    // Resume timer
    timerEndTime = Date.now() + timeLeft * 1000;
    timer = setInterval(updateTimer, 1000);
    pauseTimerBtn.textContent = 'Pause';
  } else {
    // Pause timer
    clearInterval(timer);
    pauseTimerBtn.textContent = 'Resume';
  }
  
  timerPaused = !timerPaused;
}

function resetTimer() {
  clearInterval(timer);
  timerRunning = false;
  timerPaused = false;
  body.className = settings.darkMode ? 'dark-mode' : '';
  startFocusBtn.disabled = false;
  startShortBreakBtn.disabled = false;
  startLongBreakBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = true;
  timerDisplay.textContent = '';
  progressBar.style.width = '0%';
}

// Settings functions
function loadSettings() {
  const savedSettings = localStorage.getItem('studyClockSettings');
  if (savedSettings) {
    settings = JSON.parse(savedSettings);
    
    // Update form inputs
    document.getElementById('focus-duration').value = settings.focusDuration;
    document.getElementById('short-break-duration').value = settings.shortBreakDuration;
    document.getElementById('long-break-duration').value = settings.longBreakDuration;
    document.getElementById('sessions-before-long-break').value = settings.sessionsBeforeLongBreak;
    document.getElementById('auto-start').checked = settings.autoStart;
    document.getElementById('sound-enabled').checked = settings.soundEnabled;
    document.getElementById('notifications-enabled').checked = settings.notificationsEnabled;
    document.getElementById('dark-mode').checked = settings.darkMode;
    document.getElementById('time-format').value = settings.timeFormat;
    
    // Update button labels
    updateTimerButtonLabels();
    
    // Apply dark mode if enabled
    if (settings.darkMode) {
      body.classList.add('dark-mode');
      darkModeIcon.textContent = '☀️';
    }
    
    // Apply time format
    updateClock();
  }
}

function saveSettings() {
  settings = {
    focusDuration: parseInt(document.getElementById('focus-duration').value) || 25,
    shortBreakDuration: parseInt(document.getElementById('short-break-duration').value) || 5,
    longBreakDuration: parseInt(document.getElementById('long-break-duration').value) || 15,
    sessionsBeforeLongBreak: parseInt(document.getElementById('sessions-before-long-break').value) || 4,
    autoStart: document.getElementById('auto-start').checked,
    soundEnabled: document.getElementById('sound-enabled').checked,
    notificationsEnabled: document.getElementById('notifications-enabled').checked,
    darkMode: document.getElementById('dark-mode').checked,
    timeFormat: document.getElementById('time-format').value
  };
  
  localStorage.setItem('studyClockSettings', JSON.stringify(settings));
  
  // Update UI
  updateTimerButtonLabels();
  toggleDarkMode(settings.darkMode);
  updateClock();
  
  // Hide settings panel
  settingsPanel.classList.remove('show');
}

function updateTimerButtonLabels() {
  startFocusBtn.textContent = `Start Focus (${settings.focusDuration}m)`;
  startShortBreakBtn.textContent = `Short Break (${settings.shortBreakDuration}m)`;
  startLongBreakBtn.textContent = `Long Break (${settings.longBreakDuration}m)`;
}

function toggleDarkMode(enable) {
  if (enable) {
    body.classList.add('dark-mode');
    darkModeIcon.textContent = '☀️';
  } else {
    body.classList.remove('dark-mode');
    darkModeIcon.textContent = '🌙';
  }
}

// Helper functions
function updateSessionCounter() {
  sessionCounter.textContent = `Session: ${sessionsCompleted % settings.sessionsBeforeLongBreak}/${settings.sessionsBeforeLongBreak}`;
}

function setRandomStudyTip() {
  studyTip.textContent = studyTips[Math.floor(Math.random() * studyTips.length)];
}

function checkOrientation() {
  if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
    orientationMessage.style.display = 'flex';
  } else {
    orientationMessage.style.display = 'none';
  }
}

// Event listeners
startFocusBtn.addEventListener('click', () => startTimer(settings.focusDuration, 'focus'));
startShortBreakBtn.addEventListener('click', () => startTimer(settings.shortBreakDuration, 'short break'));
startLongBreakBtn.addEventListener('click', () => startTimer(settings.longBreakDuration, 'long break'));
pauseTimerBtn.addEventListener('click', pauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);
settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('show'));
saveSettingsBtn.addEventListener('click', saveSettings);
fullscreenBtn.addEventListener('click', toggleFullscreen);
darkModeBtn.addEventListener('click', () => {
  settings.darkMode = !settings.darkMode;
  localStorage.setItem('studyClockSettings', JSON.stringify(settings));
  toggleDarkMode(settings.darkMode);
  darkModeCheckbox.checked = settings.darkMode;
});

// Close settings when clicking outside
document.addEventListener('click', (e) => {
  if (!settingsPanel.contains(e.target) && e.target !== settingsBtn && e.target !== darkModeBtn) {
    settingsPanel.classList.remove('show');
  }
});

// Fullscreen functionality
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === ' ') { // Space bar to pause/resume
    if (!pauseTimerBtn.disabled) {
      pauseTimer();
    }
  } else if (e.key === 'Escape') { // Escape to exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  } else if (e.key === 'd' || e.key === 'D') { // D for dark mode
    settings.darkMode = !settings.darkMode;
    localStorage.setItem('studyClockSettings', JSON.stringify(settings));
    toggleDarkMode(settings.darkMode);
    darkModeCheckbox.checked = settings.darkMode;
  }
});

// Initialize the app
init();
