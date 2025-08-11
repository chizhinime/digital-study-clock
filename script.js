// Clock state
let is24HourFormat = false;
let alarmTime = null;
const alarmSound = document.getElementById('alarmSound');

// DOM elements
const formatToggle = document.getElementById('formatToggle');
const themeToggle = document.getElementById('themeToggle');
const setAlarmBtn = document.getElementById('setAlarm');
const stopAlarmBtn = document.getElementById('stopAlarm');

// Initialize clock
updateClock();
setInterval(updateClock, 1000);

// Event listeners
formatToggle.addEventListener('click', toggleTimeFormat);
themeToggle.addEventListener('click', toggleTheme);
setAlarmBtn.addEventListener('click', setAlarm);
stopAlarmBtn.addEventListener('click', stopAlarm);

function updateClock() {
    const now = new Date();
    
    // Apply timezone offset if needed
    const timezone = document.getElementById('timezoneSelect').value;
    if (timezone !== 'local') {
        const offset = getTimezoneOffset(timezone);
        const offsetDifference = offset - now.getTimezoneOffset();
        now.setMinutes(now.getMinutes() + offsetDifference);
    }
    
    // Format time
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = is24HourFormat ? hours : hours % 12 || 12;
    
    // Get date components
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                   'August', 'September', 'October', 'November', 'December'];
    
    // Format all values
    const formattedTime = {
        hours: hours.toString().padStart(2, '0'),
        minutes: now.getMinutes().toString().padStart(2, '0'),
        seconds: now.getSeconds().toString().padStart(2, '0'),
        ampm: ampm,
        day: days[now.getDay()],
        month: months[now.getMonth()],
        date: now.getDate(),
        year: now.getFullYear()
    };
    
    // Update the DOM with animations
    animateChange(document.getElementById('hours'), formattedTime.hours);
    animateChange(document.getElementById('minutes'), formattedTime.minutes);
    animateChange(document.getElementById('seconds'), formattedTime.seconds);
    document.getElementById('ampm').textContent = formattedTime.ampm;
    document.getElementById('day').textContent = formattedTime.day;
    document.getElementById('month').textContent = formattedTime.month;
    document.getElementById('date').textContent = formattedTime.date;
    document.getElementById('year').textContent = formattedTime.year;
    
    // Check alarm
    checkAlarm(now);
}

// Helper functions
function animateChange(element, newValue) {
    if (element.textContent !== newValue) {
        element.classList.add('changing');
        setTimeout(() => {
            element.textContent = newValue;
            element.classList.remove('changing');
        }, 150);
    }
}

function toggleTimeFormat() {
    is24HourFormat = !is24HourFormat;
    this.textContent = is24HourFormat ? 'Switch to 12-hour' : 'Switch to 24-hour';
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    this.textContent = document.body.classList.contains('light-mode') 
        ? 'Switch to Dark Mode' 
        : 'Switch to Light Mode';
}

function getTimezoneOffset(timezone) {
    switch(timezone) {
        case 'UTC': return 0;
        case 'EST': return -5 * 60;
        case 'PST': return -8 * 60;
        case 'CET': return 60;
        default: return new Date().getTimezoneOffset();
    }
}

function setAlarm() {
    const alarmInput = document.getElementById('alarmTime').value;
    if (alarmInput) {
        const [hours, minutes] = alarmInput.split(':');
        alarmTime = { hours: parseInt(hours), minutes: parseInt(minutes) };
        alert(`Alarm set for ${alarmInput}`);
    }
}

function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    this.disabled = true;
    document.body.classList.remove('alarm-active');
}

function checkAlarm(now) {
    if (alarmTime && 
        now.getHours() === alarmTime.hours && 
        now.getMinutes() === alarmTime.minutes &&
        now.getSeconds() === 0) {
        alarmSound.play();
        stopAlarmBtn.disabled = false;
        document.body.classList.add('alarm-active');
    }
}
