# 📐 PhotoMeasure

**Measure real-world dimensions from any photo — mobile-first, PWA-ready.**

Upload a photo, set a reference length (e.g. face = 9 inches), then tap to measure anything in the image with pixel-perfect accuracy.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 📸 Image Upload | Drag & drop or tap-to-upload (camera on mobile) |
| 🎯 Reference Calibration | Click/tap two points → enter real-world size |
| 📏 Measurements | Unlimited saved lines with color coding |
| 🔢 Unit Switching | inches, feet, cm, meters |
| 🔍 Zoom & Pan | Mouse wheel / pinch-to-zoom + drag to pan |
| ↩️ Undo / Redo | Full history stack (Ctrl+Z / Ctrl+Y) |
| 📤 Export PNG | Download image with overlays baked in |
| 📤 Export JSON | Structured measurement data |
| 📱 Mobile-first | Touch optimized, bottom toolbar, pinch zoom |
| 🎛️ Calibration Slider | Fine-tune scale ±20% after calibration |

---

## 🚀 Termux Setup (Android — No PC needed)

### Step 1: Install Termux tools

```bash
pkg update && pkg upgrade -y
pkg install git nodejs-lts -y
```

### Step 2: Clone your GitHub repo

```bash
# First push this project to GitHub (see below), then:
git clone https://github.com/YOUR_USERNAME/photomeasure.git
cd photomeasure
```

### Step 3: Install dependencies

```bash
npm install
```

### Step 4: Run locally

```bash
npm run dev
```

Then open your browser and go to: `http://localhost:5173`

### Step 5: Build for production

```bash
npm run build
```

The `dist/` folder contains the final build ready to deploy.

---

## 🌐 Deploy to GitHub Pages (Free Hosting)

### 1. Push to GitHub first

```bash
git init
git add .
git commit -m "Initial commit — PhotoMeasure"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/photomeasure.git
git push -u origin main
```

### 2. Install gh-pages

```bash
npm install --save-dev gh-pages
```

### 3. Add deploy script to package.json

Add this to your `package.json` scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

Also add to package.json (top level):
```json
"homepage": "https://YOUR_USERNAME.github.io/photomeasure"
```

### 4. Deploy

```bash
npm run deploy
```

Your app will be live at: `https://YOUR_USERNAME.github.io/photomeasure`

---

## 🌐 Deploy to Vercel (Recommended — Faster)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Done! ✅

---

## 📁 Project Structure

```
photomeasure/
├── public/
│   └── icon.svg              # App icon
├── src/
│   ├── components/
│   │   ├── CalibModal.jsx    # Reference calibration dialog
│   │   ├── CanvasView.jsx    # Interactive canvas renderer
│   │   ├── Icons.jsx         # SVG icon components
│   │   ├── ResultsPanel.jsx  # Measurements list (desktop + mobile sheet)
│   │   └── Toolbar.jsx       # Desktop sidebar + Mobile bottom bar
│   ├── hooks/
│   │   ├── useCanvas.js      # Zoom, pan, coordinate transforms
│   │   └── useHistory.js     # Undo/redo manager
│   ├── utils/
│   │   └── helpers.js        # Math, drawing utilities, unit conversion
│   ├── App.jsx               # Main app with all state & events
│   ├── index.css             # Global styles
│   └── main.jsx              # React entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🧮 How the Math Works

```
// Calibration (set once with reference object):
pixelsPerInch = pixelDistance / realWorldInches

// Measurement (every line after calibration):
realWorldInches = pixelDistance / pixelsPerInch

// With adjustment slider:
effectivePPU = pixelsPerInch × (calibAdj / 100)
realWorldInches = pixelDistance / effectivePPU
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Reference tool |
| `M` | Measure tool |
| `Space` | Pan tool |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Esc` | Cancel active point |
| Scroll wheel | Zoom in/out |

---

## 📱 Mobile Touch Gestures

| Gesture | Action |
|---------|--------|
| Single tap | Place measurement point |
| Drag (Pan mode) | Move image |
| Pinch | Zoom in/out |
| Two-finger drag | Pan while zoomed |

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool (fast!)
- **HTML5 Canvas** — Image rendering & drawing
- **DM Sans + Space Mono** — Typography
- No other dependencies!

---

Made with ❤️ — PhotoMeasure v1.0
