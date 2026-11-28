# Portfolio OS

An interactive portfolio built to look and feel like a desktop operating system. It's plain HTML, CSS and JavaScript, with no build step and no dependencies to install.

## Edit your content

Everything (name, bio, projects, skills, experience, links, recycle-bin jokes) lives in **`js/config.js`**.

- Photo: put an image in `assets/` and set `avatar: "assets/me.jpg"`.
- Project icons use [Tabler icon](https://tabler.io/icons) names, like `rocket` or `brand-github`.

## Run locally

```powershell
python -m http.server 5500
```

Then open http://localhost:5500. You can also open `index.html` directly in a browser.

## Deploy

Upload the folder as-is to GitHub Pages, Netlify or Vercel. No build command is needed.

## Things to discover

- Boot screen, then the login screen, then the desktop.
- Drag windows. Snap them by dragging to the left, right or top edge. Double-click a title bar to maximize.
- Apps: README, Projects (file explorer), Task Manager (skills), Terminal, Mail, Music (lo-fi generated live), Paint, Snake, Settings, Recycle Bin, Achievements.
- Terminal: `help`, `neofetch`, `sudo hire-me`, `matrix`, `rm -rf /` …
- 14 achievements, plus the Konami code.
- Recruiter mode: a clean one-page version at `?recruiter`.
- Right-click the desktop, Ctrl+Space opens the Start menu, and a phone layout kicks in on small screens.
