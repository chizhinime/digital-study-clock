document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const timeDisplay = document.getElementById('time');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const skipBtn = document.getElementById('skipBtn');
    const sessionType = document.getElementById('sessionType');
    const sessionCount = document.getElementById('sessionCount');
    const themeToggle = document.getElementById('themeToggle');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsModal = document.getElementById('settingsModal');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const completedTasks = document.getElementById('completedTasks');
    const totalTasks = document.getElementById('totalTasks');
    const focusSessions = document.getElementById('focusSessions');
    const totalFocusTime = document.getElementById('totalFocusTime');
    const tasksCompleted = document.getElementById('tasksCompleted');
    const timerEndSound = document.getElementById('timerEndSound');
    const taskCompleteSound = document.getElementById('taskCompleteSound');
    const digitalClock = document.getElementById('digitalClock');
    const currentDate = document.getElementById('currentDate');

    // Timer variables
    let timer;
    let isRunning = false;
    let isFocusSession = true;
    let sessionCounter = 1;
    let totalSessionsCompleted = 0;
    let totalMinutesFocused = 0;
    let tasksCompletedCount = 0;

    // Settings variables with defaults
    let settings = {
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        autoStartNextSession: false,
        playSounds: true
    };

    // Timer state for persistence
    let timerState = {
        minutes: settings.focusDuration,
        seconds: 0,
        isRunning: false,
        isFocusSession: true,
        sessionCounter: 1
    };

    // Load all data from localStorage
    loadAllData();

    // Initialize timer with settings
    let minutes = timerState.minutes;
    let seconds = timerState.seconds;
    isRunning = timerState.isRunning;
    isFocusSession = timerState.isFocusSession;
    sessionCounter = timerState.sessionCounter;
    
    updateDisplay();

    // Initialize clock and date
    updateClockAndDate();
    setInterval(updateClockAndDate, 1000);

    // Initialize timer mode
    initTimerMode();

    // If timer was running when page was closed, restart it
    if (isRunning) {
        startTimer();
    }

    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    skipBtn.addEventListener('click', skipSession);
    themeToggle.addEventListener('click', toggleTheme);
    settingsToggle.addEventListener('click', openSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    cancelSettingsBtn.addEventListener('click', closeSettings);
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });

    // Timer Functions
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(updateTime, 1000);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            saveTimerState();
        }
    }

    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        saveTimerState();
    }

    function resetTimer() {
        pauseTimer();
        minutes = isFocusSession ? settings.focusDuration : 
                 (sessionCounter % settings.sessionsBeforeLongBreak === 0 ? 
                  settings.longBreakDuration : settings.breakDuration);
        seconds = 0;
        updateDisplay();
        saveTimerState();
    }

    function updateTime() {
        if (seconds === 0) {
            if (minutes === 0) {
                // Session ended
                sessionEnded();
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }
        
        // Track focused time
        if (isFocusSession) {
            totalMinutesFocused++;
            updateStats();
            saveStats();
        }
        
        updateDisplay();
        saveTimerState();
    }

    function sessionEnded() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        // Play sound if enabled
        if (settings.playSounds) {
            timerEndSound.play();
        }
        
        // Show notification
        const notificationText = isFocusSession ? 
            `Focus session completed! Time for a ${sessionCounter % settings.sessionsBeforeLongBreak === 0 ? 
             'long break' : 'short break'}.` : 
            'Break time over! Ready to focus again?';
        alert(notificationText);
        
        // Switch session type
        switchSession();
    }

    function switchSession() {
        isFocusSession = !isFocusSession;
        const timerContainer = document.getElementById('timerContainer');
        
        // Remove all mode classes
        timerContainer.classList.remove('focus-mode', 'break-mode', 'long-break-mode');
        
        if (isFocusSession) {
            // Coming from break, starting focus session
            sessionCounter++;
            totalSessionsCompleted++;
            timerContainer.classList.add('focus-mode');
            sessionType.textContent = "Focus Session";
            minutes = settings.focusDuration;
        } else {
            // Going to break
            const isLongBreak = sessionCounter % settings.sessionsBeforeLongBreak === 0;
            if (isLongBreak) {
                timerContainer.classList.add('long-break-mode');
                sessionType.textContent = "Long Break";
                minutes = settings.longBreakDuration;
            } else {
                timerContainer.classList.add('break-mode');
                sessionType.textContent = "Short Break";
                minutes = settings.breakDuration;
            }
        }
        
        seconds = 0;
        sessionCount.textContent = `#${sessionCounter}`;
        updateDisplay();
        updateStats();
        saveTimerState();
        saveStats();
        
        if (settings.autoStartNextSession) {
            startTimer();
        }
    }

    function skipSession() {
        sessionEnded();
    }

    function updateDisplay() {
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        timeDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
    }

    // Clock and Date Function
    function updateClockAndDate() {
        const now = new Date();
        
        // Format time in 12-hour with AM/PM
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        // Format date (e.g., "Monday, January 1")
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString(undefined, options);
        
        // Update DOM
        digitalClock.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
        currentDate.textContent = dateString;
    }

    // Initialize timer mode
    function initTimerMode() {
        const timerContainer = document.getElementById('timerContainer');
        if (isFocusSession) {
            timerContainer.classList.add('focus-mode');
            sessionType.textContent = "Focus Session";
        } else {
            const isLongBreak = sessionCounter % settings.sessionsBeforeLongBreak === 0;
            if (isLongBreak) {
                timerContainer.classList.add('long-break-mode');
                sessionType.textContent = "Long Break";
            } else {
                timerContainer.classList.add('break-mode');
                sessionType.textContent = "Short Break";
            }
        }
        sessionCount.textContent = `#${sessionCounter}`;
    }

    // Theme Functions
    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', newTheme);
    }

    // Settings Functions
    function openSettings() {
        // Populate settings form with current values
        document.getElementById('focusDuration').value = settings.focusDuration;
        document.getElementById('breakDuration').value = settings.breakDuration;
        document.getElementById('longBreakDuration').value = settings.longBreakDuration;
        document.getElementById('sessionsBeforeLongBreak').value = settings.sessionsBeforeLongBreak;
        document.getElementById('autoStartNextSession').checked = settings.autoStartNextSession;
        document.getElementById('playSounds').checked = settings.playSounds;
        
        settingsModal.style.display = 'flex';
    }

    function closeSettings() {
        settingsModal.style.display = 'none';
    }

    function saveSettings() {
        // Get values from form
        settings.focusDuration = parseInt(document.getElementById('focusDuration').value) || 25;
        settings.breakDuration = parseInt(document.getElementById('breakDuration').value) || 5;
        settings.longBreakDuration = parseInt(document.getElementById('longBreakDuration').value) || 15;
        settings.sessionsBeforeLongBreak = parseInt(document.getElementById('sessionsBeforeLongBreak').value) || 4;
        settings.autoStartNextSession = document.getElementById('autoStartNextSession').checked;
        settings.playSounds = document.getElementById('playSounds').checked;
        
        // Save to localStorage
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        
        // Reset timer with new settings
        resetTimer();
        closeSettings();
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
        }
    }

    // Timer State Functions
    function saveTimerState() {
        const timerState = {
            minutes: minutes,
            seconds: seconds,
            isRunning: isRunning,
            isFocusSession: isFocusSession,
            sessionCounter: sessionCounter
        };
        localStorage.setItem('pomodoroTimerState', JSON.stringify(timerState));
    }

    function loadTimerState() {
        const savedTimerState = localStorage.getItem('pomodoroTimerState');
        if (savedTimerState) {
            const state = JSON.parse(savedTimerState);
            timerState = state;
        }
    }

    // Stats Functions
    function saveStats() {
        const stats = {
            totalSessionsCompleted: totalSessionsCompleted,
            totalMinutesFocused: totalMinutesFocused,
            tasksCompletedCount: tasksCompletedCount
        };
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }

    function loadStats() {
        const savedStats = localStorage.getItem('pomodoroStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            totalSessionsCompleted = stats.totalSessionsCompleted || 0;
            totalMinutesFocused = stats.totalMinutesFocused || 0;
            tasksCompletedCount = stats.tasksCompletedCount || 0;
            updateStats();
        }
    }

    // Task Functions
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        
        const taskId = Date.now();
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.dataset.id = taskId;
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">${taskText}</span>
            <button class="task-delete"><i class="fas fa-trash"></i></button>
        `;
        
        taskList.appendChild(taskItem);
        taskInput.value = '';
        
        // Add event listeners
        const checkbox = taskItem.querySelector('.task-checkbox');
        const deleteBtn = taskItem.querySelector('.task-delete');
        
        checkbox.addEventListener('change', function() {
            taskItem.classList.toggle('completed', this.checked);
            updateTaskStats();
            saveTasks();
            
            if (this.checked && settings.playSounds) {
                taskCompleteSound.play();
            }
        });
        
        deleteBtn.addEventListener('click', function() {
            taskItem.remove();
            updateTaskStats();
            saveTasks();
        });
        
        updateTaskStats();
        saveTasks();
    }

    function updateTaskStats() {
        const total = taskList.children.length;
        const completed = document.querySelectorAll('.task-item.completed').length;
        
        totalTasks.textContent = total;
        completedTasks.textContent = completed;
        tasksCompletedCount = completed;
        updateStats();
        saveStats();
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('.task-item').forEach(item => {
            tasks.push({
                id: item.dataset.id,
                text: item.querySelector('.task-text').textContent,
                completed: item.querySelector('.task-checkbox').checked
            });
        });
        localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const savedTasks = localStorage.getItem('pomodoroTasks');
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            tasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskItem.dataset.id = task.id;
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                    <button class="task-delete"><i class="fas fa-trash"></i></button>
                `;
                taskList.appendChild(taskItem);
                
                // Add event listeners
                const checkbox = taskItem.querySelector('.task-checkbox');
                const deleteBtn = taskItem.querySelector('.task-delete');
                
                checkbox.addEventListener('change', function() {
                    taskItem.classList.toggle('completed', this.checked);
                    updateTaskStats();
                    saveTasks();
                });
                
                deleteBtn.addEventListener('click', function() {
                    taskItem.remove();
                    updateTaskStats();
                    saveTasks();
                });
            });
            updateTaskStats();
        }
    }

    // Stats Functions
    function updateStats() {
        focusSessions.textContent = totalSessionsCompleted;
        totalFocusTime.textContent = Math.floor(totalMinutesFocused / 60);
        tasksCompleted.textContent = tasksCompletedCount;
    }

    // Load all data from localStorage
    function loadAllData() {
        // Load theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        
        // Load settings
        loadSettings();
        
        // Load timer state
        loadTimerState();
        
        // Load stats
        loadStats();
        
        // Load tasks
        loadTasks();
    }

    // Save all data when page is about to be unloaded
    window.addEventListener('beforeunload', function() {
        saveTimerState();
        saveStats();
        saveTasks();
    });
});
