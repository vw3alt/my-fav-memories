# 🌸 Our Memory Timeline

A cute, cottagecore-themed photo guessing game where you try to remember *when* your precious memories were made!

## ✨ Features

- 📸 Displays one photo at a time in a soft polaroid-style frame
- 🎚️ Monthly slider from Feb 2024 → Feb 2026
- 🎉 Confetti burst on correct guesses
- 🎵 Looping background music (mutable)
- 🌸 Floating petals animation
- 🔁 Infinite random photo queue
- 📱 Responsive & mobile-friendly

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your photos

Drop your photos into the `public/photos/` folder.

### 3. Edit `public/memories.json`

```json
[
  { "image": "your-photo.jpg", "month": "March", "year": "2024" },
  { "image": "another-photo.jpg", "month": "July", "year": "2025" }
]
```

> **Month must exactly match**: `January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December`
> 
> **Year must be between**: `2024` and `2026`

### 4. Add background music

Drop a file named `cute-music.mp3` into the `public/` folder.
Any royalty-free lo-fi or cute background track works great!

Suggestions:
- Search "cottagecore bgm" or "soft lofi music" on YouTube
- Use [Pixabay](https://pixabay.com/music/) for free music
- Use [Free Music Archive](https://freemusicarchive.org/)

### 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`

## 🌐 Deploy to GitHub Pages

### First-time setup

1. Create a new repository on GitHub (e.g., `memory-timeline`)

2. Push your project:
```bash
git init
git add .
git commit -m "🌸 Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/memory-timeline.git
git push -u origin main
```

3. In `package.json`, update the `homepage` field:
```json
"homepage": "https://YOUR_USERNAME.github.io/memory-timeline"
```

4. Also update `vite.config.js` base path:
```js
base: '/memory-timeline/',
```

5. Deploy:
```bash
npm run deploy
```

6. Go to your repo → Settings → Pages → Source: `gh-pages` branch

Your site will be live at `https://YOUR_USERNAME.github.io/memory-timeline` 🎉

### Subsequent deploys

```bash
npm run deploy
```

## 📁 Project Structure

```
memory-timeline/
├── public/
│   ├── memories.json       ← Your photo data
│   ├── cute-music.mp3      ← Background music
│   ├── favicon.svg
│   └── photos/             ← Your photos go here!
│       ├── photo1.jpg
│       └── ...
├── src/
│   ├── App.jsx             ← Main game component
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Customization

### Changing the date range

In `src/App.jsx`, find `generateMonthSlots()` and adjust the year/month logic.

### Changing colors

In `src/index.css`, edit the CSS variables at the top:

```css
:root {
  --pink-deep: #f48fb1;
  --pink-accent: #e91e8c;
  /* etc... */
}
```

### Adding more years to guess from

Expand the `SLOTS` range in `src/App.jsx` by modifying the loop bounds in `generateMonthSlots()`.

---

*Made with 🌸 love*
