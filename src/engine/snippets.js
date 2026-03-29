window.LCSnippets = {
    snippets: {
        python: [
            { label: 'bfs', kind: 'snippet', detail: 'BFS Queue Template', insertText: 'queue = collections.deque([start_node])\nwhile queue:\n    node = queue.popleft()\n    # process node\n    for neighbor in get_neighbors(node):\n        queue.append(neighbor)\n' },
            { label: 'dfs', kind: 'snippet', detail: 'DFS Recursive', insertText: 'def dfs(node):\n    if not node:\n        return\n    # process node\n    for neighbor in get_neighbors(node):\n        dfs(neighbor)\n' },
            { label: 'binary_search', kind: 'snippet', detail: 'Binary Search Template', insertText: 'l, r = 0, len(arr) - 1\nwhile l <= r:\n    mid = (l + r) // 2\n    if arr[mid] == target:\n        return mid\n    elif arr[mid] < target:\n        l = mid + 1\n    else:\n        r = mid - 1\nreturn -1\n' },
            { label: 'sliding_window', kind: 'snippet', detail: 'Sliding Window', insertText: 'l = 0\nfor r in range(len(arr)):\n    # add arr[r] to window\n    while invalid():\n        # remove arr[l] from window\n        l += 1\n    # update ans\n' }
        ],
        java: [
            { label: 'bfs', kind: 'snippet', detail: 'BFS Template', insertText: 'Queue<TreeNode> queue = new LinkedList<>();\nqueue.offer(root);\nwhile(!queue.isEmpty()) {\n    TreeNode node = queue.poll();\n    // process\n    if(node.left != null) queue.offer(node.left);\n    if(node.right != null) queue.offer(node.right);\n}\n' },
            { label: 'binary_search', kind: 'snippet', detail: 'Binary Search', insertText: 'int l = 0, r = arr.length - 1;\nwhile (l <= r) {\n    int mid = l + (r - l) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) l = mid + 1;\n    else r = mid - 1;\n}\nreturn -1;\n' }
        ],
        cpp: [
            { label: 'bfs', kind: 'snippet', detail: 'BFS Template', insertText: 'queue<TreeNode*> q;\nq.push(root);\nwhile(!q.empty()) {\n    TreeNode* node = q.front();\n    q.pop();\n    if(node->left) q.push(node->left);\n    if(node->right) q.push(node->right);\n}\n' },
            { label: 'for_each', kind: 'snippet', detail: 'Range for loop', insertText: 'for(auto& x : arr) {\n    \n}\n' }
        ],
        javascript: [
            { label: 'bfs', kind: 'snippet', detail: 'BFS Template', insertText: 'const queue = [root];\nwhile(queue.length > 0) {\n    const node = queue.shift();\n    // process\n    if(node.left) queue.push(node.left);\n    if(node.right) queue.push(node.right);\n}\n' }
        ]
    },
    
    getSnippets: function(token, lang) {
        if (!token || token.length < 2) return [];
        const langs = this.snippets[lang] || [];
        // Support JS/TS sharing snippets
        if (lang === 'typescript' && !this.snippets['typescript']) return this.snippets['javascript'];
        return langs; // Exact filtering happens in core.js
    }
};
