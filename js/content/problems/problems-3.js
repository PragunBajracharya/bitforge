/* ===== Problems batch 3: Trees, Heap / Priority Queue ===== */

P({n:226,s:'invert-binary-tree',t:'Invert Binary Tree',c:'trees',d:'Easy',rel:['traversals'],
 sum:'Mirror a binary tree: swap the left and right children of every node.',
 ex:'[4, 2, 7, 1, 3, 6, 9] → [4, 7, 2, 9, 6, 3, 1]',
 h:['Every node needs the same operation.','Swap the children of the current node, then recurse into both.','Any traversal order works: preorder, postorder or BFS.'],
 app:'Recursively: for a non-null node, swap its left and right subtrees, inverting each of them. The base case is an empty tree. Each node is visited once.',
 tc:'O(n)',sc:'O(h) recursion',
 py:`class Solution:
    def invertTree(self, root):
        if root:
            root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root`,
 js:`function invertTree(root) {
  if (root) [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}`,
 java:`class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        root.left = invertTree(root.right);
        root.right = left;
        return root;
    }
}`,
 cpp:`class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        swap(root->left, root->right);
        invertTree(root->left);
        invertTree(root->right);
        return root;
    }
};`});

P({n:104,s:'maximum-depth-of-binary-tree',t:'Maximum Depth of Binary Tree',c:'trees',d:'Easy',rel:['recursion','traversals'],
 sum:'Return the number of nodes on the longest path from the root down to a leaf.',
 ex:'[3, 9, 20, null, null, 15, 7] → 3',
 h:['An empty tree has depth 0.','A tree’s depth is 1 + the deeper of its two subtrees.','Alternatively, count the levels in a BFS.'],
 app:'Recursive post-order: depth(node) = 0 if null, else 1 + max(depth(left), depth(right)). BFS counting levels gives the same answer without recursion.',
 tc:'O(n)',sc:'O(h)',
 py:`class Solution:
    def maxDepth(self, root) -> int:
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
 js:`function maxDepth(root) {
  return root ? 1 + Math.max(maxDepth(root.left), maxDepth(root.right)) : 0;
}`,
 java:`class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}`,
 cpp:`class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`});

P({n:543,s:'diameter-of-binary-tree',t:'Diameter of Binary Tree',c:'trees',d:'Easy',rel:['traversals'],
 sum:'Return the number of edges on the longest path between any two nodes. The path doesn’t have to pass through the root.',
 ex:'[1, 2, 3, 4, 5] → 3 (path 4 → 2 → 1 → 3)',
 h:['Every path has a highest node where it turns.','The longest path turning at a node uses height(left) + height(right) edges.','Compute heights bottom-up and update a global best at each node.'],
 app:'Do a post-order traversal that returns each subtree’s height (in nodes). At each node, left height + right height is the longest path bending there; keep the maximum. Return 1 + max(left, right) upward.',
 tc:'O(n)',sc:'O(h)',
 py:`class Solution:
    def diameterOfBinaryTree(self, root) -> int:
        best = 0

        def height(node):
            nonlocal best
            if not node:
                return 0
            l, r = height(node.left), height(node.right)
            best = max(best, l + r)          # longest path bending here
            return 1 + max(l, r)

        height(root)
        return best`,
 js:`function diameterOfBinaryTree(root) {
  let best = 0;
  const height = node => {
    if (!node) return 0;
    const l = height(node.left), r = height(node.right);
    best = Math.max(best, l + r);
    return 1 + Math.max(l, r);
  };
  height(root);
  return best;
}`,
 java:`class Solution {
    private int best = 0;

    public int diameterOfBinaryTree(TreeNode root) {
        height(root);
        return best;
    }

    private int height(TreeNode node) {
        if (node == null) return 0;
        int l = height(node.left), r = height(node.right);
        best = Math.max(best, l + r);
        return 1 + Math.max(l, r);
    }
}`,
 cpp:`class Solution {
    int best = 0;
    int height(TreeNode* node) {
        if (!node) return 0;
        int l = height(node->left), r = height(node->right);
        best = max(best, l + r);
        return 1 + max(l, r);
    }
public:
    int diameterOfBinaryTree(TreeNode* root) {
        height(root);
        return best;
    }
};`});

P({n:110,s:'balanced-binary-tree',t:'Balanced Binary Tree',c:'trees',d:'Easy',rel:['traversals'],
 sum:'A tree is height-balanced if, at every node, the heights of the two subtrees differ by at most 1. Decide whether the tree is balanced.',
 ex:'[3, 9, 20, null, null, 15, 7] → true',
 h:['Checking balance at each node with a separate height call is O(n²).','Compute height and balance in the same post-order pass.','Return −1 as a height to signal “already unbalanced” and stop early.'],
 app:'A helper returns the subtree height, or −1 if any part of it is unbalanced. At each node, if either child returned −1 or their heights differ by more than 1, return −1; otherwise return 1 + max. The tree is balanced if the root’s result isn’t −1.',
 tc:'O(n)',sc:'O(h)',
 py:`class Solution:
    def isBalanced(self, root) -> bool:
        def height(node):                  # -1 means "unbalanced"
            if not node:
                return 0
            l, r = height(node.left), height(node.right)
            if l < 0 or r < 0 or abs(l - r) > 1:
                return -1
            return 1 + max(l, r)

        return height(root) >= 0`,
 js:`function isBalanced(root) {
  const height = node => {                 // -1 means "unbalanced"
    if (!node) return 0;
    const l = height(node.left), r = height(node.right);
    if (l < 0 || r < 0 || Math.abs(l - r) > 1) return -1;
    return 1 + Math.max(l, r);
  };
  return height(root) >= 0;
}`,
 java:`class Solution {
    public boolean isBalanced(TreeNode root) {
        return height(root) >= 0;
    }

    private int height(TreeNode node) {       // -1 means "unbalanced"
        if (node == null) return 0;
        int l = height(node.left), r = height(node.right);
        if (l < 0 || r < 0 || Math.abs(l - r) > 1) return -1;
        return 1 + Math.max(l, r);
    }
}`,
 cpp:`class Solution {
    int height(TreeNode* node) {              // -1 means "unbalanced"
        if (!node) return 0;
        int l = height(node->left), r = height(node->right);
        if (l < 0 || r < 0 || abs(l - r) > 1) return -1;
        return 1 + max(l, r);
    }
public:
    bool isBalanced(TreeNode* root) { return height(root) >= 0; }
};`});

P({n:100,s:'same-tree',t:'Same Tree',c:'trees',d:'Easy',rel:['traversals'],
 sum:'Decide whether two binary trees have the same shape and the same values at every node.',
 ex:'[1, 2, 3] and [1, 2, 3] → true · [1, 2] and [1, null, 2] → false',
 h:['Two empty trees are the same.','If exactly one is empty, or the root values differ, they are different.','Otherwise compare left with left and right with right, recursively.'],
 app:'Recurse on both trees in lockstep. Return true when both nodes are null, false when only one is null or values differ, and otherwise the AND of the comparisons of both subtrees.',
 tc:'O(min(m, n))',sc:'O(h)',
 py:`class Solution:
    def isSameTree(self, p, q) -> bool:
        if not p or not q:
            return p is q                   # both None -> True
        return (p.val == q.val
                and self.isSameTree(p.left, q.left)
                and self.isSameTree(p.right, q.right))`,
 js:`function isSameTree(p, q) {
  if (!p || !q) return p === q;
  return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
 java:`class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null || q == null) return p == q;
        return p.val == q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }
}`,
 cpp:`class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p || !q) return p == q;
        return p->val == q->val && isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};`});

