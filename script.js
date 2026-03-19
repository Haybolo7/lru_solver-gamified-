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
        this.map = new Map(); // Stores key -> Node

        // Dummy head and tail to avoid edge cases during insertion/deletion
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

    // O(1) Get
    get(key) {
        if (this.map.has(key)) {
            let node = this.map.get(key);
            this._removeNode(node);
            this._addNodeToHead(node); // Mark as recently used
            return node.value;
        }
        return -1;
    }

    // O(1) Put
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
            return lruNode; // Returning the evicted node to help the visualizer
        }
        return null;
    }
}

/**
 * Simulator mapping the LRU Logic to physical frame indexes
 */
function calculateLRU() {
    const framesInput = parseInt(document.getElementById("frames").value);
    const pagesInput = document.getElementById("pages").value.trim();

    if (isNaN(framesInput) || framesInput <= 0 || !pagesInput) return;

    // Clean multiple spaces and convert to array
    const pages = pagesInput.split(/\s+/);
    const cache = new LRUCache(framesInput);

    // Array to represent the physical "frames" column visually
    const physicalFrames = new Array(framesInput).fill(null);
    const snapshots = [];
    const statuses = []; // 'Hit' or 'Miss'

    let hits = 0;
    let faults = 0;

    // Process each page reference
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // In our implementation, the 'value' stored in the cache is the frame index
        const frameIndex = cache.get(page);

        if (frameIndex !== -1) {
            hits++;
            statuses.push('H');
        } else {
            faults++;
            statuses.push('M');

            // Check if there's an empty physical frame
            let emptyFrameIdx = physicalFrames.indexOf(null);

            if (emptyFrameIdx !== -1) {
                cache.put(page, emptyFrameIdx);
                physicalFrames[emptyFrameIdx] = page;
            } else {
                // Cache is full. Evict LRU to get its physical frame index
                const evictedNode = cache.tail.prev;
                const reusedFrameIdx = evictedNode.value;

                cache.put(page, reusedFrameIdx);
                physicalFrames[reusedFrameIdx] = page;
            }
        }

        // Save a deep copy of the current state of physical frames for the table
        snapshots.push([...physicalFrames]);
    }

    // --- Update UI ---
    const totalRequests = pages.length;
    document.getElementById("total-faults").innerText = `Total number of page faults= ${faults}`;
    document.getElementById("hit-ratio").innerText = `Hit ratio= ${hits}/${totalRequests} (${((hits / totalRequests) * 100).toFixed(2)}%)`;
    document.getElementById("miss-ratio").innerText = `Miss ratio= ${faults}/${totalRequests} (${((faults / totalRequests) * 100).toFixed(2)}%)`;

    generateTable(pages, snapshots, statuses, framesInput);
}

function generateTable(pages, snapshots, statuses, numFrames) {
    let html = '<table>';

    // 1. Header row (Input Sequence)
    html += '<tr>';
    pages.forEach(p => {
        html += `<th>${p}</th>`;
    });
    html += '</tr>';

    // 2. Rows for each memory Frame
    for (let f = 0; f < numFrames; f++) {
        html += '<tr>';
        for (let step = 0; step < snapshots.length; step++) {
            const val = snapshots[step][f];
            html += `<td>${val !== null ? val : ''}</td>`;
        }
        html += '</tr>';
    }

    // 3. Status row (Hit or Miss indicators)
    html += '<tr>';
    for (let s of statuses) {
        let cssClass = s === 'H' ? 'status-hit' : 'status-miss';
        html += `<td class="${cssClass}">${s}</td>`;
    }
    html += '</tr>';

    html += '</table>';
    document.getElementById("table-container").innerHTML = html;
}

// Auto-run once on load
window.onload = calculateLRU;