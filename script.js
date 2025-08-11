// State variables
let is24HourFormat = false;
let isDarkMode = false;
let isFocusMode = false;
let isBreakMode = false;
let timerInterval;
let timerEndTime;
let timeLeft = 0;
let totalTime = 0;
let settings = {
  focusDuration: 25,
  breakDuration: 5,
  clockFontSize: 'medium',
  showSeconds: true,
  enableSound: true,
  sound: 'beep'
};

// DOM elements
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const timerDisplay = document.getElementById('timer-display');
const progressBar = document.getElementById('progress-bar');
const toggleFormatBtn = document.getElementById('toggleFormat');
const toggleThemeBtn = document.getElementById('toggleTheme');
const toggleSettingsBtn = document.getElementById('toggleSettings');
const toggleFullscreenBtn = document.getElementById('toggleFullscreen');
const startFocusBtn = document.getElementById('startFocus');
const startBreakBtn = document.getElementById('startBreak');
const pauseTimerBtn = document.getElementById('pauseTimer');
const resetTimerBtn = document.getElementById('resetTimer');
const formatText = document.getElementById('format-text');
const formatIcon = document.getElementById('format-icon');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettingsBtn = document.getElementById('closeSettings');
const saveSettingsBtn = document.getElementById('saveSettings');
const focusDurationInput = document.getElementById('focusDuration');
const breakDurationInput = document.getElementById('breakDuration');
const clockFontSizeSelect = document.getElementById('clockFontSize');
const showSecondsCheckbox = document.getElementById('showSeconds');
const enableSoundCheckbox = document.getElementById('enableSound');
const soundSelect = document.getElementById('soundSelect');

// Sound options
const sounds = {
  bell: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-clock-beep-1109.mp3',
  beep: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3',
  chime: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3'
};

// Initialize
loadSettings();
updateClock();
setInterval(updateClock, 1000);
checkDarkModePreference();
updateClockFontSize();

// Event listeners
toggleFormatBtn.addEventListener('click', toggleTimeFormat);
toggleThemeBtn.addEventListener('click', toggleDarkMode);
toggleSettingsBtn.addEventListener('click', toggleSettings);
toggleFullscreenBtn.addEventListener('click', toggleFullscreen);
startFocusBtn.addEventListener('click', () => startTimer(settings.focusDuration * 60, 'focus'));
startBreakBtn.addEventListener('click', () => startTimer(settings.breakDuration * 60, 'break'));
pauseTimerBtn.addEventListener('click', togglePauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);
closeSettingsBtn.addEventListener('click', toggleSettings);
saveSettingsBtn.addEventListener('click', saveSettings);

// Functions
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = settings.showSeconds ? now.getSeconds().toString().padStart(2, '0') : '';
  let ampm = '';

  if (!is24HourFormat) {
    ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;
  }

  const timeSeparator = settings.showSeconds ? ':' : '';
  clockEl.textContent = is24HourFormat 
    ? `${hours.toString().padStart(2, '0')}:${minutes}${timeSeparator}${seconds}`
    : `${hours}:${minutes}${timeSeparator}${seconds}${ampm}`;
  
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString(undefined, options);
}

function toggleTimeFormat() {
  is24HourFormat = !is24HourFormat;
  formatText.textContent = is24HourFormat ? '24-hour' : '12-hour';
  formatIcon.textContent = is24HourFormat ? '🕟' : '🕛';
  updateClock();
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  toggleThemeBtn.textContent = isDarkMode ? '☀️' : '🌙';
  localStorage.setItem('darkMode', isDarkMode);
}

function checkDarkModePreference() {
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'true') {
    isDarkMode = true;
    document.body.classList.add('dark-mode');
    toggleThemeBtn.textContent = '☀️';
  }
}

function toggleSettings() {
  settingsPanel.classList.toggle('open');
  // Populate settings form with current values
  focusDurationInput.value = settings.focusDuration;
  breakDurationInput.value = settings.breakDuration;
  clockFontSizeSelect.value = settings.clockFontSize;
  showSecondsCheckbox.checked = settings.showSeconds;
  enableSoundCheckbox.checked = settings.enableSound;
  soundSelect.value = settings.sound;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
    toggleFullscreenBtn.textContent = '⛶';
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      toggleFullscreenBtn.textContent = '⛶';
    }
  }
}

