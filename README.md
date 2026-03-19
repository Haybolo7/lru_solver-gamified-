# 🚀 LRU Cache Solver: $O(1)$ Implementation & Visualizer

A high-performance web-based simulation of the **Least Recently Used (LRU)** Page Replacement Algorithm. This project implements a cache that supports `get` and `put` operations in strictly constant time while providing a step-by-step visual illustration of memory frame transitions.

---

## 📝 Problem Statement

In Operating Systems, page replacement algorithms decide which memory page to evict when a new page is requested and the physical memory (frames) is full. 

The **Least Recently Used (LRU)** policy dictates that the page which has not been used for the longest period of time should be the first to be replaced. The challenge is to implement this logic such that:
1. **`get(key)`**: Returns the value and marks the key as most recently used in **$O(1)$**.
2. **`put(key, value)`**: Adds/updates items and handles eviction of the oldest item in **$O(1)$**.
3. **Visualization**: Provide a clear grid showing Page Faults, Hits, and the state of memory frames over a sequence of references.

---

## 🏗️ Architecture & Algorithmic Design

To achieve **$O(1)$ performance**, a single data structure is insufficient. This implementation utilizes a **Hybrid Data Structure** approach:

### 1. The Hash Map (The "Search Engine")
* **Role**: Acts as a lookup table where the `key` is the Page ID and the `value` is a reference (pointer) to a specific node in the Linked List.
* **Why**: Provides **$O(1)$** access to any element, eliminating the need to search through memory frames.

### 2. The Doubly Linked List (The "Chronometer")
* **Role**: Maintains the order of usage. The node at the **Head** is the Most Recently Used (MRU), and the node at the **Tail** is the Least Recently Used (LRU).
* **Why**: Allows us to remove a node from the middle and re-insert it at the head in **$O(1)$** time, provided we have the reference from the Hash Map.



### 3. Efficiency Justification
| Operation | Process | Complexity |
| :--- | :--- | :--- |
| **Lookup** | Direct access via Hash Map | $O(1)$ |
| **Update Order** | Remove node and move to Head | $O(1)$ |
| **Eviction** | Remove node at `Tail.prev` | $O(1)$ |

---

## 🛠️ Methodology

The application is built using a decoupled **Model-View-Controller (MVC)** inspired approach:

1.  **The Engine (`script.js`)**:
    * Defines a `Node` class and an `LRUCache` class.
    * Uses "Dummy Head" and "Dummy Tail" nodes to eliminate null-pointer checks during edge-case insertions and deletions.
2.  **The Simulator**:
    * Parses the user-provided space-separated page string.
    * Maps the logical LRU cache positions to physical "Frame Slots" to accurately reflect how an OS manages physical RAM.
3.  **The Interface (`index.html` & `style.css`)**:
    * A responsive split-screen design.
    * **Left Panel**: Dynamic user input for frame capacity and reference strings.
    * **Right Panel**: Real-time generation of the result table and performance metrics.

---

## 📊 Results & Output

The solver provides a detailed "Trace Table" that illustrates the memory state at every single step of the execution.

### Key Metrics Tracked:
* **Total Page Faults**: Incremented whenever a requested page is not in the frames (Miss).
* **Hit Ratio**: The frequency of successful page lookups ($Hits / Total Requests$).
* **Miss Ratio**: The frequency of page replacements ($Faults / Total Requests$).

### Visual Representation:
The output includes a grid where:
* **Columns** represent the time steps (Page References).
* **Rows** represent physical memory frames.
* **Status Row** marks each step as **H** (Hit) or **M** (Miss/Fault) for quick auditing.

---

## 🚀 How to Run
1. Clone the repository.
2. Open `index.html` in any modern web browser.
3. Enter the number of frames (e.g., `3`) and the sequence (e.g., `7 0 1 2 0 3`).
4. Click **Generate Illustration** to see the $O(1)$ logic in action.
