// ── Code Templates Engine ─────────────────────────────────────────────────────
window.LCTemplates = {
    templates: {
        python: [
            {
                name: 'Standard Imports',
                code: 'from collections import defaultdict, deque, Counter\nfrom typing import List, Optional\nimport heapq, bisect, math\n'
            },
            {
                name: 'BFS Template',
                code: 'from collections import deque\n\ndef bfs(graph, start):\n    visited = set([start])\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n'
            },
            {
                name: 'Binary Search',
                code: 'def binary_search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n'
            },
            {
                name: 'Two Pointers',
                code: 'def two_pointers(nums):\n    left, right = 0, len(nums) - 1\n    while left < right:\n        # process\n        left += 1\n        right -= 1\n'
            },
            {
                name: 'DFS Tree',
                code: 'def dfs(node):\n    if not node:\n        return\n    # preorder\n    dfs(node.left)\n    # inorder\n    dfs(node.right)\n    # postorder\n'
            },
            {
                name: 'Sliding Window',
                code: 'def sliding_window(nums, k):\n    window = {}\n    left = 0\n    res = 0\n    for right in range(len(nums)):\n        window[nums[right]] = window.get(nums[right], 0) + 1\n        while len(window) > k:\n            window[nums[left]] -= 1\n            if window[nums[left]] == 0:\n                del window[nums[left]]\n            left += 1\n        res = max(res, right - left + 1)\n    return res\n'
            }
        ],
        cpp: [
            {
                name: 'Standard Headers',
                code: '#include <bits/stdc++.h>\nusing namespace std;\n'
            },
            {
                name: 'BFS Template',
                code: 'void bfs(vector<vector<int>>& graph, int start) {\n    vector<bool> visited(graph.size(), false);\n    queue<int> q;\n    q.push(start);\n    visited[start] = true;\n    while (!q.empty()) {\n        int node = q.front(); q.pop();\n        for (int neighbor : graph[node]) {\n            if (!visited[neighbor]) {\n                visited[neighbor] = true;\n                q.push(neighbor);\n            }\n        }\n    }\n}\n'
            },
            {
                name: 'Binary Search',
                code: 'int binarySearch(vector<int>& nums, int target) {\n    int lo = 0, hi = nums.size() - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}\n'
            }
        ],
        java: [
            {
                name: 'Standard Imports',
                code: 'import java.util.*;\nimport java.util.stream.*;\n'
            },
            {
                name: 'BFS Template',
                code: 'void bfs(Map<Integer, List<Integer>> graph, int start) {\n    Set<Integer> visited = new HashSet<>();\n    Queue<Integer> queue = new LinkedList<>();\n    queue.add(start);\n    visited.add(start);\n    while (!queue.isEmpty()) {\n        int node = queue.poll();\n        for (int neighbor : graph.getOrDefault(node, new ArrayList<>())) {\n            if (!visited.contains(neighbor)) {\n                visited.add(neighbor);\n                queue.add(neighbor);\n            }\n        }\n    }\n}\n'
            }
        ],
        javascript: [
            {
                name: 'Standard Template',
                code: '/**\n * @param {number[]} nums\n * @return {number}\n */\nvar solve = function(nums) {\n    \n};\n'
            },
            {
                name: 'BFS Template',
                code: 'function bfs(graph, start) {\n    const visited = new Set([start]);\n    const queue = [start];\n    while (queue.length) {\n        const node = queue.shift();\n        for (const neighbor of (graph[node] || [])) {\n            if (!visited.has(neighbor)) {\n                visited.add(neighbor);\n                queue.push(neighbor);\n            }\n        }\n    }\n}\n'
            }
        ]
    },

    modal: null,

    init: function () {
        // Build modal DOM
        const modal = document.createElement('div');
        modal.id = 'lc-templates-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div id="lc-templates-panel">
                <div id="lc-templates-header">
                    <span>⚡ Code Templates</span>
                    <button id="lc-templates-close">✕</button>
                </div>
                <div id="lc-templates-list"></div>
            </div>`;
        document.body.appendChild(modal);
        this.modal = modal;

        document.getElementById('lc-templates-close').addEventListener('click', () => this.hide());
        modal.addEventListener('click', (e) => { if (e.target === modal) this.hide(); });

        // Hotkey: Ctrl+Shift+T
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.open();
            }
        });
    },

    open: function () {
        const lang = (window.LCExtension && window.LCExtension.language) || 'python';
        const list = document.getElementById('lc-templates-list');
        list.innerHTML = '';

        const templates = this.templates[lang] || this.templates['python'];
        templates.forEach((tpl, i) => {
            const item = document.createElement('div');
            item.className = 'lc-tpl-item';
            item.innerHTML = `
                <div class="lc-tpl-name">${tpl.name}</div>
                <pre class="lc-tpl-preview">${this._escapeHtml(tpl.code.slice(0, 120))}${tpl.code.length > 120 ? '…' : ''}</pre>
                <button class="lc-tpl-insert-btn">Insert ↵</button>`;
            item.querySelector('.lc-tpl-insert-btn').addEventListener('click', () => {
                this.insert(tpl.code);
                this.hide();
            });
            list.appendChild(item);
        });

        this.modal.style.display = 'flex';
    },

    hide: function () {
        if (this.modal) this.modal.style.display = 'none';
    },

    insert: function (code) {
        // Fire a postMessage to monaco-hook to insert at cursor
        window.postMessage({
            source: 'lc-intellisense',
            type:   'INSERT_TEXT',
            payload: { text: code }
        }, '*');
    },

    _escapeHtml: function (str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
};
