// Initial Mock Data
const initialData = [
    {
        id: 1,
        name: "Rohit",
        avatar: "https://i.pravatar.cc/150?u=rohit",
        currentBacks: 3,
        expectedBacks: 2,
        clearedBacks: 0,
        quote: "I study only after the exam finishes.",
        survivalChance: 20
    },
    {
        id: 2,
        name: "Aman",
        avatar: "https://i.pravatar.cc/150?u=aman",
        currentBacks: 1,
        expectedBacks: 0,
        clearedBacks: 2,
        quote: "Bro, trust me, this semester is mine.",
        survivalChance: 80
    },
    {
        id: 3,
        name: "Vikash",
        avatar: "https://i.pravatar.cc/150?u=vikash",
        currentBacks: 5,
        expectedBacks: 3,
        clearedBacks: 1,
        quote: "Degree is just a piece of paper. Backlogs are emotions.",
        survivalChance: 5
    },
    {
        id: 4,
        name: "Neha",
        avatar: "https://i.pravatar.cc/150?u=neha",
        currentBacks: 0,
        expectedBacks: 0,
        clearedBacks: 0,
        quote: "Why do you guys even fail?",
        survivalChance: 99
    },
    {
        id: 5,
        name: "Karan",
        avatar: "https://i.pravatar.cc/150?u=karan",
        currentBacks: 2,
        expectedBacks: 1,
        clearedBacks: 1,
        quote: "Internal marks ruined my life.",
        survivalChance: 50
    },
    {
        id: 6,
        name: "Rahul",
        avatar: "https://i.pravatar.cc/150?u=rahul",
        currentBacks: 4,
        expectedBacks: 2,
        clearedBacks: 0,
        quote: "Syllabus is out of syllabus.",
        survivalChance: 15
    }
];

// Titles logic
const titles = [
    "CGPA Assassin", "Semester Slayer", "Backlog Mafia", 
    "Revaluation Warrior", "Internal Marks Beggar", 
    "Assignment Copier", "Hall Ticket Survivor", "Dean’s Nightmare"
];

// App State
let players = JSON.parse(localStorage.getItem('bpl_data')) || [...initialData];
let chartsInstance = { bar: null, doughnut: null };

// DOM Elements
const leaderboardBody = document.getElementById('leaderboard-body');
const cardsGrid = document.getElementById('cards-grid');
const topShame = document.getElementById('top-shame');
const tickerContent = document.getElementById('ticker-content');
const roastBtn = document.getElementById('roast-btn');
const roastDisplay = document.getElementById('roast-display');

// Admin Elements
const adminModal = document.getElementById('admin-modal');
const adminLoginBtn = document.getElementById('admin-login-btn');
const closeModalBtn = document.getElementById('close-modal');
const loginSubmit = document.getElementById('login-submit');
const adminPass = document.getElementById('admin-pass');
const loginError = document.getElementById('login-error');
const passwordScreen = document.getElementById('password-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const editList = document.getElementById('edit-list');
const resetDataBtn = document.getElementById('reset-data-btn');
const addPlayerBtn = document.getElementById('add-player-btn');

// Audio
const sfxRoast = document.getElementById('sfx-roast');
const sfxSuccess = document.getElementById('sfx-success');
const sfxError = document.getElementById('sfx-error');

function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log('Audio play prevented', e));
}

// Logic Functions
function calculatePoints(player) {
    return (player.currentBacks * 10) + (player.expectedBacks * 5) - (player.clearedBacks * 3);
}

function getStatusInfo(points) {
    if (points <= 10) return { text: "Safe Zone 😎", class: "status-safe" };
    if (points <= 25) return { text: "Under Pressure 💀", class: "status-pressure" };
    if (points <= 40) return { text: "Academic Criminal 🚨", class: "status-criminal" };
    return { text: "Legendary Failure 👑", class: "status-legend" };
}

function getRandomTitle() {
    return titles[Math.floor(Math.random() * titles.length)];
}

function getRoastMeter(points) {
    return Math.min(100, Math.max(0, points * 2));
}

function processData() {
    // Add calculated fields
    const processed = players.map(p => {
        const points = calculatePoints(p);
        return {
            ...p,
            points,
            status: getStatusInfo(points),
            title: p.title || getRandomTitle(), // Assign title if not exists
            roastMeter: getRoastMeter(points)
        };
    });

    // Sort by points descending
    processed.sort((a, b) => b.points - a.points);
    
    // Save generated titles back to state so they don't change every render
    processed.forEach(p => {
        const original = players.find(orig => orig.id === p.id);
        if(original && !original.title) original.title = p.title;
    });
    saveData();

    return processed;
}

function saveData() {
    localStorage.setItem('bpl_data', JSON.stringify(players));
}

