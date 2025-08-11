// State management
const createState = (initialState) => {
  let state = initialState;
  const subscribers = [];

  const getState = () => state;

  const setState = (newState) => {
    state = { ...state, ...newState };
    subscribers.forEach(fn => fn(state));
    return state;
  };

  const subscribe = (fn) => {
    subscribers.push(fn);
    return () => {
      const index = subscribers.indexOf(fn);
      if (index !== -1) subscribers.splice(index, 1);
    };
  };

  return { getState, setState, subscribe };
};

// Initial state
const initialState = {
  is24HourFormat: false,
  isDarkMode: localStorage.getItem('darkMode') === 'true',
  isFocusMode: false,
  isBreakMode: false,
  timerInterval: null,
  timerEndTime: 0,
  timeLeft: 0,
  totalTime: 0,
  settings: {
    focusDuration: 25,
    breakDuration: 5,
    clockFontSize: 'medium',
    showSeconds: true,
    enableSound: true,
    sound: 'beep',
    ...JSON.parse(localStorage.getItem('clockSettings') || {}
  }
};

const state = createState(initialState);

// DOM elements
const getDOMElements = () => ({
  clockEl: document.getElementById('clock'),
  dateEl: document.getElementById('date'),
  timerDisplay: document.getElementById('timer-display'),
  progressBar: document.getElementById('progress-bar'),
  toggleFormatBtn: document.getElementById('toggleFormat'),
  toggleThemeBtn: document.getElementById('toggleTheme'),
  toggleSettingsBtn: document.getElementById('toggleSettings'),
  toggleFullscreenBtn: document.getElementById('toggleFullscreen'),
  startFocusBtn: document.getElementById('startFocus'),
  startBreakBtn: document.getElementById('startBreak'),
  pauseTimerBtn: document.getElementById('pauseTimer'),
  resetTimerBtn: document.getElementById('resetTimer'),
  formatText: document.getElementById('format-text'),
  formatIcon: document.getElementById('format-icon'),
  settingsPanel: document.getElementById('settingsPanel'),
  closeSettingsBtn: document.getElementById('closeSettings'),
  saveSettingsBtn: document.getElementById('saveSettings'),
  focusDurationInput: document.getElementById('focusDuration'),
  breakDurationInput: document.getElementById('breakDuration'),
  clockFontSizeSelect: document.getElementById('clockFontSize'),
  showSecondsCheckbox: document.getElementById('showSeconds'),
  enableSoundCheckbox: document.getElementById('enableSound'),
  soundSelect: document.getElementById('soundSelect')
});

// Sound management
const sounds = {
  bell: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-clock-beep-1109.mp3',
  beep: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3',
  chime: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3'
};

const playSound = (soundName) => {
  const audio = new Audio(sounds[soundName]);
  audio.play();
};

// Time formatting utilities
const formatTimeUnit = (unit) => unit.toString().padStart(2, '0');

const formatTime = (hours, minutes, seconds, is24HourFormat, showSeconds) => {
  let ampm = '';
  let displayHours = hours;
  
  if (!is24HourFormat) {
    ampm = hours >= 12 ? ' PM' : ' AM';
    displayHours = hours % 12 || 12;
  }

  const timeSeparator = showSeconds ? ':' : '';
  const formattedSeconds = showSeconds ? seconds : '';
  
  return is24HourFormat 
    ? `${formatTimeUnit(displayHours)}:${minutes}${timeSeparator}${formattedSeconds}`
    : `${displayHours}:${minutes}${timeSeparator}${formattedSeconds}${ampm}`;
};

// Clock functions
const updateClockDisplay = (state, elements) => {
  const now = new Date();
  const { is24HourFormat, settings: { showSeconds } } = state;
  
  const hours = now.getHours();
  const minutes = formatTimeUnit(now.getMinutes());
  const seconds = showSeconds ? formatTimeUnit(now.getSeconds()) : '';
  
  elements.clockEl.textContent = formatTime(
    hours, minutes, seconds, is24HourFormat, showSeconds
  );
  
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  elements.dateEl.textContent = now.toLocaleDateString(undefined, options);
};

// Timer functions
const updateTimerDisplay = (timeLeft, totalTime, elements) => {
  const minutes = formatTimeUnit(Math.floor(timeLeft / 60));
  const seconds = formatTimeUnit(timeLeft % 60);
  
  elements.timerDisplay.textContent = `${minutes}:${seconds}`;
  elements.progressBar.style.width = `${100 - (timeLeft / totalTime * 100)}%`;
};

const startTimer = (duration, mode) => {
  state.setState({
    timeLeft: duration,
    totalTime: duration,
    timerEndTime: Date.now() + duration * 1000,
    isFocusMode: mode === 'focus',
    isBreakMode: mode === 'break'
  });

  const timerInterval = setInterval(() => {
    const { timerEndTime } = state.getState();
    const timeLeft = Math.max(0, Math.floor((timerEndTime - Date.now()) / 1000));
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerComplete();
      return;
    }
    
    state.setState({ timeLeft });
  }, 1000);

  state.setState({ timerInterval });
};

