# Code Reduction Techniques

## 1. Function-Level Refactoring

- **Extract logic**: Move repeated blocks into helper functions.  
  _Example_: `validateUser()` instead of repeating checks.
- **Extract method/function**: Pull repeated code into reusable functions.

```javascript
// Before: Repeated logic
function processOrders() {
  orders.forEach((order) => {
    if (order.total > 100) applyDiscount(order);
  });
}
function processReturns() {
  returns.forEach((order) => {
    if (order.total > 100) applyDiscount(order);
  });
}

// After: Extracted common pattern
function processItems(items) {
  items.forEach((item) => {
    if (item.total > 100) applyDiscount(item);
  });
}
```

- **Inline small functions**: Merge single-use one-liners.
- **Eliminate branching duplication**: Use guard clauses for early exits.
- **Replace switch/if chains**: Use lookup tables, strategies, or polymorphism.

## 2. Data-Driven Refactoring

- **Replace conditionals with data**: Use maps or dictionaries for logic.  
  _Example_: `actions = { 'start': startFn, 'stop': stopFn }[cmd]()`
- **Replace conditional with polymorphism**: Use strategy patterns or inheritance for branching behavior.
- **Parameterize behavior**: Pass config objects or callbacks.
- **Introduce parameter objects**: Bundle multiple parameters into an object.

## 3. Syntax-Level Compression

- **Use concise syntax**: Destructuring, default params, ternaries.
- **Use optional chaining** for safer, shorter access.  
  _Example_:

  ```javascript
  // Before
  let name;
  if (user && user.profile) {
    name = user.profile.name;
  }

  // After
  let name = user?.profile?.name;
  ```

- **Use comprehensions** (Python) or functional chains (`map`, `filter`, `reduce`).

  ```javascript
  // Before: 8 lines
  let result = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].active) {
      result.push(items[i].name.toUpperCase());
    }
  }

  // After: 1 line
  let result = items.filter((x) => x.active).map((x) => x.name.toUpperCase());
  ```

- **Simplify imports** and eliminate unused ones.
- **Replace temp with query**: Move intermediate calculations into reusable methods.
- **Cleaner syntax**: Use modern language features for brevity.

## 4. Structure and File Reduction

- **Modularize**: Move unrelated logic to other files.
- **Use utility libraries**: Replace local helpers with standard library or framework utilities.

  ```python
  # Before: 10+ lines of custom logic
  def parse_json_file(path):
      with open(path, 'r') as f:
          content = f.read()
      return json.loads(content)

  # After: Built-in does both
  data = json.load(open(path))
  ```

- **Apply DRY principle**: Consolidate similar code into one function.
- **Eliminate duplicate code**: Use inheritance, composition, or utilities.

## 5. Algorithmic Simplification

- **Combine traversals**: Merge multiple loops over the same data.
- **Simplify logic**: Replace multi-step loops with reducers or pipelines.
- **Remove legacy or unreachable code.**

## 6. Minor Optimizations

- **Variable/function names**: Names may be shortened, but no abbreviations or acronyms (common exceptions: id, url, api).
- **Prune comments/docs**: Remove @example tags and redundant comments only.
