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
    const fullscreenToggle = document.getElementById('fullscreenToggle');
    const settingsModal = document.getElementById('settingsModal');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const completedTasks = document.getElementById('completedTasks');
    const totalTasks = document.getElementById('totalTasks');
    const totalTasksCount = document.getElementById('totalTasksCount');
    const focusSessions = document.getElementById('focusSessions');
    const totalFocusTime = document.getElementById('totalFocusTime');
    const tasksCompleted = document.getElementById('tasksCompleted');
    const productivityScore = document.getElementById('productivityScore');
    const timerEndSound = document.getElementById('timerEndSound');
    const taskCompleteSound = document.getElementById('taskCompleteSound');
    const sessionStartSound = document.getElementById('sessionStartSound');
    const digitalClock = document.getElementById('digitalClock');
    const currentDate = document.getElementById('currentDate');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    const closeNotification = document.getElementById('closeNotification');
    const weekBars = document.getElementById('weekBars');
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const goalsProgress = document.getElementById('goalsProgress');
    const clearCompleted = document.getElementById('clearCompleted');

    // Timer variables
    let timer;
    let isRunning = false;
    let isFocusSession = true;
    let sessionCounter = 1;
    let totalSessionsCompleted = 0;
    let totalMinutesFocused = 0;
    let tasksCompletedCount = 0;
    let currentSessionDuration = 25;
    let totalSessionTime = 0;

    // Settings with defaults
    let settings = {
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        autoStartNextSession: false,
        playSounds: true,
        desktopNotifications: true,
        notificationVolume: 50,
        fontSize: 'medium',
        colorTheme: 'default',
        reduceMotion: false
    };

    // App state
    let timerState = {
        minutes: settings.focusDuration,
        seconds: 0,
        isRunning: false,
        isFocusSession: true,
        sessionCounter: 1
    };

    // Weekly stats
    let weeklyStats = Array(7).fill().map(() => ({ sessions: 0, minutes: 0, tasks: 0 }));

    // Motivational quotes
    const quotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
        { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
        { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
        { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" }
    ];

    // Load all data
    loadAllData();

    // Initialize app
    initializeApp();

    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    skipBtn.addEventListener('click', skipSession);
    themeToggle.addEventListener('click', toggleTheme);
    settingsToggle.addEventListener('click', openSettings);
    fullscreenToggle.addEventListener('click', toggleFullscreen);
    saveSettingsBtn.addEventListener('click', saveSettings);
    cancelSettingsBtn.addEventListener('click', closeSettings);
    exportDataBtn.addEventListener('click', exportData);
    resetDataBtn.addEventListener('click', resetData);
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    closeNotification.addEventListener('click', hideNotification);
    clearCompleted.addEventListener('click', clearCompletedTasks);

    // Quick session buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setQuickSession(parseInt(this.dataset.minutes));
        });
    });

    // Task filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setTaskFilter(this.dataset.filter);
        });
    });

    // Settings tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchSettingsTab(this.dataset.tab);
        });
    });

    // Volume control
    const volumeControl = document.getElementById('notificationVolume');
    const volumeValue = document.getElementById('volumeValue');
    volumeControl.addEventListener('input', function() {
        volumeValue.textContent = this.value + '%';
        setAudioVolume(this.value);
    });

    // Goal checkboxes
    document.querySelectorAll('.goal-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateGoalsProgress);
    });

    // Initialize clock
    setInterval(updateClockAndDate, 1000);

    // Show random quote every 30 seconds
    setInterval(showRandomQuote, 30000);

    // Auto-save every minute
    setInterval(saveAllData, 60000);

    function initializeApp() {
        minutes = timerState.minutes;
        seconds = timerState.seconds;
        isRunning = timerState.isRunning;
        isFocusSession = timerState.isFocusSession;
        sessionCounter = timerState.sessionCounter;
        
        updateDisplay();
        updateProgress();
        initTimerMode();
        showRandomQuote();
        updateWeeklyStats();
        updateGoalsProgress();
        setAudioVolume(settings.notificationVolume);

        if (isRunning) {
            startTimer();
        }
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(updateTime, 1000);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            if (settings.playSounds) {
                sessionStartSound.volume = settings.notificationVolume / 100;
                sessionStartSound.play();
            }
            
            showNotification(`${isFocusSession ? 'Focus' : 'Break'} session started!`);
            saveTimerState();
        }
    }

    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        showNotification('Timer paused');
        saveTimerState();
    }

    function resetTimer() {
        pauseTimer();
        minutes = isFocusSession ? settings.focusDuration : 
                 (sessionCounter % settings.sessionsBeforeLongBreak === 0 ? 
                  settings.longBreakDuration : settings.breakDuration);
        seconds = 0;
        updateDisplay();
        updateProgress();
        saveTimerState();
    }

    function updateTime() {
        if (seconds === 0) {
            if (minutes === 0) {
                sessionEnded();
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }
        
        if (isFocusSession) {
            totalMinutesFocused++;
            totalSessionTime++;
            updateStats();
            saveStats();
        }
        
        updateDisplay();
        updateProgress();
        saveTimerState();
    }

    function sessionEnded() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        if (settings.playSounds) {
            timerEndSound.volume = settings.notificationVolume / 100;
            timerEndSound.play();
        }
        
        const message = isFocusSession ? 
            `Focus session completed! Time for a ${sessionCounter % settings.sessionsBeforeLongBreak === 0 ? 
             'long break' : 'short break'}.` : 
            'Break time over! Ready to focus again?';
        
        showNotification(message, 'success');
        
        if (settings.desktopNotifications && Notification.permission === 'granted') {
            new Notification('Study Timer', {
                body: message,
                icon: '/favicon.ico'
            });
        }
        
        switchSession();
    }

    function switchSession() {
        isFocusSession = !isFocusSession;
        const timerContainer = document.getElementById('timerContainer');
        
        timerContainer.classList.remove('focus-mode', 'break-mode', 'long-break-mode');
        
        if (isFocusSession) {
            sessionCounter++;
            totalSessionsCompleted++;
            timerContainer.classList.add('focus-mode');
            sessionType.textContent = "Focus Session";
            minutes = settings.focusDuration;
            currentSessionDuration = settings.focusDuration;
        } else {
            const isLongBreak = sessionCounter % settings.sessionsBeforeLongBreak === 0;
            if (isLongBreak) {
                timerContainer.classList.add('long-break-mode');
                sessionType.textContent = "Long Break";
                minutes = settings.longBreakDuration;
                currentSessionDuration = settings.longBreakDuration;
            } else {
                timerContainer.classList.add('break-mode');
                sessionType.textContent = "Short Break";
                minutes = settings.breakDuration;
                currentSessionDuration = settings.breakDuration;
            }
        }
        
        seconds = 0;
        totalSessionTime = 0;
        sessionCount.textContent = `#${sessionCounter}`;
        updateDisplay();
        updateProgress();
        updateStats();
        saveTimerState();
        saveStats();
        
        if (settings.autoStartNextSession) {
            setTimeout(startTimer, 1000);
        }
    }

    function skipSession() {
        sessionEnded();
    }

    function setQuickSession(minutes) {
        if (isRunning) {
            if (!confirm('Timer is running. Do you want to stop it and start a new session?')) {
                return;
            }
            pauseTimer();
        }
        
        settings.focusDuration = minutes;
        isFocusSession = true;
        sessionCounter = 1;
        minutes = settings.focusDuration;
        seconds = 0;
        currentSessionDuration = minutes;
        totalSessionTime = 0;
        
        updateDisplay();
        updateProgress();
        initTimerMode();
        saveSettings();
        saveTimerState();
        
        showNotification(`Quick ${minutes}-minute session set`);
    }

    function updateDisplay() {
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        timeDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
    }

    function updateProgress() {
        if (currentSessionDuration === 0) return;
        
        const totalSeconds = currentSessionDuration * 60;
        const elapsedSeconds = (currentSessionDuration - minutes) * 60 - (60 - seconds);
        const progress = (elapsedSeconds / totalSeconds) * 100;
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}% Complete`;
    }

    function updateClockAndDate() {
        const now = new Date();
        
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString(undefined, options);
        
        digitalClock.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
        currentDate.textContent = dateString;
    }

    function initTimerMode() {
        const timerContainer = document.getElementById('timerContainer');
        timerContainer.classList.remove('focus-mode', 'break-mode', 'long-break-mode');
        
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

    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', newTheme);
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            fullscreenToggle.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
            }
        }
    }

    function showNotification(message, type = 'info') {
        notificationMessage.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            hideNotification();
        }, 5000);
    }

    function hideNotification() {
        notification.classList.remove('show');
    }

    function showRandomQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `- ${quote.author}`;
    }

    function setTaskFilter(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        document.querySelectorAll('.task-item').forEach(item => {
            const isCompleted = item.classList.contains('completed');
            
            switch (filter) {
                case 'active':
                    item.style.display = isCompleted ? 'none' : 'flex';
                    break;
                case 'completed':
                    item.style.display = isCompleted ? 'flex' : 'none';
                    break;
                default:
                    item.style.display = 'flex';
            }
        });
    }

    function switchSettingsTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        event.target.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    function setAudioVolume(volume) {
        const volumeDecimal = volume / 100;
        timerEndSound.volume = volumeDecimal;
        taskCompleteSound.volume = volumeDecimal;
        sessionStartSound.volume = volumeDecimal;
    }

    function updateGoalsProgress() {
        const goals = document.querySelectorAll('.goal-checkbox');
        const completed = Array.from(goals).filter(goal => goal.checked).length;
        goalsProgress.textContent = `${completed}/${goals.length}`;
        
        // Save goals progress
        const goalsData = Array.from(goals).map(goal => goal.checked);
        localStorage.setItem('pomodoroGoals', JSON.stringify(goalsData));
    }

    function updateWeeklyStats() {
        const today = new Date().getDay();
        weekBars.innerHTML = '';
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        days.forEach((day, index) => {
            const bar = document.createElement('div');
            bar.className = 'week-bar';
            bar.style.height = `${weeklyStats[index].sessions * 10}px`;
            
            const label = document.createElement('div');
            label.className = 'week-bar-label';
            label.textContent = day;
            
            bar.appendChild(label);
            weekBars.appendChild(bar);
        });
    }

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
        
        const checkbox = taskItem.querySelector('.task-checkbox');
        const deleteBtn = taskItem.querySelector('.task-delete');
        
        checkbox.addEventListener('change', function() {
            taskItem.classList.toggle('completed', this.checked);
            updateTaskStats();
            saveTasks();
            
            if (this.checked && settings.playSounds) {
                taskCompleteSound.volume = settings.notificationVolume / 100;
                taskCompleteSound.play();
                showNotification('Task completed! 🎉', 'success');
            }
        });
        
        deleteBtn.addEventListener('click', function() {
            taskItem.remove();
            updateTaskStats();
            saveTasks();
        });
        
        updateTaskStats();
        saveTasks();
        
        // Apply current filter
        setTaskFilter(document.querySelector('.filter-btn.active').dataset.filter);
    }

    function clearCompletedTasks() {
        const completedTasks = document.querySelectorAll('.task-item.completed');
        if (completedTasks.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${completedTasks.length} completed tasks?`)) {
            completedTasks.forEach(task => task.remove());
            updateTaskStats();
            saveTasks();
            showNotification('Completed tasks cleared');
        }
    }

    function updateTaskStats() {
        const total = taskList.children.length;
        const completed = document.querySelectorAll('.task-item.completed').length;
        
        totalTasks.textContent = total;
        totalTasksCount.textContent = total;
        completedTasks.textContent = completed;
        tasksCompletedCount = completed;
        updateStats();
        saveStats();
    }

    function updateStats() {
        focusSessions.textContent = totalSessionsCompleted;
        totalFocusTime.textContent = Math.floor(totalMinutesFocused / 60);
        tasksCompleted.textContent = tasksCompletedCount;
        
        // Calculate productivity score (0-100)
        const sessionScore = Math.min(totalSessionsCompleted * 20, 40);
        const timeScore = Math.min(Math.floor(totalMinutesFocused / 60) * 2, 30);
        const taskScore = Math.min(tasksCompletedCount * 6, 30);
        const productivity = sessionScore + timeScore + taskScore;
        
        productivityScore.textContent = productivity;
    }

    function openSettings() {
        // Request notification permission
        if (settings.desktopNotifications && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Populate settings
        document.getElementById('focusDuration').value = settings.focusDuration;
        document.getElementById('breakDuration').value = settings.breakDuration;
        document.getElementById('longBreakDuration').value = settings.longBreakDuration;
        document.getElementById('sessionsBeforeLongBreak').value = settings.sessionsBeforeLongBreak;
        document.getElementById('autoStartNextSession').checked = settings.autoStartNextSession;
        document.getElementById('playSounds').checked = settings.playSounds;
        document.getElementById('desktopNotifications').checked = settings.desktopNotifications;
        document.getElementById('notificationVolume').value = settings.notificationVolume;
        document.getElementById('volumeValue').textContent = settings.notificationVolume + '%';
        document.getElementById('fontSize').value = settings.fontSize;
        document.getElementById('colorTheme').value = settings.colorTheme;
        document.getElementById('reduceMotion').checked = settings.reduceMotion;
        
        settingsModal.style.display = 'flex';
    }

    function closeSettings() {
        settingsModal.style.display = 'none';
    }

    function saveSettings() {
        settings.focusDuration = parseInt(document.getElementById('focusDuration').value) || 25;
        settings.breakDuration = parseInt(document.getElementById('breakDuration').value) || 5;
        settings.longBreakDuration = parseInt(document.getElementById('longBreakDuration').value) || 15;
        settings.sessionsBeforeLongBreak = parseInt(document.getElementById('sessionsBeforeLongBreak').value) || 4;
        settings.autoStartNextSession = document.getElementById('autoStartNextSession').checked;
        settings.playSounds = document.getElementById('playSounds').checked;
        settings.desktopNotifications = document.getElementById('desktopNotifications').checked;
        settings.notificationVolume = parseInt(document.getElementById('notificationVolume').value) || 50;
        settings.fontSize = document.getElementById('fontSize').value;
        settings.colorTheme = document.getElementById('colorTheme').value;
        settings.reduceMotion = document.getElementById('reduceMotion').checked;
        
        // Apply visual settings
        document.body.setAttribute('data-font-size', settings.fontSize);
        document.body.setAttribute('data-color-theme', settings.colorTheme);
        
        if (settings.reduceMotion) {
            document.body.style.setProperty('--transition', 'none');
        } else {
            document.body.style.setProperty('--transition', 'all 0.3s ease');
        }
        
        setAudioVolume(settings.notificationVolume);
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        resetTimer();
        closeSettings();
        showNotification('Settings saved successfully');
    }

    function exportData() {
        const data = {
            settings: settings,
            timerState: timerState,
            stats: {
                totalSessionsCompleted: totalSessionsCompleted,
                totalMinutesFocused: totalMinutesFocused,
                tasksCompletedCount: tasksCompletedCount
            },
            tasks: getTasksData(),
            weeklyStats: weeklyStats,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `study-timer-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully');
    }

    function resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
            localStorage.clear();
            location.reload();
        }
    }

    function getTasksData() {
        const tasks = [];
        document.querySelectorAll('.task-item').forEach(item => {
            tasks.push({
                id: item.dataset.id,
                text: item.querySelector('.task-text').textContent,
                completed: item.querySelector('.task-checkbox').checked
            });
        });
        return tasks;
    }

    // Data persistence functions
    function saveAllData() {
        saveTimerState();
        saveStats();
        saveTasks();
        saveWeeklyStats();
    }

    function loadAllData() {
        // Load theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        
        // Load settings
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
            document.body.setAttribute('data-font-size', settings.fontSize);
            document.body.setAttribute('data-color-theme', settings.colorTheme);
        }
        
        // Load timer state
        const savedTimerState = localStorage.getItem('pomodoroTimerState');
        if (savedTimerState) {
            timerState = JSON.parse(savedTimerState);
        }
        
        // Load stats
        const savedStats = localStorage.getItem('pomodoroStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            totalSessionsCompleted = stats.totalSessionsCompleted || 0;
            totalMinutesFocused = stats.totalMinutesFocused || 0;
            tasksCompletedCount = stats.tasksCompletedCount || 0;
        }
        
        // Load weekly stats
        const savedWeeklyStats = localStorage.getItem('pomodoroWeeklyStats');
        if (savedWeeklyStats) {
            weeklyStats = JSON.parse(savedWeeklyStats);
        }
        
        // Load tasks
        loadTasks();
        
        // Load goals
        const savedGoals = localStorage.getItem('pomodoroGoals');
        if (savedGoals) {
            const goalsData = JSON.parse(savedGoals);
            document.querySelectorAll('.goal-checkbox').forEach((checkbox, index) => {
                if (goalsData[index] !== undefined) {
                    checkbox.checked = goalsData[index];
                }
            });
        }
    }

    function saveTimerState() {
        timerState = {
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
            timerState = JSON.parse(savedTimerState);
        }
    }

    function saveStats() {
        const stats = {
            totalSessionsCompleted: totalSessionsCompleted,
            totalMinutesFocused: totalMinutesFocused,
            tasksCompletedCount: tasksCompletedCount
        };
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }

    function saveWeeklyStats() {
        const today = new Date().getDay();
        weeklyStats[today] = {
            sessions: totalSessionsCompleted,
            minutes: Math.floor(totalMinutesFocused / 60),
            tasks: tasksCompletedCount
        };
        localStorage.setItem('pomodoroWeeklyStats', JSON.stringify(weeklyStats));
    }

    function saveTasks() {
        localStorage.setItem('pomodoroTasks', JSON.stringify(getTasksData()));
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

    // Auto-save when page is about to be unloaded
    window.addEventListener('beforeunload', saveAllData);
});
