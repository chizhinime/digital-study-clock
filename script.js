function updateClock() {
    const now = new Date();
    
    // Get time components
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    
    // Get date components
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Format time to always show two digits
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
    
    // Update the DOM
    document.getElementById('hours').textContent = formattedTime.hours;
    document.getElementById('minutes').textContent = formattedTime.minutes;
    document.getElementById('seconds').textContent = formattedTime.seconds;
    document.getElementById('ampm').textContent = formattedTime.ampm;
    document.getElementById('day').textContent = formattedTime.day;
    document.getElementById('month').textContent = formattedTime.month;
    document.getElementById('date').textContent = formattedTime.date;
    document.getElementById('year').textContent = formattedTime.year;
}

// Update the clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);