const timerComplete = () => {
  const { settings: { enableSound, sound }, isFocusMode } = state.getState();
  const elements = getDOMElements();
  
  elements.timerDisplay.textContent = isFocusMode ? 'Time for a break!' : 'Ready to focus?';
  elements.progressBar.style.width = '100%';
  
  if (enableSound) {
    playSound(sound);
  }
  
  setTimeout(resetTimer, 5000);
};

const togglePauseTimer = () => {
  const { timerInterval, timeLeft } = state.getState();
  const elements = getDOMElements();
  
  if (timerInterval) {
    clearInterval(timerInterval);
    state.setState({ timerInterval: null });
    elements.pauseTimerBtn.innerHTML = '<span>▶️</span><span>Resume</span>';
  } else {
    const timerEndTime = Date.now() + timeLeft * 1000;
    const newInterval = setInterval(() => {
      const timeLeft = Math.max(0, Math.floor((timerEndTime - Date.now()) / 1000));
      if (timeLeft <= 0) {
        clearInterval(newInterval);
        timerComplete();
        return;
      }
      state.setState({ timeLeft });
    }, 1000);
    
    state.setState({ timerInterval: newInterval, timerEndTime });
    elements.pauseTimerBtn.innerHTML = '<span>⏸️</span><span>Pause</span>';
  }
};

const resetTimer = () => {
  const { timerInterval } = state.getState();
  if (timerInterval) clearInterval(timerInterval);
  
  state.setState({
    timerInterval: null,
    isFocusMode: false,
    isBreakMode: false,
    timeLeft: 0,
    totalTime: 0
  });
};

// Settings functions
const updateClockFontSize = (size) => {
  const sizes = { small: '3rem', medium: '4.5rem', large: '6rem' };
  getDOMElements().clockEl.style.fontSize = sizes[size] || sizes.medium;
};

const saveSettings = () => {
  const elements = getDOMElements();
  const newSettings = {
    focusDuration: parseInt(elements.focusDurationInput.value) || 25,
    breakDuration: parseInt(elements.breakDurationInput.value) || 5,
    clockFontSize: elements.clockFontSizeSelect.value,
    showSeconds: elements.showSecondsCheckbox.checked,
    enableSound: elements.enableSoundCheckbox.checked,
    sound: elements.soundSelect.value
  };
  
  localStorage.setItem('clockSettings', JSON.stringify(newSettings));
  state.setState({ settings: newSettings });
  
  // Update UI
  elements.startFocusBtn.innerHTML = `<span>🎯</span><span>Focus (${newSettings.focusDuration}m)</span>`;
  elements.startBreakBtn.innerHTML = `<span>☕</span><span>Break (${newSettings.breakDuration}m)</span>`;
  updateClockFontSize(newSettings.clockFontSize);
  
  toggleSettings();
};