// Rendering
function renderApp() {
    const sortedPlayers = processData();
    renderLeaderboard(sortedPlayers);
    renderCards(sortedPlayers);
    renderHallOfShame(sortedPlayers);
    updateCharts(sortedPlayers);
    initTicker(sortedPlayers);
    if (!adminDashboard.classList.contains('hidden')) {
        renderAdminEditList();
    }
}

function renderLeaderboard(data) {
    leaderboardBody.innerHTML = '';
    data.forEach((player, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="rank-col">#${index + 1}</td>
            <td class="player-col">
                <img src="${player.avatar}" alt="${player.name}">
                ${player.name}
            </td>
            <td>${player.currentBacks}</td>
            <td>${player.expectedBacks}</td>
            <td>${player.clearedBacks}</td>
            <td class="points-col">${player.points}</td>
            <td><span class="status-badge ${player.status.class}">${player.status.text}</span></td>
            <td>${player.title}</td>
        `;
        leaderboardBody.appendChild(tr);
    });
}

function renderCards(data) {
    cardsGrid.innerHTML = '';
    data.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card glass-panel';
        
        let roastColor = player.roastMeter > 70 ? 'var(--danger)' : player.roastMeter > 40 ? 'var(--warning)' : 'var(--success)';
        let survivalColor = player.survivalChance < 30 ? 'var(--danger)' : player.survivalChance < 60 ? 'var(--warning)' : 'var(--success)';

        card.innerHTML = `
            <div class="card-header">
                <img src="${player.avatar}" alt="${player.name}">
                <div class="card-info">
                    <h3>${player.name}</h3>
                    <span class="title">${player.title}</span>
                </div>
            </div>
            <div class="card-quote">"${player.quote}"</div>
            <div class="card-stats">
                <div class="stat-row">
                    <div class="stat-label">
                        <span>Survival Chance</span>
                        <span style="color: ${survivalColor}">${player.survivalChance}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${player.survivalChance}%; background: ${survivalColor}"></div>
                    </div>
                </div>
                <div class="stat-row">
                    <div class="stat-label">
                        <span>Roast Meter</span>
                        <span style="color: ${roastColor}">${player.roastMeter}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${player.roastMeter}%; background: ${roastColor}"></div>
                    </div>
                </div>
            </div>
        `;
        cardsGrid.appendChild(card);
    });
}

function renderHallOfShame(data) {
    if (data.length === 0) return;
    const topScorer = data[0]; // highest points
    
    if (topScorer.points > 0) {
        topShame.innerHTML = `
            <img src="${topScorer.avatar}" alt="${topScorer.name}">
            <div class="shame-info">
                <h4>${topScorer.name}</h4>
                <p>${topScorer.points} Backlog Points</p>
                <small>"${topScorer.title}"</small>
            </div>
        `;
    } else {
        topShame.innerHTML = `<p style="color: var(--success)">Everyone is safe... for now.</p>`;
    }
}

// Ticker Logic
function initTicker(data) {
    const defaultMessages = [
        "Emergency meeting called after unit test disaster.",
        "Internal marks under investigation.",
        "Library attendance drops to 0% after midterms."
    ];
    
    const dynamicMessages = data.filter(p => p.points > 10).map(p => {
        const actions = ["spotted studying 1 day before exam.", "praying to every god known to mankind.", "asking for important questions.", "survived by grace marks."];
        return `${p.name} ${actions[Math.floor(Math.random() * actions.length)]}`;
    });

    const allMessages = [...dynamicMessages, ...defaultMessages].sort(() => 0.5 - Math.random());
    
    tickerContent.innerHTML = '';
    // Duplicate for seamless scroll
    for(let i=0; i<3; i++) {
        allMessages.forEach(msg => {
            const span = document.createElement('span');
            span.className = 'ticker-item';
            span.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${msg}`;
            tickerContent.appendChild(span);
        });
    }
}

// Roast Generator
roastBtn.addEventListener('click', () => {
    playSound(sfxRoast);
    const sorted = processData();
    if(sorted.length === 0) return;
    
    const target = sorted[Math.floor(Math.random() * sorted.length)];
    const roasts = [
        `${target.name}'s admit card has more re-appear stamps than a passport.`,
        `If failing was a sport, ${target.name} would have a gold medal.`,
        `${target.name} expects to pass like I expect to win the lottery without a ticket.`,
        `${target.name}'s study schedule is just looking at the syllabus and crying.`,
        `Rumor has it ${target.name} pays the university's electricity bill with their re-eval fees.`
    ];
    
    roastDisplay.style.opacity = 0;
    setTimeout(() => {
        roastDisplay.textContent = roasts[Math.floor(Math.random() * roasts.length)];
        roastDisplay.style.opacity = 1;
    }, 200);
});

