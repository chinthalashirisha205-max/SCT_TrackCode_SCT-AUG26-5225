// State Management
let tasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskPriority = document.getElementById('taskPriority');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggleBtn = document.getElementById('themeToggleBtn');

const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderTasks();
});

// Event Listeners
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTask = {
        id: Date.now(),
        title: taskTitle.value.trim(),
        priority: taskPriority.value,
        completed: false
    };
    tasks.push(newTask);
    saveAndRender();
    taskTitle.value = '';
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderTasks();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Helper Functions
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function saveAndRender() {
    localStorage.setItem('app_tasks', JSON.stringify(tasks));
    renderTasks();
}

function toggleTaskStatus(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveAndRender();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

function renderTasks() {
    updateStats();

    // Filter and search logic
    const filteredTasks = tasks.filter(task => {
        const matchesFilter = 
            currentFilter === 'all' ? true :
            currentFilter === 'completed' ? task.completed : !task.completed;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<li style="text-align:center; padding: 20px; opacity: 0.6;">No tasks found.</li>';
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${task.id})">
                <span class="task-title">${task.title}</span>
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}