const toggleSettings = () => {
  const { settingsPanel } = getDOMElements();
  const { settings } = state.getState();
  
  // Populate settings form
  getDOMElements().focusDurationInput.value = settings.focusDuration;
  getDOMElements().breakDurationInput.value = settings.breakDuration;
  getDOMElements().clockFontSizeSelect.value = settings.clockFontSize;
  getDOMElements().showSecondsCheckbox.checked = settings.showSeconds;
  getDOMElements().enableSoundCheckbox.checked = settings.enableSound;
  getDOMElements().soundSelect.value = settings.sound;
  
  settingsPanel.classList.toggle('open');
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(console.error);
    getDOMElements().toggleFullscreenBtn.textContent = '⛶';
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
    getDOMElements().toggleFullscreenBtn.textContent = '⛶';
  }
};

// UI update functions
const updateUI = (state) => {
  const {
    is24HourFormat,
    isDarkMode,
    isFocusMode,
    isBreakMode,
    timerInterval,
    timeLeft,
    totalTime,
    settings
  } = state;
  
  const elements = getDOMElements();
  
  // Update clock format button
  elements.formatText.textContent = is24HourFormat ? '24-hour' : '12-hour';
  elements.formatIcon.textContent = is24HourFormat ? '🕟' : '🕛';
  
  // Update theme button
  elements.toggleThemeBtn.textContent = isDarkMode ? '☀️' : '🌙';
  document.body.classList.toggle('dark-mode', isDarkMode);
  
  // Update timer mode classes
  document.body.classList.toggle('focus-mode', isFocusMode);
  document.body.classList.toggle('break-mode', isBreakMode);
  document.body.classList.toggle('timer-active', timerInterval !== null);
  
  // Update timer controls
  elements.startFocusBtn.disabled = timerInterval !== null;
  elements.startBreakBtn.disabled = timerInterval !== null;
  
  // Update timer display if active
  if (timerInterval !== null) {
    updateTimerDisplay(timeLeft, totalTime, elements);
  } else if (!isFocusMode && !isBreakMode) {
    elements.timerDisplay.textContent = '';
    elements.progressBar.style.width = '0%';
  }
  
  // Update clock with current settings
  updateClockDisplay(state, elements);
};

// Event handlers
const setupEventListeners = () => {
  const elements = getDOMElements();
  
  // Format toggle
  elements.toggleFormatBtn.addEventListener('click', () => {
    state.setState({ is24HourFormat: !state.getState().is24HourFormat });
  });
  
  // Theme toggle
  elements.toggleThemeBtn.addEventListener('click', () => {
    const newDarkMode = !state.getState().isDarkMode;
    state.setState({ isDarkMode: newDarkMode });
    localStorage.setItem('darkMode', newDarkMode);
  });
  
  // Timer controls
  elements.startFocusBtn.addEventListener('click', () => 
    startTimer(state.getState().settings.focusDuration * 60, 'focus')
  );
  elements.startBreakBtn.addEventListener('click', () => 
    startTimer(state.getState().settings.breakDuration * 60, 'break')
  );
  elements.pauseTimerBtn.addEventListener('click', togglePauseTimer);
  elements.resetTimerBtn.addEventListener('click', resetTimer);
  
  // Settings controls
  elements.toggleSettingsBtn.addEventListener('click', toggleSettings);
  elements.closeSettingsBtn.addEventListener('click', toggleSettings);
  elements.saveSettingsBtn.addEventListener('click', saveSettings);
  elements.toggleFullscreenBtn.addEventListener('click', toggleFullscreen);
};

// Initialize
const init = () => {
  setupEventListeners();
  
  // Subscribe to state changes
  state.subscribe(updateUI);
  
  // Initial UI update
  updateUI(state.getState());
  
  // Start clock updates
  setInterval(() => updateClockDisplay(state.getState(), getDOMElements()), 1000);
};

// Start the app
init();    document.body.classList.add('dark-mode');
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