P({n:572,s:'subtree-of-another-tree',t:'Subtree of Another Tree',c:'trees',d:'Easy',rel:['traversals'],
 sum:'Decide whether subRoot appears inside root as a complete subtree: some node of root together with all of its descendants.',
 ex:'root [3, 4, 5, 1, 2], subRoot [4, 1, 2] → true',
 h:['Reuse the Same Tree check.','Try every node of root as a possible match.','An empty subRoot is always a subtree; an empty root (with non-empty subRoot) never contains it.'],
 app:'Traverse root. At each node, test whether the tree rooted there is identical to subRoot using the Same Tree function. Return true at the first match. Serializing both trees and doing string matching (e.g. KMP) gives an O(m + n) alternative.',
 tc:'O(m · n)',sc:'O(h)',
 py:`class Solution:
    def isSubtree(self, root, subRoot) -> bool:
        def same(a, b):
            if not a or not b:
                return a is b
            return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)

        if not root:
            return subRoot is None
        return same(root, subRoot) or self.isSubtree(root.left, subRoot) or self.isSubtree(root.right, subRoot)`,
 js:`function isSubtree(root, subRoot) {
  const same = (a, b) => (!a || !b ? a === b : a.val === b.val && same(a.left, b.left) && same(a.right, b.right));
  if (!root) return subRoot === null;
  return same(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}`,
 java:`class Solution {
    public boolean isSubtree(TreeNode root, TreeNode subRoot) {
        if (root == null) return subRoot == null;
        return same(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
    }

    private boolean same(TreeNode a, TreeNode b) {
        if (a == null || b == null) return a == b;
        return a.val == b.val && same(a.left, b.left) && same(a.right, b.right);
    }
}`,
 cpp:`class Solution {
    bool same(TreeNode* a, TreeNode* b) {
        if (!a || !b) return a == b;
        return a->val == b->val && same(a->left, b->left) && same(a->right, b->right);
    }
public:
    bool isSubtree(TreeNode* root, TreeNode* subRoot) {
        if (!root) return subRoot == nullptr;
        return same(root, subRoot) || isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
    }
};`});

P({n:235,s:'lowest-common-ancestor-of-a-binary-search-tree',t:'Lowest Common Ancestor of a BST',c:'trees',d:'Medium',rel:['bst'],
 sum:'In a binary search tree, find the deepest node that has both p and q as descendants (a node counts as its own descendant).',
 ex:'BST [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 8 → 6',
 h:['Use the BST ordering instead of searching both subtrees.','If both values are smaller than the current node, the answer is in the left subtree; if both are larger, the right.','Otherwise p and q split here (or one of them is here), so this node is the answer.'],
 app:'Start at the root. While both p and q are on the same side of the current node, step to that side. The first node where they fall on different sides (or that equals one of them) is the lowest common ancestor.',
 tc:'O(h)',sc:'O(1)',
 py:`class Solution:
    def lowestCommonAncestor(self, root, p, q):
        node = root
        while node:
            if p.val < node.val and q.val < node.val:
                node = node.left
            elif p.val > node.val and q.val > node.val:
                node = node.right
            else:
                return node             # p and q split here`,
 js:`function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node) {
    if (p.val < node.val && q.val < node.val) node = node.left;
    else if (p.val > node.val && q.val > node.val) node = node.right;
    else return node;
  }
  return null;
}`,
 java:`class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        TreeNode node = root;
        while (node != null) {
            if (p.val < node.val && q.val < node.val) node = node.left;
            else if (p.val > node.val && q.val > node.val) node = node.right;
            else return node;
        }
        return null;
    }
}`,
 cpp:`class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        TreeNode* node = root;
        while (node) {
            if (p->val < node->val && q->val < node->val) node = node->left;
            else if (p->val > node->val && q->val > node->val) node = node->right;
            else return node;
        }
        return nullptr;
    }
};`});

