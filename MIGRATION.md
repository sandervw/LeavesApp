# CSS Refactor Migration Guide

## Key Changes

### Old Pattern (Nested Selectors)
```css
.navbar > div { display: flex; align-items: center; }
.navbar .center-header { position: absolute; left: 50%; ... }
.navbar .username { white-space: nowrap; overflow: hidden; }
```

### New Pattern (Composable Utilities)
```css
.flex { display: flex; }
.items-center { align-items: center; }
.absolute-center { position: absolute; left: 50%; transform: translateX(-50%); }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
```

---

## HTML Migration Examples

### 1. App Layout
**BEFORE:**
```html
<div className="App">
  <div className="sidebar container">...</div>
  <div className="content container">...</div>
  <div className="sidebar container">...</div>
</div>
```

**AFTER:**
```html
<div className="grid grid-3col">
  <div className="flex flex-col container">...</div>
  <div className="flex flex-col container">...</div>
  <div className="flex flex-col container">...</div>
</div>
```

---

### 2. Navbar (Main Example)
**BEFORE:**
```html
<nav className="navbar container">
  <div>
    <h1>Logo</h1>
    <span>Item</span>
  </div>
  
  <div className="center-header">
    <input placeholder="Search..." />
  </div>
  
  <div>
    <span className="username">john.doe@example.com</span>
    <button className="text-button">Logout</button>
  </div>
</nav>
```

**AFTER:**
```html
<nav className="flex flex-between items-center relative grid-full container">
  <div className="flex items-center gap-sm max-w-25pct">
    <h1 className="text-accent">Logo</h1>
    <span>Item</span>
  </div>
  
  <div className="absolute-center max-w-sm text-center z-dropdown w-full">
    <input placeholder="Search..." />
  </div>
  
  <div className="flex items-center gap-sm max-w-25pct">
    <span className="truncate">john.doe@example.com</span>
    <button className="text-button m-sm">Logout</button>
  </div>
</nav>
```

---

### 3. Box Component
**BEFORE:**
```html
<div className="box">
  <h2>Title</h2>
  <p>Content</p>
</div>

<div className="box traits">
  <p>Limited width content</p>
</div>
```

**AFTER:**
```html
<div className="bg-primary my-md pl-md min-w-20pct">
  <h2>Title</h2>
  <p>Content</p>
</div>

<div className="bg-primary my-md pl-md min-w-20pct max-w-40pct">
  <p>Limited width content</p>
</div>
```

---

### 4. Draggable Items
**BEFORE:**
```html
<div className="inline-trait">
  <div className="drag-handle">⋮⋮</div>
  <span>Trait name</span>
</div>
```

**AFTER:**
```html
<div className="flex items-center has-drag-handle">
  <div className="drag-handle">⋮⋮</div>
  <span>Trait name</span>
</div>
```

---

### 5. Rubbish Pile
**BEFORE:**
```html
<div className="rubbish-pile">
  <div className="active">
    <div className="icon">
      <svg>...</svg>
    </div>
  </div>
</div>
```

**AFTER:**
```html
<div className="fixed-bottom-left bg-primary text-center z-drag-trash">
  <div className="rubbish-active">
    <div className="icon-lg">
      <svg>...</svg>
    </div>
  </div>
</div>
```

---

### 6. Modal
**BEFORE:**
```html
<div className="modal-overlay">
  <div className="modal-content">
    <h2>Confirm</h2>
    <button>OK</button>
  </div>
</div>
```

**AFTER:**
```html
<div className="modal-overlay z-modal">
  <div className="bg-primary flex flex-col p-lg rounded text-center">
    <h2>Confirm</h2>
    <button>OK</button>
  </div>
</div>
```

---

### 7. Detail Section
**BEFORE:**
```html
<div className="detail">
  <div className="box">Left</div>
  <div className="box">Right</div>
</div>
```

**AFTER:**
```html
<div className="flex">
  <div className="bg-primary my-md pl-md min-w-20pct">Left</div>
  <div className="bg-primary my-md pl-md min-w-20pct">Right</div>
</div>
```

---

### 8. Landing Page
**BEFORE:**
```html
<div className="landing-page">
  <p>Welcome text</p>
</div>
```

**AFTER:**
```html
<div className="flex flex-center p-xl max-w-md line-height-2">
  <p>Welcome text</p>
</div>
```

---

## Key Benefits

1. **No More Nested Selectors**: Everything is explicit in HTML
2. **Reusable Everywhere**: `.truncate` works on any element, not just `.navbar .username`
3. **Easy to Scan**: Class names tell you exactly what they do
4. **Mobile-Friendly**: Add responsive utilities later (e.g., `.md:flex-col`)
5. **Smaller Bundle**: Utilities are shared, not duplicated per component

## Classes You Can Delete

These are now handled by utilities:
- `.App` → `.grid .grid-3col`
- `.sidebar` → `.flex .flex-col`
- `.content` → `.flex .flex-col`
- `.detail` → `.flex`
- `.box` → compose from spacing/bg utilities
- `.box-buttons` → `.flex .flex-col .pt-md`
- `.droppable` → `.flex .flex-col .flex-between .pb-xl`
- `.inline-trait` (first declaration) → `.flex .items-center`
- `.subtrait` → `.ml-md`
- `.landing-page` → compose from flex/spacing utilities

## Classes to Keep (Special Behavior)

- `.container` - border box pattern
- `.draggable` - drag interaction styling
- `.drag-handle` / `.has-drag-handle` - reveal animation
- `.icon` / `.icon-lg` - SVG sizing
- `.rubbish-active` - trash interaction state
- `.dropdown` - absolute positioning relative to parent
- `.text-button` / `.delete-button` - button variants
- `.ProseMirror` overrides - editor-specific
