# Portfolio OS

An interactive portfolio built to look and feel like a desktop operating system. It's plain HTML, CSS and JavaScript, with no build step and no dependencies to install.

## Edit your content

Everything (name, bio, projects, skills, experience, links, recycle-bin jokes) lives in **`js/config.js`**.

- Photo: put an image in `assets/` and set `avatar: "assets/me.jpg"`.
- Project icons use [Tabler icon](https://tabler.io/icons) names, like `rocket` or `brand-github`.

## Wallpapers

The live wallpapers are looping videos in `assets/wallpapers/`, listed at the top of `js/wallpaper.js`. Each one has:

| File | Used for |
|---|---|
| `<id>-1080.mp4` | most computers (1920x1080) |
| `<id>-1440.mp4` | large or high-resolution screens (2560x1440), only when the source video is at least that big |
| `<id>-portrait.mp4` | phones held upright: a tall slice of the source at full resolution |
| `<id>.jpg`, `<id>-portrait.jpg` | stills for the lock screen, while the video loads, and with Reduce motion on |
| `<id>-thumb.jpg` | the picker in Settings |

To add one, encode it with ffmpeg the same way. Crop the bottom 2.6% (this removes a recorder's watermark; skip it if there is none), keep quality high, since star fields smear easily, and drop the audio:

```powershell
ffmpeg -i source.mp4 -an -vf "crop=trunc(iw*0.974/2)*2:trunc(ih*0.974/2)*2:trunc(iw*0.013/2)*2:0,scale=1920:1080:flags=lanczos,fps=30" -c:v libx264 -preset slow -tune grain -crf 19 -pix_fmt yuv420p -movflags +faststart myid-1080.mp4
```

Use `scale=2560:1440` and `-crf 20` for the 1440 file. For the portrait file, replace the crop with a 9:19.5 slice centred on the subject.

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