function updateClockFontSize() {
  const sizes = {
    small: '3rem',
    medium: '4.5rem',
    large: '6rem'
  };
  clockEl.style.fontSize = sizes[settings.clockFontSize] || sizes.medium;
}

function loadSettings() {
  const savedSettings = localStorage.getItem('clockSettings');
  if (savedSettings) {
    try {
      settings = JSON.parse(savedSettings);
      // Update button labels
      startFocusBtn.innerHTML = `<span>🎯</span><span>Focus (${settings.focusDuration}m)</span>`;
      startBreakBtn.innerHTML = `<span>☕</span><span>Break (${settings.breakDuration}m)</span>`;
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
  }
}

function saveSettings() {
  settings = {
    focusDuration: parseInt(focusDurationInput.value) || 25,
    breakDuration: parseInt(breakDurationInput.value) || 5,
    clockFontSize: clockFontSizeSelect.value,
    showSeconds: showSecondsCheckbox.checked,
    enableSound: enableSoundCheckbox.checked,
    sound: soundSelect.value
  };
  
  localStorage.setItem('clockSettings', JSON.stringify(settings));
  
  // Update UI
  startFocusBtn.innerHTML = `<span>🎯</span><span>Focus (${settings.focusDuration}m)</span>`;
  startBreakBtn.innerHTML = `<span>☕</span><span>Break (${settings.breakDuration}m)</span>`;
  updateClockFontSize();
  updateClock();
  
  toggleSettings();
}

function startTimer(duration, mode) {
  clearInterval(timerInterval);
  
  // Set mode
  document.body.classList.remove('focus-mode', 'break-mode');
  if (mode === 'focus') {
    document.body.classList.add('focus-mode');
    isFocusMode = true;
    isBreakMode = false;
  } else {
    document.body.classList.add('break-mode');
    isBreakMode = true;
    isFocusMode = false;
  }
  
  // Timer setup
  timeLeft = duration;
  totalTime = duration;
  timerEndTime = Date.now() + duration * 1000;
  
  // UI updates
  document.body.classList.add('timer-active');
  startFocusBtn.disabled = true;
  startBreakBtn.disabled = true;
  
  updateTimerDisplay();
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const now = Date.now();
  timeLeft = Math.max(0, Math.floor((timerEndTime - now) / 1000));
  
  if (timeLeft <= 0) {
    timerComplete();
    return;
  }
  
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  
  timerDisplay.textContent = `${minutes}:${seconds}`;
  progressBar.style.width = `${100 - (timeLeft / totalTime * 100)}%`;
}

function timerComplete() {
  clearInterval(timerInterval);
  timerDisplay.textContent = isFocusMode ? 'Time for a break!' : 'Ready to focus?';
  progressBar.style.width = '100%';
  
  // Play sound if enabled
  if (settings.enableSound) {
    const audio = new Audio(sounds[settings.sound]);
    audio.play();
  }
  
  // Reset after delay
  setTimeout(() => {
    resetTimer();
  }, 5000);
}

function togglePauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    pauseTimerBtn.innerHTML = '<span>▶️</span><span>Resume</span>';
  } else {
    timerEndTime = Date.now() + timeLeft * 1000;
    timerInterval = setInterval(updateTimer, 1000);
    pauseTimerBtn.innerHTML = '<span>⏸️</span><span>Pause</span>';
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  document.body.classList.remove('timer-active', 'focus-mode', 'break-mode');
  timerDisplay.textContent = '';
  progressBar.style.width = '0%';
  startFocusBtn.disabled = false;
  startBreakBtn.disabled = false;
  isFocusMode = false;
  isBreakMode = false;
}    document.body.classList.add('dark-mode');
    toggleThemeBtn.textContent = '☀️';
  }
}

function toggleSettings() {
  settingsPanel.classList.toggle('open');
  // Populate settings form with current values
  focusDurationInput.value = settings.focusDuration;
  breakDurationInput.value = settings.breakDuration;
  clockFontSizeSelect.value = settings.clockFontSize;
  showSecondsCheckbox.checked = settings.showSeconds;
  enableSoundCheckbox.checked = settings.enableSound;
  soundSelect.value = settings.sound;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
    toggleFullscreenBtn.textContent = '⛶';
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      toggleFullscreenBtn.textContent = '⛶';
    }
  }
}

