// State variables
let is24HourFormat = false;
let isDarkMode = false;
let isFocusMode = false;
let isBreakMode = false;
let timerInterval;
let timerEndTime;
let timeLeft = 0;
let totalTime = 0;

// DOM elements
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const timerDisplay = document.getElementById('timer-display');
const progressBar = document.getElementById('progress-bar');
const toggleFormatBtn = document.getElementById('toggleFormat');
const toggleThemeBtn = document.getElementById('toggleTheme');
const startFocusBtn = document.getElementById('startFocus');
const startBreakBtn = document.getElementById('startBreak');
const pauseTimerBtn = document.getElementById('pauseTimer');
const resetTimerBtn = document.getElementById('resetTimer');
const formatText = document.getElementById('format-text');
const formatIcon = document.getElementById('format-icon');

// Initialize
updateClock();
setInterval(updateClock, 1000);
checkDarkModePreference();

// Event listeners
toggleFormatBtn.addEventListener('click', toggleTimeFormat);
toggleThemeBtn.addEventListener('click', toggleDarkMode);
startFocusBtn.addEventListener('click', () => startTimer(25 * 60, 'focus'));
startBreakBtn.addEventListener('click', () => startTimer(5 * 60, 'break'));
pauseTimerBtn.addEventListener('click', togglePauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);

// Functions
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  let ampm = '';

  if (!is24HourFormat) {
    ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;
  }

  clockEl.textContent = is24HourFormat 
    ? `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`
    : `${hours}:${minutes}${ampm}`;
  
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
  
  // Play sound
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
  audio.play();
  
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
