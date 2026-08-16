// Sample Quiz Data
const quizData = [
    {
        question: "Which language runs in a web browser?",
        options: ["Java", "C", "Python", "JavaScript"],
        correct: 3
    },
    {
        question: "What does CSS stand for?",
        options: ["Central Style Sheets", "Cascading Style Sheets", "Cascading Simple Sheets", "Cars SUVs Sailboats"],
        correct: 1
    },
    {
        question: "Which HTML tag is used to link an external JavaScript file?",
        options: ["<script>", "<javascript>", "<js>", "<link>"],
        correct: 0
    },
    {
        question: "Which method is used to save data in LocalStorage?",
        options: ["LocalStorage.save()", "localStorage.setItem()", "localStorage.store()", "sessionStorage.set()"],
        correct: 1
    }
];

// App State Variables
let users = JSON.parse(localStorage.getItem('quiz_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('quiz_current_user')) || null;
let currentQuestionIndex = 0;
let score = 0;
let isSignUp = false;

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authError = document.getElementById('auth-error');
const authBtn = document.getElementById('auth-btn');
const toggleAuth = document.getElementById('toggle-auth');
const toggleMsg = document.getElementById('toggle-msg');

const userDisplay = document.getElementById('user-display');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progressFill = document.getElementById('progress');
const feedbackMsg = document.getElementById('feedback-msg');
const questionCount = document.getElementById('question-count');
const nextBtn = document.getElementById('next-btn');

const finalScore = document.getElementById('final-score');
const totalQuestions = document.getElementById('total-questions');
const highScoresList = document.getElementById('high-scores-list');

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        showQuizScreen();
    } else {
        showAuthScreen();
    }
});

// Authentication Toggle
toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;
    authTitle.textContent = isSignUp ? "Sign Up for Quiz" : "Login to Take Quiz";
    authBtn.textContent = isSignUp ? "Sign Up" : "Login";
    toggleMsg.textContent = isSignUp ? "Already have an account?" : "Don't have an account?";
    toggleAuth.textContent = isSignUp ? "Login" : "Sign Up";
    authError.textContent = "";
});

// Handle Login / Signup
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (isSignUp) {
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            authError.textContent = "Username already exists!";
            return;
        }
        const newUser = { username, password, highScore: 0 };
        users.push(newUser);
        localStorage.setItem('quiz_users', JSON.stringify(users));
        currentUser = newUser;
        localStorage.setItem('quiz_current_user', JSON.stringify(currentUser));
        showQuizScreen();
    } else {
        const validUser = users.find(u => u.username === username && u.password === password);
        if (validUser) {
            currentUser = validUser;
            localStorage.setItem('quiz_current_user', JSON.stringify(currentUser));
            showQuizScreen();
        } else {
            authError.textContent = "Invalid username or password!";
        }
    }
});

// Logout Handlers
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('result-logout-btn').addEventListener('click', logout);

function logout() {
    currentUser = null;
    localStorage.removeItem('quiz_current_user');
    showAuthScreen();
}

// Screen Switchers
function showAuthScreen() {
    authScreen.classList.remove('hidden');
    quizScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    authForm.reset();
    authError.textContent = "";
}

function showQuizScreen() {
    authScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    resultScreen.classList.add('hidden');
    userDisplay.textContent = `User: ${currentUser.username}`;
    currentQuestionIndex = 0;
    score = 0;
    loadQuestion();
}

// Quiz Functions
function loadQuestion() {
    nextBtn.classList.add('hidden');
    feedbackMsg.textContent = "";
    
    const currentQuestion = quizData[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
    progressFill.style.width = `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;

    optionsContainer.innerHTML = "";
    currentQuestion.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.classList.add('option-btn');
        btn.addEventListener('click', () => selectOption(index, currentQuestion.correct));
        optionsContainer.appendChild(btn);
    });
}

function selectOption(selectedIndex, correctIndex) {
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);

    if (selectedIndex === correctIndex) {
        score++;
        buttons[selectedIndex].classList.add('correct');
        feedbackMsg.textContent = "Correct Answer!";
        feedbackMsg.style.color = "#4caf50";
    } else {
        buttons[selectedIndex].classList.add('wrong');
        buttons[correctIndex].classList.add('correct');
        feedbackMsg.textContent = "Wrong Answer!";
        feedbackMsg.style.color = "#f44336";
    }

    if (currentQuestionIndex < quizData.length - 1) {
        nextBtn.classList.remove('hidden');
    } else {
        setTimeout(showResultScreen, 1500);
    }
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    loadQuestion();
});

// Results & LocalStorage Score Updates
function showResultScreen() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    finalScore.textContent = score;
    totalQuestions.textContent = quizData.length;

    // Update user high score if better
    if (score > (currentUser.highScore || 0)) {
        currentUser.highScore = score;
        localStorage.setItem('quiz_current_user', JSON.stringify(currentUser));
        
        // Update main users list
        const userIdx = users.findIndex(u => u.username === currentUser.username);
        if (userIdx !== -1) {
            users[userIdx].highScore = score;
            localStorage.setItem('quiz_users', JSON.stringify(users));
        }
    }

    renderHighScores();
}

function renderHighScores() {
    highScoresList.innerHTML = "";
    const sortedUsers = [...users].sort((a, b) => (b.highScore || 0) - (a.highScore || 0));
    
    sortedUsers.forEach(u => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${u.username}</span> <span>${u.highScore || 0} pts</span>`;
        highScoresList.appendChild(li);
    });
}

document.getElementById('restart-btn').addEventListener('click', showQuizScreen);