function updateClockFontSize() {
  const sizes = {
    small: '3rem',
    medium: '4.5rem',
    large: '6rem'
  };
  clockEl.style.fontSize = sizes[settings.clockFontSize] || sizes.medium;
}

function loadSettings() {
  const savedSettings = localStorage.getItem('clockSettings');
  if (savedSettings) {
    try {
      settings = JSON.parse(savedSettings);
      // Update button labels
      startFocusBtn.innerHTML = `<span>🎯</span><span>Focus (${settings.focusDuration}m)</span>`;
      startBreakBtn.innerHTML = `<span>☕</span><span>Break (${settings.breakDuration}m)</span>`;
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
  }
}

function saveSettings() {
  settings = {
    focusDuration: parseInt(focusDurationInput.value) || 25,
    breakDuration: parseInt(breakDurationInput.value) || 5,
    clockFontSize: clockFontSizeSelect.value,
    showSeconds: showSecondsCheckbox.checked,
    enableSound: enableSoundCheckbox.checked,
    sound: soundSelect.value
  };
  
  localStorage.setItem('clockSettings', JSON.stringify(settings));
  
  // Update UI
  startFocusBtn.innerHTML = `<span>🎯</span><span>Focus (${settings.focusDuration}m)</span>`;
  startBreakBtn.innerHTML = `<span>☕</span><span>Break (${settings.breakDuration}m)</span>`;
  updateClockFontSize();
  updateClock();
  
  toggleSettings();
}

function startTimer(duration, mode) {
  clearInterval(timerInterval);
  
  // Set mode
  document.body.classList.remove('focus-mode', 'break-mode');
  if (mode === 'focus') {
    document.body.classList.add('focus-mode');
    isFocusMode = true;
    isBreakMode = false;
  } else {
    document.body.classList.add('break-mode');
    isBreakMode = true;
    isFocusMode = false;
  }
  
  // Timer setup
  timeLeft = duration;
  totalTime = duration;
  timerEndTime = Date.now() + duration * 1000;
  
  // UI updates
  document.body.classList.add('timer-active');
  startFocusBtn.disabled = true;
  startBreakBtn.disabled = true;
  
  updateTimerDisplay();
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const now = Date.now();
  timeLeft = Math.max(0, Math.floor((timerEndTime - now) / 1000));
  
  if (timeLeft <= 0) {
    timerComplete();
    return;
  }
  
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  
  timerDisplay.textContent = `${minutes}:${seconds}`;
  progressBar.style.width = `${100 - (timeLeft / totalTime * 100)}%`;
}

function timerComplete() {
  clearInterval(timerInterval);
  timerDisplay.textContent = isFocusMode ? 'Time for a break!' : 'Ready to focus?';
  progressBar.style.width = '100%';
  
  // Play sound if enabled
  if (settings.enableSound) {
    const audio = new Audio(sounds[settings.sound]);
    audio.play();
  }
  
  // Reset after delay
  setTimeout(() => {
    resetTimer();
  }, 5000);
}

function togglePauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    pauseTimerBtn.innerHTML = '<span>▶️</span><span>Resume</span>';
  } else {
    timerEndTime = Date.now() + timeLeft * 1000;
    timerInterval = setInterval(updateTimer, 1000);
    pauseTimerBtn.innerHTML = '<span>⏸️</span><span>Pause</span>';
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  document.body.classList.remove('timer-active', 'focus-mode', 'break-mode');
  timerDisplay.textContent = '';
  progressBar.style.width = '0%';
  startFocusBtn.disabled = false;
  startBreakBtn.disabled = false;
  isFocusMode = false;
  isBreakMode = false;
      }        document.body.classList.add('dark-mode');
        toggleThemeBtn.textContent = '☀️';
      }
    }

    function toggleSettings() {
      settingsPanel.classList.toggle('open');
      // Populate settings form with current values
      focusDurationInput.value = settings.focusDuration;
      breakDurationInput.value = settings.breakDuration;
      clockFontSizeSelect.value = settings.clockFontSize;
      showSecondsCheckbox.checked = settings.showSeconds;
      enableSoundCheckbox.checked = settings.enableSound;
      soundSelect.value = settings.sound;
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        toggleFullscreenBtn.textContent = '⛶';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          toggleFullscreenBtn.textContent = '⛶';
        }
      }
    }

    function updateClockFontSize() {
      const sizes = {
        small: '3rem',
        medium: '4.5rem',
        large: '6rem'
      };
      clockEl.style.fontSize = sizes[settings.clockFontSize] || sizes.medium;
    }

    function loadSettings() {
      const savedSettings = localStorage.getItem('clockSettings');
      if (savedSettings) {
        try {
          settings = JSON.parse(savedSettings);
          // Update button labels
          startFocusBtn.innerHTML = `<span>🎯</span><span>Focus (${settings.focusDuration}m)</span>`;
          startBreakBtn.innerHTML = `<span>☕</span><span>Break (${settings.breakDuration}m)</span>`;
        } catch (e) {
          console.error('Failed to parse settings', e);
        }
      }
    }

    function saveSettings() {
      settings = {
        focusDuration: parseInt(focusDurationInput.value) || 25,
        breakDuration: parseInt(breakDurationInput.value) || 5,
        clockFontSize: clockFontSizeSelect.value,
        showSeconds: showSecondsCheckbox.checked,
        enableSound: enableSoundCheckbox.checked,
        sound: soundSelect.value
      };
      
      localStorage.setItem('clockSettings', JSON.stringify(settings));
      
      // Update UI
      startFocusBtn.innerHTML = `<span>🎯</span><span>Focus (${settings.focusDuration}m)</span>`;
      startBreakBtn.innerHTML = `<span>☕</span><span>Break (${settings.breakDuration}m)</span>`;
      updateClockFontSize();
      updateClock();
      
      toggleSettings();
    }

    function startTimer(duration, mode) {
      clearInterval(timerInterval);
      
      // Set mode
      document.body.classList.remove('focus-mode', 'break-mode');
      if (mode === 'focus') {
        document.body.classList.add('focus-mode');
        isFocusMode = true;
        isBreakMode = false;
      } else {
        document.body.classList.add('break-mode');
        isBreakMode = true;
        isFocusMode = false;
      }
      
      // Timer setup
      timeLeft = duration;
      totalTime = duration;
      timerEndTime = Date.now() + duration * 1000;
      
      // UI updates
      document.body.classList.add('timer-active');
      startFocusBtn.disabled = true;
      startBreakBtn.disabled = true;
      
      updateTimerDisplay();
      timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
      const now = Date.now();
      timeLeft = Math.max(0, Math.floor((timerEndTime - now) / 1000));
      
      if (timeLeft <= 0) {
        timerComplete();
        return;
      }
      
      updateTimerDisplay();
    }

    function updateTimerDisplay() {
      const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const seconds = (timeLeft % 60).toString().padStart(2, '0');
      
      timerDisplay.textContent = `${minutes}:${seconds}`;
      progressBar.style.width = `${100 - (timeLeft / totalTime * 100)}%`;
    }

    function timerComplete() {
      clearInterval(timerInterval);
      timerDisplay.textContent = isFocusMode ? 'Time for a break!' : 'Ready to focus?';
      progressBar.style.width = '100%';
      
      // Play sound if enabled
      if (settings.enableSound) {
        const audio = new Audio(sounds[settings.sound]);
        audio.play();
      }
      
      // Reset after delay
      setTimeout(() => {
        resetTimer();
      }, 5000);
    }

    function togglePauseTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        pauseTimerBtn.innerHTML = '<span>▶️</span><span>Resume</span>';
      } else {
        timerEndTime = Date.now() + timeLeft * 1000;
        timerInterval = setInterval(updateTimer, 1000);
        pauseTimerBtn.innerHTML = '<span>⏸️</span><span>Pause</span>';
      }
    }

    function resetTimer() {
      clearInterval(timerInterval);
      document.body.classList.remove('timer-active', 'focus-mode', 'break-mode');
      timerDisplay.textContent = '';
      progressBar.style.width = '0%';
      startFocusBtn.disabled = false;
      startBreakBtn.disabled = false;
      isFocusMode = false;
      isBreakMode = false;
    }
