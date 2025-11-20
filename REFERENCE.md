# Utility Class Reference

Quick reference for all utility classes in your refactored stylesheet.

## Layout

| Class           | Effect                                   |
| --------------- | ---------------------------------------- |
| `.flex`         | `display: flex`                          |
| `.flex-col`     | `flex-direction: column`                 |
| `.flex-between` | `justify-content: space-between`         |
| `.flex-center`  | `justify-content: center`                |
| `.items-center` | `align-items: center`                    |
| `.grid`         | `display: grid`                          |
| `.grid-3col`    | `grid-template-columns: 1fr 3fr 1fr`     |
| `.grid-full`    | `grid-column: 1 / -1` (span all columns) |

## Spacing

| Class     | Effect                    |
| --------- | ------------------------- |
| `.gap-sm` | `gap: 0.5rem`             |
| `.gap-md` | `gap: 1rem`               |
| `.p-sm`   | `padding: 0.5rem`         |
| `.p-md`   | `padding: 1rem`           |
| `.p-lg`   | `padding: 1.5rem`         |
| `.p-xl`   | `padding: 2rem`           |
| `.pl-md`  | `padding-left: 1rem`      |
| `.pt-md`  | `padding-top: 1rem`       |
| `.pb-xl`  | `padding-bottom: 2rem`    |
| `.m-sm`   | `margin: 0.5rem`          |
| `.m-md`   | `margin: 1rem`            |
| `.my-md`  | `margin-top/bottom: 1rem` |
| `.ml-md`  | `margin-left: 1rem`       |

## Sizing

| Class          | Effect              |
| -------------- | ------------------- |
| `.w-full`      | `width: 100%`       |
| `.h-full`      | `height: 100%`      |
| `.max-w-sm`    | `max-width: 350px`  |
| `.max-w-md`    | `max-width: 600px`  |
| `.max-w-lg`    | `max-width: 1600px` |
| `.max-w-20pct` | `max-width: 20%`    |
| `.max-w-25pct` | `max-width: 25%`    |
| `.max-w-40pct` | `max-width: 40%`    |
| `.min-w-20pct` | `min-width: 20%`    |

## Positioning

| Class                | Effect                           |
| -------------------- | -------------------------------- |
| `.relative`          | `position: relative`             |
| `.absolute`          | `position: absolute`             |
| `.fixed`             | `position: fixed`                |
| `.absolute-center`   | Horizontally centered (absolute) |
| `.fixed-bottom-left` | Fixed to bottom-left corner      |

## Text

| Class            | Effect                 |
| ---------------- | ---------------------- |
| `.text-left`     | `text-align: left`     |
| `.text-center`   | `text-align: center`   |
| `.text-accent`   | Copper color text      |
| `.truncate`      | Text overflow ellipsis |
| `.line-height-2` | `line-height: 2`       |

## Borders & Background

| Class            | Effect                         |
| ---------------- | ------------------------------ |
| `.border`        | 2px solid border               |
| `.border-dashed` | 2px dashed border              |
| `.rounded`       | `border-radius: 1rem`          |
| `.bg-primary`    | Background color (theme-aware) |

## Interaction

| Class        | Effect                        |
| ------------ | ----------------------------- |
| `.clickable` | Pointer cursor + accent hover |
| `.pointer`   | `cursor: pointer`             |

## Z-Index Layers

| Class           | Value | Use Case            |
| --------------- | ----- | ------------------- |
| `.z-dropdown`   | 100   | Dropdown menus      |
| `.z-drag-trash` | 800   | Rubbish pile        |
| `.z-dragging`   | 900   | Items being dragged |
| `.z-modal`      | 1000  | Modal overlays      |
| `.z-top`        | 10000 | Absolutely on top   |

## Component Classes

These handle complex, specific behaviors:

| Class              | Purpose                                 |
| ------------------ | --------------------------------------- |
| `.container`       | Standard bordered box with padding      |
| `.draggable`       | Drag-and-drop items                     |
| `.drag-handle`     | Hidden handle (shows on parent hover)   |
| `.has-drag-handle` | Parent container for drag handle reveal |
| `.icon`            | 24×24 icon wrapper                      |
| `.icon-lg`         | 72×72 icon wrapper                      |
| `.icon.expanded`   | Rotated state (90°)                     |
| `.rubbish-active`  | Active trash drop zone                  |
| `.dropdown`        | Absolute dropdown positioning           |
| `.modal-overlay`   | Full-screen modal backdrop              |
| `.text-button`     | Standard button style                   |
| `.delete-button`   | Danger/delete button                    |

## Common Patterns

### Horizontal nav section:

```html
<div class="flex items-center gap-sm"></div>
```

### Centered content:

```html
<div class="flex flex-center items-center"></div>
```

### Truncated username:

```html
<span class="truncate max-w-25pct"></span>
```

### Bordered card:

```html
<div class="container"></div>
```

### Sidebar column:

```html
<div class="flex flex-col container"></div>
```

### Fixed overlay:

```html
<div class="fixed-bottom-left bg-primary z-drag-trash"></div>
```