P({n:102,s:'binary-tree-level-order-traversal',t:'Binary Tree Level Order Traversal',c:'trees',d:'Medium',rel:['bfs','traversals'],
 sum:'Return the node values level by level, from top to bottom, left to right within each level.',
 ex:'[3, 9, 20, null, null, 15, 7] → [[3], [9, 20], [15, 7]]',
 h:['Levels mean breadth-first search.','A queue alone mixes levels together.','Before processing a level, read the queue size: exactly that many nodes belong to it.'],
 app:'BFS with a queue. For each round, record the current queue length, pop that many nodes, collecting their values into one list and pushing their children. Each round produces one level.',
 tc:'O(n)',sc:'O(w) (widest level)',
 py:`from collections import deque

class Solution:
    def levelOrder(self, root) -> list[list[int]]:
        res, q = [], deque([root] if root else [])
        while q:
            level = []
            for _ in range(len(q)):         # exactly the nodes of this level
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level)
        return res`,
 js:`function levelOrder(root) {
  const res = [];
  let level = root ? [root] : [];
  while (level.length) {
    res.push(level.map(n => n.val));
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return res;
}`,
 java:`class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        Deque<TreeNode> q = new ArrayDeque<>();
        if (root != null) q.add(root);
        while (!q.isEmpty()) {
            List<Integer> level = new ArrayList<>();
            for (int i = q.size(); i > 0; i--) {
                TreeNode n = q.poll();
                level.add(n.val);
                if (n.left != null) q.add(n.left);
                if (n.right != null) q.add(n.right);
            }
            res.add(level);
        }
        return res;
    }
}`,
 cpp:`class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> res;
        queue<TreeNode*> q;
        if (root) q.push(root);
        while (!q.empty()) {
            vector<int> level;
            for (int i = q.size(); i > 0; i--) {
                TreeNode* n = q.front(); q.pop();
                level.push_back(n->val);
                if (n->left) q.push(n->left);
                if (n->right) q.push(n->right);
            }
            res.push_back(level);
        }
        return res;
    }
};`});

P({n:199,s:'binary-tree-right-side-view',t:'Binary Tree Right Side View',c:'trees',d:'Medium',rel:['bfs'],
 sum:'Imagine standing to the right of the tree. Return the values you can see, from top to bottom.',
 ex:'[1, 2, 3, null, 5, null, 4] → [1, 3, 4]',
 h:['You see exactly one node per level.','It is the last node of each level in left-to-right order.','Level-order BFS, keeping the last value of each level.'],
 app:'Run a level-by-level BFS and append the value of the final node processed in each level. A DFS that visits right children first and records the first node seen at each new depth works too.',
 tc:'O(n)',sc:'O(w)',
 py:`from collections import deque

class Solution:
    def rightSideView(self, root) -> list[int]:
        res, q = [], deque([root] if root else [])
        while q:
            for _ in range(len(q)):
                node = q.popleft()
                last = node.val
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(last)               # the rightmost node of this level
        return res`,
 js:`function rightSideView(root) {
  const res = [];
  let level = root ? [root] : [];
  while (level.length) {
    res.push(level[level.length - 1].val);   // rightmost node of this level
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return res;
}`,
 java:`class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        Deque<TreeNode> q = new ArrayDeque<>();
        if (root != null) q.add(root);
        while (!q.isEmpty()) {
            int last = 0;
            for (int i = q.size(); i > 0; i--) {
                TreeNode n = q.poll();
                last = n.val;
                if (n.left != null) q.add(n.left);
                if (n.right != null) q.add(n.right);
            }
            res.add(last);
        }
        return res;
    }
}`,
 cpp:`class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> res;
        queue<TreeNode*> q;
        if (root) q.push(root);
        while (!q.empty()) {
            int last = 0;
            for (int i = q.size(); i > 0; i--) {
                TreeNode* n = q.front(); q.pop();
                last = n->val;
                if (n->left) q.push(n->left);
                if (n->right) q.push(n->right);
            }
            res.push_back(last);
        }
        return res;
    }
};`});

P({n:1448,s:'count-good-nodes-in-binary-tree',t:'Count Good Nodes in Binary Tree',c:'trees',d:'Medium',rel:['dfs'],
 sum:'A node is “good” if no node on the path from the root to it has a larger value. Count the good nodes.',
 ex:'[3, 1, 4, 3, null, 1, 5] → 4',
 h:['Whether a node is good depends only on the maximum value above it.','Pass that maximum down as you recurse.','Count the node if its value ≥ the maximum so far, then update the maximum for its children.'],
 app:'DFS from the root carrying maxSoFar. A node is good when node.val ≥ maxSoFar. Recurse into both children with max(maxSoFar, node.val) and sum the counts.',
 tc:'O(n)',sc:'O(h)',
 py:`class Solution:
    def goodNodes(self, root) -> int:
        def dfs(node, best):
            if not node:
                return 0
            good = 1 if node.val >= best else 0
            best = max(best, node.val)
            return good + dfs(node.left, best) + dfs(node.right, best)

        return dfs(root, root.val)`,
 js:`function goodNodes(root) {
  const dfs = (node, best) => {
    if (!node) return 0;
    const good = node.val >= best ? 1 : 0;
    best = Math.max(best, node.val);
    return good + dfs(node.left, best) + dfs(node.right, best);
  };
  return dfs(root, root.val);
}`,
 java:`class Solution {
    public int goodNodes(TreeNode root) {
        return dfs(root, root.val);
    }

    private int dfs(TreeNode node, int best) {
        if (node == null) return 0;
        int good = node.val >= best ? 1 : 0;
        best = Math.max(best, node.val);
        return good + dfs(node.left, best) + dfs(node.right, best);
    }
}`,
 cpp:`class Solution {
    int dfs(TreeNode* node, int best) {
        if (!node) return 0;
        int good = node->val >= best ? 1 : 0;
        best = max(best, node->val);
        return good + dfs(node->left, best) + dfs(node->right, best);
    }
public:
    int goodNodes(TreeNode* root) { return dfs(root, root->val); }
};`});

