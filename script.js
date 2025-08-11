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
const sessionCounter = document.querySelector('.session-counter');

// Timer variables
let timer;
let timerRunning = false;
let timerPaused = false;
let timeLeft = 0;
let totalTime = 0;
let timerEndTime;
let timerType = '';
let sessionsCompleted = 0;

// Initialize clock
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12 || 12;
  
  clock.textContent = `${hours}:${minutes}`;
  ampmElement.textContent = ampm;
  
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
  
  // Play sound
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
  audio.play();
  
  // Update session counter for focus sessions
  if (timerType === 'focus') {
    sessionsCompleted++;
    sessionCounter.textContent = `Session: ${sessionsCompleted % 4}/4`;
  }
  
  // Reset UI
  startFocusBtn.disabled = false;
  startShortBreakBtn.disabled = false;
  startLongBreakBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = true;
  
  timerDisplay.textContent = timerType === 'focus' ? 'Time for break!' : 'Ready to focus?';
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
  startFocusBtn.disabled = false;
  startShortBreakBtn.disabled = false;
  startLongBreakBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = true;
  timerDisplay.textContent = '25:00';
  progressBar.style.width = '0%';
}

// Event listeners
startFocusBtn.addEventListener('click', () => startTimer(25, 'focus'));
startShortBreakBtn.addEventListener('click', () => startTimer(5, 'short break'));
startLongBreakBtn.addEventListener('click', () => startTimer(15, 'long break'));
pauseTimerBtn.addEventListener('click', pauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);

// Initialize
updateClock();
pauseTimerBtn.disabled = true;
resetTimerBtn.disabled = true;
