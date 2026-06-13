/**
 * Doubly Linked List Node for O(1) removals and additions
 */
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

/**
 * O(1) LRU Cache Implementation using Map + Doubly Linked List
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();

        this.head = new Node(-1, -1);
        this.tail = new Node(-1, -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    _addNodeToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    get(key) {
        if (this.map.has(key)) {
            let node = this.map.get(key);
            this._removeNode(node);
            this._addNodeToHead(node);
            return node.value;
        }
        return -1;
    }

    put(key, value) {
        if (this.map.has(key)) {
            let node = this.map.get(key);
            this._removeNode(node);
        }

        let newNode = new Node(key, value);
        this._addNodeToHead(newNode);
        this.map.set(key, newNode);

        if (this.map.size > this.capacity) {
            let lruNode = this.tail.prev;
            this._removeNode(lruNode);
            this.map.delete(lruNode.key);
            return lruNode;
        }
        return null;
    }
}

// Global Game State Engine Variables
let gameState = {
    mode: 'SOLVE', // 'SOLVE' or 'CHALLENGE'
    score: 0,
    streak: 0,
    maxStreak: 0,
    currentStep: 0,
    pages: [],
    framesCount: 3,
    cache: null,
    physicalFrames: [],
    snapshots: [],
    statuses: [],
    calculatedHits: 0,
    calculatedFaults: 0
};

/**
 * Normal Auto-Simulation Execution Sequence Block
 */
function runSimulationMode() {
    gameState.mode = 'SOLVE';
    document.getElementById("gameplay-box").classList.add("hidden");
    resetScores();
    evaluateFullLRU();
}

/**
 * Compiles and builds standard cache states out of user inputs
 */
function evaluateFullLRU() {
    const framesInput = parseInt(document.getElementById("frames").value);
    const pagesInput = document.getElementById("pages").value.trim();

    if (isNaN(framesInput) || framesInput <= 0 || !pagesInput) return false;

    gameState.framesCount = framesInput;
    gameState.pages = pagesInput.split(/\s+/);
    gameState.cache = new LRUCache(framesInput);
    gameState.physicalFrames = new Array(framesInput).fill(null);
    gameState.snapshots = [];
    gameState.statuses = [];
    gameState.calculatedHits = 0;
    gameState.calculatedFaults = 0;

    for (let i = 0; i < gameState.pages.length; i++) {
        const page = gameState.pages[i];
        const frameIndex = gameState.cache.get(page);

        if (frameIndex !== -1) {
            gameState.calculatedHits++;
            gameState.statuses.push('H');
        } else {
            gameState.calculatedFaults++;
            gameState.statuses.push('M');

            let emptyFrameIdx = gameState.physicalFrames.indexOf(null);
            if (emptyFrameIdx !== -1) {
                gameState.cache.put(page, emptyFrameIdx);
                gameState.physicalFrames[emptyFrameIdx] = page;
            } else {
                const evictedNode = gameState.cache.tail.prev;
                const reusedFrameIdx = evictedNode.value;
                gameState.cache.put(page, reusedFrameIdx);
                gameState.physicalFrames[reusedFrameIdx] = page;
            }
        }
        gameState.snapshots.push([...gameState.physicalFrames]);
    }

    renderUIAndTables();
    checkBadges();
    return true;
}

/**
 * Initializes Interactive Gamified Play Mode Loops
 */
function startChallengeMode() {
    gameState.mode = 'CHALLENGE';
    resetScores();
    
    const framesInput = parseInt(document.getElementById("frames").value);
    const pagesInput = document.getElementById("pages").value.trim();
    if (isNaN(framesInput) || framesInput <= 0 || !pagesInput) return;

    gameState.framesCount = framesInput;
    gameState.pages = pagesInput.split(/\s+/);
    gameState.cache = new LRUCache(framesInput);
    gameState.physicalFrames = new Array(framesInput).fill(null);
    gameState.snapshots = [];
    gameState.statuses = [];
    gameState.calculatedHits = 0;
    gameState.calculatedFaults = 0;
    gameState.currentStep = 0;

    document.getElementById("gameplay-box").classList.remove("hidden");
    document.getElementById("game-feedback").innerText = "Game started! Make your prediction.";
    document.getElementById("game-feedback").style.color = "#000";

    updateChallengeStepView();
    renderUIAndTables();
}

/**
 * Iterates state visualization trackers to next processing node
 */
function updateChallengeStepView() {
    if (gameState.currentStep < gameState.pages.length) {
        document.getElementById("target-page").innerText = gameState.pages[gameState.currentStep];
    } else {
        document.getElementById("gameplay-box").classList.add("hidden");
        document.getElementById("game-feedback").innerText = "Challenge Complete! Check your stats.";
        checkBadges();
    }
}

/**
 * Validates whether user clicked right prediction option
 */