P({n:98,s:'validate-binary-search-tree',t:'Validate Binary Search Tree',c:'trees',d:'Medium',rel:['bst','traversals'],
 sum:'Decide whether a binary tree is a valid BST: every node in a left subtree is smaller than its ancestor, and every node in a right subtree is larger.',
 ex:'[2, 1, 3] → true · [5, 1, 4, null, null, 3, 6] → false',
 h:['Comparing a node only with its children is not enough.','Each node must fit within a range inherited from all its ancestors.','Pass (low, high) bounds down: the left child gets (low, node.val), the right child gets (node.val, high).'],
 app:'Recurse with an open interval (low, high), starting at (−∞, +∞). A node outside its interval breaks the BST property. Narrow the interval when descending. An inorder traversal that checks values are strictly increasing works too.',
 tc:'O(n)',sc:'O(h)',
 py:`class Solution:
    def isValidBST(self, root) -> bool:
        def ok(node, low, high):
            if not node:
                return True
            if not (low < node.val < high):
                return False
            return ok(node.left, low, node.val) and ok(node.right, node.val, high)

        return ok(root, float("-inf"), float("inf"))`,
 js:`function isValidBST(root) {
  const ok = (node, low, high) =>
    !node || (low < node.val && node.val < high && ok(node.left, low, node.val) && ok(node.right, node.val, high));
  return ok(root, -Infinity, Infinity);
}`,
 java:`class Solution {
    public boolean isValidBST(TreeNode root) {
        return ok(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean ok(TreeNode node, long low, long high) {
        if (node == null) return true;
        if (node.val <= low || node.val >= high) return false;
        return ok(node.left, low, node.val) && ok(node.right, node.val, high);
    }
}`,
 cpp:`class Solution {
    bool ok(TreeNode* node, long long low, long long high) {
        if (!node) return true;
        if (node->val <= low || node->val >= high) return false;
        return ok(node->left, low, node->val) && ok(node->right, node->val, high);
    }
public:
    bool isValidBST(TreeNode* root) { return ok(root, LLONG_MIN, LLONG_MAX); }
};`});

P({n:230,s:'kth-smallest-element-in-a-bst',t:'Kth Smallest Element in a BST',c:'trees',d:'Medium',rel:['bst','traversals'],
 sum:'Return the k-th smallest value (1-indexed) in a binary search tree.',
 ex:'[5, 3, 6, 2, 4, null, null, 1], k = 3 → 3',
 h:['An inorder traversal of a BST visits values in increasing order.','You don’t need to visit the whole tree: stop after k values.','An iterative inorder traversal with a stack makes stopping early easy.'],
 app:'Do an iterative inorder traversal: push left children onto a stack until null, pop a node (the next smallest), count it, and move to its right child. When the count reaches k, return that node’s value.',
 tc:'O(h + k)',sc:'O(h)',
 py:`class Solution:
    def kthSmallest(self, root, k: int) -> int:
        stack, node = [], root
        while True:
            while node:                     # go as far left as possible
                stack.append(node)
                node = node.left
            node = stack.pop()              # next smallest value
            k -= 1
            if k == 0:
                return node.val
            node = node.right`,
 js:`function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  for (;;) {
    while (node) { stack.push(node); node = node.left; }
    node = stack.pop();
    if (--k === 0) return node.val;
    node = node.right;
  }
}`,
 java:`class Solution {
    public int kthSmallest(TreeNode root, int k) {
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode node = root;
        while (true) {
            while (node != null) { stack.push(node); node = node.left; }
            node = stack.pop();
            if (--k == 0) return node.val;
            node = node.right;
        }
    }
}`,
 cpp:`class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        stack<TreeNode*> st;
        TreeNode* node = root;
        while (true) {
            while (node) { st.push(node); node = node->left; }
            node = st.top(); st.pop();
            if (--k == 0) return node->val;
            node = node->right;
        }
    }
};`});

P({n:105,s:'construct-binary-tree-from-preorder-and-inorder-traversal',t:'Construct Binary Tree from Preorder and Inorder Traversal',c:'trees',d:'Medium',rel:['traversals'],
 sum:'Rebuild the unique binary tree (with distinct values) that produced the given preorder and inorder traversals.',
 ex:'preorder [3, 9, 20, 15, 7], inorder [9, 3, 15, 20, 7] → [3, 9, 20, null, null, 15, 7]',
 h:['The first preorder value is the root.','In the inorder list, everything left of the root belongs to the left subtree, everything right to the right subtree.','Use a hash map from value to inorder index so splitting is O(1).'],
 app:'Consume preorder values in order with a shared pointer. build(lo, hi) takes the next preorder value as the root, finds its index mid in inorder, then builds the left subtree from inorder[lo..mid−1] and the right from inorder[mid+1..hi]. The left subtree must be built first because preorder lists it first.',
 tc:'O(n)',sc:'O(n)',
 py:`class Solution:
    def buildTree(self, preorder: list[int], inorder: list[int]):
        index = {v: i for i, v in enumerate(inorder)}
        it = iter(preorder)

        def build(lo, hi):                   # subtree covering inorder[lo..hi]
            if lo > hi:
                return None
            val = next(it)                   # next preorder value is this subtree's root
            root = TreeNode(val)
            mid = index[val]
            root.left = build(lo, mid - 1)
            root.right = build(mid + 1, hi)
            return root

        return build(0, len(inorder) - 1)`,
 js:`function buildTree(preorder, inorder) {
  const index = new Map(inorder.map((v, i) => [v, i]));
  let p = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const root = new TreeNode(preorder[p++]);
    const mid = index.get(root.val);
    root.left = build(lo, mid - 1);
    root.right = build(mid + 1, hi);
    return root;
  };
  return build(0, inorder.length - 1);
}`,
 java:`class Solution {
    private int p = 0;
    private int[] preorder;
    private final Map<Integer, Integer> index = new HashMap<>();

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        this.preorder = preorder;
        for (int i = 0; i < inorder.length; i++) index.put(inorder[i], i);
        return build(0, inorder.length - 1);
    }

    private TreeNode build(int lo, int hi) {
        if (lo > hi) return null;
        TreeNode root = new TreeNode(preorder[p++]);
        int mid = index.get(root.val);
        root.left = build(lo, mid - 1);
        root.right = build(mid + 1, hi);
        return root;
    }
}`,
 cpp:`class Solution {
    int p = 0;
    unordered_map<int, int> index;
    TreeNode* build(vector<int>& preorder, int lo, int hi) {
        if (lo > hi) return nullptr;
        TreeNode* root = new TreeNode(preorder[p++]);
        int mid = index[root->val];
        root->left = build(preorder, lo, mid - 1);
        root->right = build(preorder, mid + 1, hi);
        return root;
    }
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        for (int i = 0; i < (int)inorder.size(); i++) index[inorder[i]] = i;
        return build(preorder, 0, inorder.size() - 1);
    }
};`});

