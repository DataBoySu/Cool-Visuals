# 🖱️ Antigravity Mouse Follow

A premium, modular particle system inspired by high-end creative coding. This library allows you to easily add a dense, interactive particle background to any project.

## 🚀 Key Features
- **High Density:** Optimized for 30,000+ particles at 60fps.
- **Circular Particles:** Custom-generated textures for smooth, anti-aliased circles.
- **Selective Influence:** Control which percentage of particles reacts to the user.
- **Wide Coverage:** Particles are distributed across the entire viewport, not just the center.
- **Drop-in Modular:** Simple API for quick integration.

## 🛠️ How to use in your project

### 1. Include Three.js and Antigravity.js
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js"></script>
<script src="path/to/script.js"></script>
```

### 2. Add a Container
```html
<div id="particles"></div>
```

### 3. Initialize the Effect
```javascript
new Antigravity({
    container: document.getElementById('particles'),
    particleCount: 40000,
    influenceRatio: 0.8,
    range: 3.5,
    size: 0.03,
    colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
});
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `container` | HTMLElement | `document.body` | Where to attach the canvas. |
| `particleCount` | Number | `30000` | Total number of particles to render. |
| `influenceRatio`| Number | `0.8` | Ratio (0-1) of particles that react to mouse. |
| `range` | Number | `2.5` | Radius of mouse interaction. |
| `size` | Number | `0.025` | Diameter of the particles. |
| `colors` | String[] | Google Palette | Array of hex color strings. |

---

*Part of the [Cool Frontend Visuals](https://github.com/your-username/cool-frontend-visuals) collection.*
