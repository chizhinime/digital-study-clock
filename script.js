let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let isFocusSession = true;

const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionType = document.getElementById('sessionType');
const themeToggle = document.getElementById('themeToggle');

// Initialize
updateDisplay();

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
themeToggle.addEventListener('click', toggleTheme);

// Timer Functions
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(updateTime, 1000);
    }
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    pauseTimer();
    minutes = isFocusSession ? 25 : 5;
    seconds = 0;
    updateDisplay();
}

function updateTime() {
    if (seconds === 0) {
        if (minutes === 0) {
            // Session ended, switch mode
            switchSession();
            return;
        }
        minutes--;
        seconds = 59;
    } else {
        seconds--;
    }
    updateDisplay();
}

function switchSession() {
    isFocusSession = !isFocusSession;
    minutes = isFocusSession ? 25 : 5;
    seconds = 0;
    sessionType.textContent = isFocusSession ? "Focus Session" : "Break Time";
    updateDisplay();
    alert(isFocusSession ? "Focus session started!" : "Take a break!");
}

function updateDisplay() {
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    timeDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

// Dark/Light Mode Toggle
function toggleTheme() {
    document.body.setAttribute(
        'data-theme',
        document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    );
    themeToggle.classList.toggle('fa-moon');
    themeToggle.classList.toggle('fa-sun');
}