P({n:124,s:'binary-tree-maximum-path-sum',t:'Binary Tree Maximum Path Sum',c:'trees',d:'Hard',rel:['dfs'],
 sum:'A path is any sequence of connected nodes, each used at most once; it doesn’t need to pass through the root. Return the largest sum of values along any non-empty path.',
 ex:'[−10, 9, 20, null, null, 15, 7] → 42 (15 → 20 → 7)',
 h:['Every path has a highest node where it may bend.','At a node, the best path bending there is node.val + best downward gain from the left + from the right.','A negative gain hurts, so clamp it to 0. Return only one side upward, because a path passed to the parent can’t fork.'],
 app:'Post-order DFS returning the best “downward” sum starting at each node: node.val + max(0, leftGain, rightGain). At each node also consider the bending path node.val + max(0, leftGain) + max(0, rightGain) and keep the global maximum. Start the maximum at −∞ so all-negative trees work.',
 tc:'O(n)',sc:'O(h)',
 py:`class Solution:
    def maxPathSum(self, root) -> int:
        best = float("-inf")

        def gain(node):
            nonlocal best
            if not node:
                return 0
            l = max(gain(node.left), 0)          # drop negative branches
            r = max(gain(node.right), 0)
            best = max(best, node.val + l + r)   # path bending at this node
            return node.val + max(l, r)          # only one side can go upward

        gain(root)
        return best`,
 js:`function maxPathSum(root) {
  let best = -Infinity;
  const gain = node => {
    if (!node) return 0;
    const l = Math.max(gain(node.left), 0), r = Math.max(gain(node.right), 0);
    best = Math.max(best, node.val + l + r);
    return node.val + Math.max(l, r);
  };
  gain(root);
  return best;
}`,
 java:`class Solution {
    private int best = Integer.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        gain(root);
        return best;
    }

    private int gain(TreeNode node) {
        if (node == null) return 0;
        int l = Math.max(gain(node.left), 0), r = Math.max(gain(node.right), 0);
        best = Math.max(best, node.val + l + r);
        return node.val + Math.max(l, r);
    }
}`,
 cpp:`class Solution {
    int best = INT_MIN;
    int gain(TreeNode* node) {
        if (!node) return 0;
        int l = max(gain(node->left), 0), r = max(gain(node->right), 0);
        best = max(best, node->val + l + r);
        return node->val + max(l, r);
    }
public:
    int maxPathSum(TreeNode* root) {
        gain(root);
        return best;
    }
};`});

P({n:297,s:'serialize-and-deserialize-binary-tree',t:'Serialize and Deserialize Binary Tree',c:'trees',d:'Hard',rel:['traversals'],
 sum:'Design a way to turn a binary tree into a string and back, recovering exactly the same tree.',
 ex:'[1, 2, 3, null, null, 4, 5] → "1,2,#,#,3,4,#,#,5,#,#" → the same tree',
 h:['A traversal alone is ambiguous unless you also record where the nulls are.','Preorder with a marker such as "#" for every null child is enough to rebuild the tree.','Deserialize by consuming tokens in the same preorder: read a value, build the left subtree, then the right.'],
 app:'Serialize with preorder DFS, writing each value and a "#" for each null pointer, separated by commas. Deserialize with a recursive function that reads the next token: "#" returns null; otherwise create the node and recursively read its left and right subtrees. Level-order with null markers also works.',
 tc:'O(n)',sc:'O(n)',
 py:`class Codec:
    def serialize(self, root) -> str:
        out = []

        def dfs(node):
            if not node:
                out.append("#")
                return
            out.append(str(node.val))
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return ",".join(out)

    def deserialize(self, data: str):
        tokens = iter(data.split(","))

        def build():
            v = next(tokens)
            if v == "#":
                return None
            node = TreeNode(int(v))
            node.left = build()
            node.right = build()
            return node

        return build()`,
 js:`function serialize(root) {
  const out = [];
  const dfs = node => {
    if (!node) { out.push("#"); return; }
    out.push(node.val);
    dfs(node.left);
    dfs(node.right);
  };
  dfs(root);
  return out.join(",");
}

function deserialize(data) {
  const tokens = data.split(",");
  let i = 0;
  const build = () => {
    const v = tokens[i++];
    if (v === "#") return null;
    const node = new TreeNode(Number(v));
    node.left = build();
    node.right = build();
    return node;
  };
  return build();
}`,
 java:`public class Codec {
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        dfs(root, sb);
        return sb.toString();
    }

    private void dfs(TreeNode node, StringBuilder sb) {
        if (sb.length() > 0) sb.append(',');
        if (node == null) { sb.append('#'); return; }
        sb.append(node.val);
        dfs(node.left, sb);
        dfs(node.right, sb);
    }

    private int pos;

    public TreeNode deserialize(String data) {
        pos = 0;
        return build(data.split(","));
    }

    private TreeNode build(String[] tokens) {
        String v = tokens[pos++];
        if (v.equals("#")) return null;
        TreeNode node = new TreeNode(Integer.parseInt(v));
        node.left = build(tokens);
        node.right = build(tokens);
        return node;
    }
}`,
 cpp:`class Codec {
    void dfs(TreeNode* node, string& out) {
        if (!out.empty()) out += ',';
        if (!node) { out += '#'; return; }
        out += to_string(node->val);
        dfs(node->left, out);
        dfs(node->right, out);
    }
    TreeNode* build(istringstream& in) {
        string v;
        getline(in, v, ',');
        if (v == "#") return nullptr;
        TreeNode* node = new TreeNode(stoi(v));
        node->left = build(in);
        node->right = build(in);
        return node;
    }
public:
    string serialize(TreeNode* root) {
        string out;
        dfs(root, out);
        return out;
    }
    TreeNode* deserialize(string data) {
        istringstream in(data);
        return build(in);
    }
};`});