function submitPrediction(userPrediction) {
    if (gameState.currentStep >= gameState.pages.length) return;

    const page = gameState.pages[gameState.currentStep];
    const frameIndex = gameState.cache.get(page);
    let correctStatus = 'M';

    if (frameIndex !== -1) {
        correctStatus = 'H';
        gameState.calculatedHits++;
    } else {
        gameState.calculatedFaults++;
        let emptyFrameIdx = gameState.physicalFrames.indexOf(null);
        if (emptyFrameIdx !== -1) {
            gameState.cache.put(page, emptyFrameIdx);
            gameState.physicalFrames[emptyFrameIdx] = page;
        } else {
            const evictedNode = gameState.cache.tail.prev;
            const reusedFrameIdx = evictedNode.value;
            gameState.cache.put(page, reusedFrameIdx);
            gameState.physicalFrames[reusedFrameIdx] = page;
        }
    }

    gameState.statuses.push(correctStatus);
    gameState.snapshots.push([...gameState.physicalFrames]);

    const feedbackEl = document.getElementById("game-feedback");
    const streakValEl = document.getElementById("game-streak");

    // Check prediction accuracy and award points
    if (userPrediction === correctStatus) {
        gameState.score += 10;
        gameState.streak++;
        feedbackEl.innerText = `Correct! It was a ${correctStatus === 'H' ? 'Hit' : 'Miss'}. (+10 pts)`;
        feedbackEl.style.color = "#27ae60";
        if (gameState.streak > gameState.maxStreak) {
            gameState.maxStreak = gameState.streak;
        }
    } else {
        gameState.score = Math.max(0, gameState.score - 5);
        gameState.streak = 0;
        feedbackEl.innerText = `Incorrect! The correct event was ${correctStatus === 'H' ? 'Hit' : 'Miss'}. (-5 pts)`;
        feedbackEl.style.color = "#c0392b";
    }

    // Apply streak visual effects if active streak >= 3
    if (gameState.streak >= 3) {
        streakValEl.classList.add("glowing-streak");
    } else {
        streakValEl.classList.remove("glowing-streak");
    }

    document.getElementById("game-score").innerText = gameState.score;
    streakValEl.innerText = gameState.streak;
    document.getElementById("max-streak").innerText = gameState.maxStreak;

    gameState.currentStep++;
    renderUIAndTables();
    updateChallengeStepView();
    checkBadges();
}

/**
 * Triggers badge unlock states based on scores and stats
 */
function checkBadges() {
    const total = gameState.statuses.length;
    
    // 1. Flawless Integration Badge (100% Hit Ratio over finished track)
    if (total === gameState.pages.length && gameState.calculatedHits === total) {
        document.getElementById("badge-flawless").classList.replace("locked", "unlocked");
    }
    // 2. Eviction Expert Badge (Prediction streak >= 5)
    if (gameState.maxStreak >= 5) {
        document.getElementById("badge-expert").classList.replace("locked", "unlocked");
    }
    // 3. Cache Memory Master Badge (Score >= 60 in Challenge Mode)
    if (gameState.mode === 'CHALLENGE' && gameState.score >= 60) {
        document.getElementById("badge-master").classList.replace("locked", "unlocked");
    }
}

/**
 * Standard utility score resetting helper
 */
function resetScores() {
    gameState.score = 0;
    gameState.streak = 0;
    document.getElementById("game-score").innerText = "0";
    document.getElementById("game-streak").innerText = "0";
    document.getElementById("game-streak").classList.remove("glowing-streak");
}

/**
 * Builds visualization matrix mapping snapshots dynamically
 */
function renderUIAndTables() {
    const totalRequests = gameState.snapshots.length;
    const totalInputPages = gameState.pages.length;

    if (totalRequests === 0) {
        document.getElementById("total-faults").innerText = `Total number of page faults = 0`;
        document.getElementById("hit-ratio").innerText = `Hit ratio = 0/0 (0.00%)`;
        document.getElementById("miss-ratio").innerText = `Miss ratio = 0/0 (0.00%)`;
        document.getElementById("table-container").innerHTML = "<p style='color:#666;'>No data processed yet.</p>";
        return;
    }

    document.getElementById("total-faults").innerText = `Total number of page faults = ${gameState.calculatedFaults}`;
    document.getElementById("hit-ratio").innerText = `Hit ratio = ${gameState.calculatedHits}/${totalRequests} (${((gameState.calculatedHits / totalRequests) * 100).toFixed(2)}%)`;
    document.getElementById("miss-ratio").innerText = `Miss ratio = ${gameState.calculatedFaults}/${totalRequests} (${((gameState.calculatedFaults / totalRequests) * 100).toFixed(2)}%)`;

    let html = '<table><tr>';
    
    // 1. Input Row
    for (let i = 0; i < totalInputPages; i++) {
        let activeClass = (gameState.mode === 'CHALLENGE' && i === gameState.currentStep) ? 'class="active-step"' : '';
        html += `<th ${activeClass}>${gameState.pages[i]}</th>`;
    }
    html += '</tr>';

    // 2. Physical Memory Frames Layout Mapping Matrix
    for (let f = 0; f < gameState.framesCount; f++) {
        html += '<tr>';
        for (let step = 0; step < totalInputPages; step++) {
            if (step < totalRequests) {
                const val = gameState.snapshots[step][f];
                html += `<td>${val !== null ? val : ''}</td>`;
            } else {
                html += '<td></td>';
            }
        }
        html += '</tr>';
    }

    // 3. Evaluation Status Matrix Tracker Row
    html += '<tr>';
    for (let step = 0; step < totalInputPages; step++) {
        if (step < totalRequests) {
            let s = gameState.statuses[step];
            let cssClass = s === 'H' ? 'status-hit' : 'status-miss';
            html += `<td class="${cssClass}">${s}</td>`;
        } else {
            html += '<td></td>';
        }
    }
    html += '</tr></table>';

    document.getElementById("table-container").innerHTML = html;
}

// Boot up implementation instance automatically on standard browser load
window.onload = runSimulationMode;