// Charts
function updateCharts(data) {
    const labels = data.map(d => d.name);
    const backData = data.map(d => d.currentBacks);
    
    const safeCount = data.filter(d => d.status.text.includes('Safe')).length;
    const dangerCount = data.length - safeCount;

    // Bar Chart
    if(chartsInstance.bar) chartsInstance.bar.destroy();
    const ctxBar = document.getElementById('barChart').getContext('2d');
    chartsInstance.bar = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Current Backs',
                data: backData,
                backgroundColor: 'rgba(255, 75, 75, 0.6)',
                borderColor: 'rgba(255, 75, 75, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: {
                y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: '#fff' }, grid: { display: false } }
            }
        }
    });

    // Doughnut Chart
    if(chartsInstance.doughnut) chartsInstance.doughnut.destroy();
    const ctxDough = document.getElementById('doughnutChart').getContext('2d');
    chartsInstance.doughnut = new Chart(ctxDough, {
        type: 'doughnut',
        data: {
            labels: ['Safe', 'In Danger'],
            datasets: [{
                data: [safeCount, dangerCount],
                backgroundColor: ['rgba(0, 255, 135, 0.6)', 'rgba(255, 75, 75, 0.6)'],
                borderColor: ['rgba(0, 255, 135, 1)', 'rgba(255, 75, 75, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } }
        }
    });
}

// Admin Panel Logic
adminLoginBtn.addEventListener('click', () => {
    adminModal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    adminModal.classList.remove('active');
    adminPass.value = '';
    loginError.textContent = '';
});

loginSubmit.addEventListener('click', () => {
    if(adminPass.value === 'bklg123') {
        playSound(sfxSuccess);
        passwordScreen.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        renderAdminEditList();
    } else {
        playSound(sfxError);
        loginError.textContent = 'Incorrect Password! Nice try, backbencher.';
    }
});

function renderAdminEditList() {
    editList.innerHTML = '';
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'edit-row glass-panel';
        div.innerHTML = `
            <img src="${p.avatar}" alt="avatar" style="width:40px; height:40px; border-radius:50%">
            <div class="edit-inputs">
                <input type="text" id="name-${p.id}" value="${p.name}" placeholder="Name">
                <input type="number" id="cb-${p.id}" value="${p.currentBacks}" placeholder="Curr Backs" min="0">
                <input type="number" id="eb-${p.id}" value="${p.expectedBacks}" placeholder="Exp Backs" min="0">
                <input type="number" id="clb-${p.id}" value="${p.clearedBacks}" placeholder="Cleared" min="0">
                <input type="number" id="surv-${p.id}" value="${p.survivalChance}" placeholder="Surv %" min="0" max="100">
                <input type="text" id="quote-${p.id}" value="${p.quote}" placeholder="Quote" class="full-width">
            </div>
            <button class="glow-btn success save-btn" onclick="savePlayer(${p.id})"><i class="fas fa-save"></i></button>
            <button class="glow-btn danger save-btn" onclick="deletePlayer(${p.id})"><i class="fas fa-trash"></i></button>
        `;
        editList.appendChild(div);
    });
}

window.savePlayer = function(id) {
    const player = players.find(p => p.id === id);
    if(player) {
        player.name = document.getElementById(`name-${id}`).value;
        player.currentBacks = parseInt(document.getElementById(`cb-${id}`).value) || 0;
        player.expectedBacks = parseInt(document.getElementById(`eb-${id}`).value) || 0;
        player.clearedBacks = parseInt(document.getElementById(`clb-${id}`).value) || 0;
        player.survivalChance = parseInt(document.getElementById(`surv-${id}`).value) || 0;
        player.quote = document.getElementById(`quote-${id}`).value;
        
        saveData();
        renderApp();
        playSound(sfxSuccess);
    }
};

window.deletePlayer = function(id) {
    players = players.filter(p => p.id !== id);
    saveData();
    renderApp();
    playSound(sfxSuccess);
};

addPlayerBtn.addEventListener('click', () => {
    const newId = players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
    players.push({
        id: newId,
        name: "New Student",
        avatar: `https://i.pravatar.cc/150?u=${newId}`,
        currentBacks: 0,
        expectedBacks: 0,
        clearedBacks: 0,
        quote: "I am new here.",
        survivalChance: 100,
        title: getRandomTitle()
    });
    saveData();
    renderApp();
});

resetDataBtn.addEventListener('click', () => {
    if(confirm("Are you sure you want to reset all data to default?")) {
        players = [...initialData];
        saveData();
        renderApp();
        playSound(sfxSuccess);
    }
});

// Initialize
renderApp();