/* ---------- Heap / Priority Queue ---------- */
P({n:703,s:'kth-largest-element-in-a-stream',t:'Kth Largest Element in a Stream',c:'heap',d:'Easy',rel:['binheap'],
 sum:'Design a class that receives numbers one at a time and, after each add, reports the k-th largest number seen so far.',
 ex:'k = 3, start [4, 5, 8, 2]; add 3 → 4, add 5 → 5, add 10 → 5, add 9 → 8',
 h:['Sorting after every insert is too slow.','You only care about the k largest values.','Keep a min-heap of size k; its top is the k-th largest.'],
 app:'Maintain a min-heap holding the k largest values seen. On add, push the value and, if the heap grows past k, pop the smallest. The heap’s minimum is then the k-th largest overall.',
 tc:'O(log k) per add',sc:'O(k)',
 py:`import heapq

class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap = []                       # min-heap of the k largest values
        for x in nums:
            self.add(x)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]`,
 js:JS_PQ+`class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = new Heap();                 // min-heap of the k largest values
    for (const x of nums) this.add(x);
  }
  add(val) {
    this.heap.push(val);
    if (this.heap.size > this.k) this.heap.pop();
    return this.heap.peek();
  }
}`,
 java:`class KthLargest {
    private final int k;
    private final PriorityQueue<Integer> heap = new PriorityQueue<>();   // min-heap

    public KthLargest(int k, int[] nums) {
        this.k = k;
        for (int x : nums) add(x);
    }

    public int add(int val) {
        heap.add(val);
        if (heap.size() > k) heap.poll();
        return heap.peek();
    }
}`,
 cpp:`class KthLargest {
    int k;
    priority_queue<int, vector<int>, greater<int>> heap;   // min-heap
public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int x : nums) add(x);
    }
    int add(int val) {
        heap.push(val);
        if ((int)heap.size() > k) heap.pop();
        return heap.top();
    }
};`});

P({n:1046,s:'last-stone-weight',t:'Last Stone Weight',c:'heap',d:'Easy',rel:['binheap'],
 sum:'Repeatedly smash the two heaviest stones. Equal stones both vanish; otherwise the lighter vanishes and the heavier shrinks by the lighter’s weight. Return the last stone’s weight, or 0.',
 ex:'[2, 7, 4, 1, 8, 1] → 1',
 h:['You need the two largest values over and over.','A max-heap gives the largest in O(log n).','In Python, heapq is a min-heap: store negated weights.'],
 app:'Put all weights in a max-heap. While at least two stones remain, pop the two largest y ≥ x; if they differ, push y − x. Return the remaining stone or 0.',
 tc:'O(n log n)',sc:'O(n)',
 py:`import heapq

class Solution:
    def lastStoneWeight(self, stones: list[int]) -> int:
        heap = [-s for s in stones]          # negate for a max-heap
        heapq.heapify(heap)
        while len(heap) > 1:
            y, x = -heapq.heappop(heap), -heapq.heappop(heap)
            if y != x:
                heapq.heappush(heap, -(y - x))
        return -heap[0] if heap else 0`,
 js:JS_PQ+`function lastStoneWeight(stones) {
  const heap = new Heap((a, b) => b - a);   // max-heap
  for (const s of stones) heap.push(s);
  while (heap.size > 1) {
    const y = heap.pop(), x = heap.pop();
    if (y !== x) heap.push(y - x);
  }
  return heap.size ? heap.peek() : 0;
}`,
 java:`class Solution {
    public int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        for (int s : stones) heap.add(s);
        while (heap.size() > 1) {
            int y = heap.poll(), x = heap.poll();
            if (y != x) heap.add(y - x);
        }
        return heap.isEmpty() ? 0 : heap.peek();
    }
}`,
 cpp:`class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        priority_queue<int> heap(stones.begin(), stones.end());   // max-heap
        while (heap.size() > 1) {
            int y = heap.top(); heap.pop();
            int x = heap.top(); heap.pop();
            if (y != x) heap.push(y - x);
        }
        return heap.empty() ? 0 : heap.top();
    }
};`});

P({n:973,s:'k-closest-points-to-origin',t:'K Closest Points to Origin',c:'heap',d:'Medium',rel:['binheap','quickselect'],
 sum:'Return the k points closest to (0, 0) by Euclidean distance, in any order.',
 ex:'[[1, 3], [−2, 2]], k = 1 → [[−2, 2]]',
 h:['Compare squared distances x² + y²; the square root doesn’t change the order.','Sorting all points is O(n log n).','A max-heap of size k keeps the k closest seen so far: O(n log k). Quickselect gives O(n) on average.'],
 app:'Push each point into a max-heap keyed by squared distance. When the heap exceeds k, pop the farthest. After all points, the heap holds the k closest. The JavaScript version uses the same idea with a small heap class.',
 tc:'O(n log k)',sc:'O(k)',
 py:`import heapq

class Solution:
    def kClosest(self, points: list[list[int]], k: int) -> list[list[int]]:
        heap = []                                     # max-heap via negated distance
        for x, y in points:
            heapq.heappush(heap, (-(x * x + y * y), x, y))
            if len(heap) > k:
                heapq.heappop(heap)                   # drop the farthest
        return [[x, y] for _, x, y in heap]`,
 js:JS_PQ+`function kClosest(points, k) {
  const d = p => p[0] * p[0] + p[1] * p[1];
  const heap = new Heap((a, b) => d(b) - d(a));     // max-heap by distance
  for (const p of points) {
    heap.push(p);
    if (heap.size > k) heap.pop();
  }
  return heap.a;
}`,
 java:`class Solution {
    public int[][] kClosest(int[][] points, int k) {
        PriorityQueue<int[]> heap = new PriorityQueue<>(
            (a, b) -> Integer.compare(b[0] * b[0] + b[1] * b[1], a[0] * a[0] + a[1] * a[1]));
        for (int[] p : points) {
            heap.add(p);
            if (heap.size() > k) heap.poll();
        }
        return heap.toArray(new int[0][]);
    }
}`,
 cpp:`class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        priority_queue<pair<int, int>> heap;            // (distance, index), max-heap
        for (int i = 0; i < (int)points.size(); i++) {
            heap.push({points[i][0] * points[i][0] + points[i][1] * points[i][1], i});
            if ((int)heap.size() > k) heap.pop();
        }
        vector<vector<int>> res;
        while (!heap.empty()) { res.push_back(points[heap.top().second]); heap.pop(); }
        return res;
    }
};`});

P({n:215,s:'kth-largest-element-in-an-array',t:'Kth Largest Element in an Array',c:'heap',d:'Medium',rel:['quickselect','binheap'],
 sum:'Return the k-th largest element of an unsorted array (the k-th in sorted descending order, counting duplicates).',
 ex:'[3, 2, 1, 5, 6, 4], k = 2 → 5',
 h:['Sorting works in O(n log n).','A min-heap of size k leaves the k-th largest at its top.','Quickselect finds it in O(n) on average.'],
 app:'Keep a min-heap of at most k elements while scanning; whenever it exceeds k, remove its minimum. The heap’s top is the answer. Quickselect, looking for index n − k in ascending order, avoids the log factor on average.',
 tc:'O(n log k)',sc:'O(k)',
 py:`import heapq

class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        heap = []
        for x in nums:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)        # keep only the k largest
        return heap[0]`,
 js:JS_PQ+`function findKthLargest(nums, k) {
  const heap = new Heap();               // min-heap of the k largest
  for (const x of nums) {
    heap.push(x);
    if (heap.size > k) heap.pop();
  }
  return heap.peek();
}`,
 java:`class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.add(x);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }
}`,
 cpp:`class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> heap;
        for (int x : nums) {
            heap.push(x);
            if ((int)heap.size() > k) heap.pop();
        }
        return heap.top();
    }
};`});

P({n:621,s:'task-scheduler',t:'Task Scheduler',c:'heap',d:'Medium',rel:['binheap','intervals'],
 sum:'Tasks are letters; each takes one time unit, and two runs of the same letter must be at least n units apart (idling is allowed). Return the minimum total time.',
 ex:'["A","A","A","B","B","B"], n = 2 → 8 (A B idle A B idle A B)',
 h:['The most frequent task dictates the schedule’s skeleton.','With maxCount copies of the top task, you get (maxCount − 1) full blocks of length n + 1, plus a final partial block.','The final block contains one slot per task tied for the maximum count. If there are many tasks, no idling is needed at all.'],
 app:'Count tasks. Let top be the highest count and numTop the number of tasks with that count. The skeleton needs (top − 1) · (n + 1) + numTop slots. If there are more tasks than that, they fill the gaps without idling, so the answer is max(len(tasks), skeleton). Simulating with a max-heap and a cooldown queue gives the same result in O(n log 26).',
 tc:'O(n)',sc:'O(26)',
 py:`class Solution:
    def leastInterval(self, tasks: list[str], n: int) -> int:
        counts = [0] * 26
        for t in tasks:
            counts[ord(t) - ord("A")] += 1
        top = max(counts)
        num_top = counts.count(top)              # tasks tied for the highest count
        return max(len(tasks), (top - 1) * (n + 1) + num_top)`,
 js:`function leastInterval(tasks, n) {
  const counts = new Array(26).fill(0);
  for (const t of tasks) counts[t.charCodeAt(0) - 65]++;
  const top = Math.max(...counts);
  const numTop = counts.filter(c => c === top).length;
  return Math.max(tasks.length, (top - 1) * (n + 1) + numTop);
}`,
 java:`class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] counts = new int[26];
        for (char t : tasks) counts[t - 'A']++;
        int top = 0, numTop = 0;
        for (int c : counts) top = Math.max(top, c);
        for (int c : counts) if (c == top) numTop++;
        return Math.max(tasks.length, (top - 1) * (n + 1) + numTop);
    }
}`,
 cpp:`class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        int counts[26] = {0};
        for (char t : tasks) counts[t - 'A']++;
        int top = *max_element(counts, counts + 26);
        int numTop = count(counts, counts + 26, top);
        return max((int)tasks.size(), (top - 1) * (n + 1) + numTop);
    }
};`});

P({n:355,s:'design-twitter',t:'Design Twitter',c:'heap',d:'Medium',rel:['binheap'],
 sum:'Design a tiny Twitter: users post tweets, follow and unfollow each other, and getNewsFeed returns the 10 most recent tweet IDs from the user and everyone they follow.',
 ex:'postTweet(1, 5); getNewsFeed(1) → [5]; follow(1, 2); postTweet(2, 6); getNewsFeed(1) → [6, 5]',
 h:['Stamp every tweet with a global, increasing time counter.','Only the 10 newest tweets of each followed user could appear in a feed.','Merge those candidates with a heap (or sort them) and take the newest 10.'],
 app:'Store each user’s tweets as a list of (time, id) and each user’s followees as a set. For a feed, gather the last 10 tweets of the user and each followee, then select the 10 with the largest timestamps. A heap that merges each list from its newest end is the scalable version of this.',
 tc:'getNewsFeed O(F · 10 · log), others O(1)',sc:'O(users + tweets + follows)',
 py:`import heapq
from collections import defaultdict

class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)          # user -> [(time, tweetId)]
        self.follows = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.time += 1
        self.tweets[userId].append((self.time, tweetId))

    def getNewsFeed(self, userId: int) -> list[int]:
        candidates = []
        for u in self.follows[userId] | {userId}:
            candidates.extend(self.tweets[u][-10:])   # only each user's 10 newest matter
        return [tid for _, tid in heapq.nlargest(10, candidates)]

    def follow(self, followerId: int, followeeId: int) -> None:
        if followerId != followeeId:
            self.follows[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.follows[followerId].discard(followeeId)`,
 js:`class Twitter {
  constructor() { this.time = 0; this.tweets = new Map(); this.follows = new Map(); }
  postTweet(userId, tweetId) {
    if (!this.tweets.has(userId)) this.tweets.set(userId, []);
    this.tweets.get(userId).push([++this.time, tweetId]);
  }
  getNewsFeed(userId) {
    const users = new Set(this.follows.get(userId) || []);
    users.add(userId);
    const candidates = [];
    for (const u of users) candidates.push(...(this.tweets.get(u) || []).slice(-10));
    return candidates.sort((a, b) => b[0] - a[0]).slice(0, 10).map(t => t[1]);
  }
  follow(followerId, followeeId) {
    if (followerId === followeeId) return;
    if (!this.follows.has(followerId)) this.follows.set(followerId, new Set());
    this.follows.get(followerId).add(followeeId);
  }
  unfollow(followerId, followeeId) {
    if (this.follows.has(followerId)) this.follows.get(followerId).delete(followeeId);
  }
}`,
 java:`class Twitter {
    private int time = 0;
    private final Map<Integer, List<int[]>> tweets = new HashMap<>();   // {time, id}
    private final Map<Integer, Set<Integer>> follows = new HashMap<>();

    public void postTweet(int userId, int tweetId) {
        tweets.computeIfAbsent(userId, k -> new ArrayList<>()).add(new int[]{++time, tweetId});
    }

    public List<Integer> getNewsFeed(int userId) {
        Set<Integer> users = new HashSet<>(follows.getOrDefault(userId, Set.of()));
        users.add(userId);
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> b[0] - a[0]);   // newest first
        for (int u : users) {
            List<int[]> list = tweets.getOrDefault(u, List.of());
            for (int i = Math.max(0, list.size() - 10); i < list.size(); i++) heap.add(list.get(i));
        }
        List<Integer> res = new ArrayList<>();
        while (!heap.isEmpty() && res.size() < 10) res.add(heap.poll()[1]);
        return res;
    }

    public void follow(int followerId, int followeeId) {
        if (followerId != followeeId) follows.computeIfAbsent(followerId, k -> new HashSet<>()).add(followeeId);
    }

    public void unfollow(int followerId, int followeeId) {
        Set<Integer> s = follows.get(followerId);
        if (s != null) s.remove(followeeId);
    }
}`,
 cpp:`class Twitter {
    int time = 0;
    unordered_map<int, vector<pair<int, int>>> tweets;   // user -> (time, id)
    unordered_map<int, unordered_set<int>> follows;
public:
    void postTweet(int userId, int tweetId) { tweets[userId].push_back({++time, tweetId}); }

    vector<int> getNewsFeed(int userId) {
        unordered_set<int> users = follows[userId];
        users.insert(userId);
        vector<pair<int, int>> candidates;
        for (int u : users) {
            auto& list = tweets[u];
            for (int i = max(0, (int)list.size() - 10); i < (int)list.size(); i++) candidates.push_back(list[i]);
        }
        sort(candidates.rbegin(), candidates.rend());        // newest first
        vector<int> res;
        for (int i = 0; i < (int)candidates.size() && i < 10; i++) res.push_back(candidates[i].second);
        return res;
    }

    void follow(int followerId, int followeeId) {
        if (followerId != followeeId) follows[followerId].insert(followeeId);
    }

    void unfollow(int followerId, int followeeId) { follows[followerId].erase(followeeId); }
};`});

P({n:295,s:'find-median-from-data-stream',t:'Find Median from Data Stream',c:'heap',d:'Hard',rel:['binheap'],
 sum:'Design a structure that accepts numbers one at a time and can report the median of all numbers so far at any moment.',
 ex:'add 1, add 2 → median 1.5; add 3 → median 2.0',
 h:['Keeping a sorted list costs O(n) per insert.','Split the numbers into a lower half and an upper half.','A max-heap for the lower half and a min-heap for the upper half expose the two middle values at their tops.'],
 app:'low is a max-heap of the smaller half; high is a min-heap of the larger half. To add, push into low, move low’s largest into high, and if high becomes bigger than low, move high’s smallest back. low then has the same size as high or one more. The median is low’s top (odd count) or the average of both tops (even count).',
 tc:'add O(log n), median O(1)',sc:'O(n)',
 py:`import heapq

class MedianFinder:
    def __init__(self):
        self.low = []       # max-heap (negated values): the smaller half
        self.high = []      # min-heap: the larger half

    def addNum(self, num: int) -> None:
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))      # largest of low moves up
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))  # rebalance sizes

    def findMedian(self) -> float:
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2`,
 js:JS_PQ+`class MedianFinder {
  constructor() {
    this.low = new Heap((a, b) => b - a);    // max-heap: the smaller half
    this.high = new Heap();                  // min-heap: the larger half
  }
  addNum(num) {
    this.low.push(num);
    this.high.push(this.low.pop());
    if (this.high.size > this.low.size) this.low.push(this.high.pop());
  }
  findMedian() {
    return this.low.size > this.high.size ? this.low.peek() : (this.low.peek() + this.high.peek()) / 2;
  }
}`,
 java:`class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder());
    private final PriorityQueue<Integer> high = new PriorityQueue<>();

    public void addNum(int num) {
        low.add(num);
        high.add(low.poll());
        if (high.size() > low.size()) low.add(high.poll());
    }

    public double findMedian() {
        return low.size() > high.size() ? low.peek() : (low.peek() + (double) high.peek()) / 2;
    }
}`,
 cpp:`class MedianFinder {
    priority_queue<int> low;                                   // max-heap
    priority_queue<int, vector<int>, greater<int>> high;      // min-heap
public:
    void addNum(int num) {
        low.push(num);
        high.push(low.top()); low.pop();
        if (high.size() > low.size()) { low.push(high.top()); high.pop(); }
    }
    double findMedian() {
        return low.size() > high.size() ? low.top() : ((double)low.top() + high.top()) / 2;
    }
};`});
