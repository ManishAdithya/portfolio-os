/*
 * ============================================================
 *  YOUR PORTFOLIO CONTENT — edit this file, nothing else needed.
 * ============================================================
 *  Everything shown on the site (README, projects, skills,
 *  terminal answers, recruiter mode) is read from here.
 *  Leave a field as "" (or an empty list) to hide it.
 */
window.PORTFOLIO = {
  name: "Manish Adithya P V",
  firstName: "Manish",
  role: "CSE Student · Software Developer · AI/ML Enthusiast",
  tagline: "Building intelligent solutions at the intersection of AI, ML and software engineering.",
  location: "Hyderabad, Telangana, India",
  timezone: "Asia/Kolkata",
  status: "Open to work",
  // Logo used on the boot screen, Start button and browser tab. Empty = first letter of your name.
  logo: "assets/logo.png",
  // Picture in the avatar circles (login, README, recruiter mode). Empty = initials.
  avatar: "assets/logo.png",
  // Optional: path or URL to your resume PDF, e.g. "assets/resume.pdf".
  resumeUrl: "",

  about: [
    "I'm a Computer Science and Engineering student passionate about Artificial Intelligence, Machine Learning, Data Science, and Software Development. I enjoy building practical projects, exploring emerging technologies, and solving real-world problems through code.",
    "I'm continuously improving my skills in programming, problem-solving, and intelligent systems, with a goal of creating impactful technology."
  ],

  facts: [
    ["Based in", "Hyderabad, India"],
    ["Studying", "B.Tech CSE"],
    ["Focus", "AI / ML"],
    ["Also into", "Security"]
  ],

  email: "5h3nronpv@gmail.com",
  socials: [
    { label: "GitHub", url: "https://github.com/ManishAdithya", icon: "brand-github" }
  ],

  // Add jobs or internships here when you have them. The section hides while this is empty.
  // Example: { role: "Intern", company: "Company", period: "2026", points: ["What you did"] }
  experience: [],

  education: [
    { degree: "B.Tech, Computer Science and Engineering", school: "Amrita Vishwa Vidyapeetham, Amritapuri Campus", period: "" }
  ],

  // color: any CSS color. icon: any Tabler icon name (https://tabler.io/icons)
  // Leave a link as "" to hide its button.
  projects: [
    {
      id: "bvi-navigation",
      title: "BVI Navigation",
      tagline: "Context-aware multimodal navigation assistant",
      description: "An AI-powered navigation assistant that helps visually impaired people move through their surroundings using scene understanding, hazard detection and spatial audio. A video-based prototype detects obstacles with YOLO, assesses hazards, remembers routes, and tells the user where obstacles are through HRTF-based 3D audio on regular headphones.",
      tech: ["Python", "YOLO", "OpenCV", "PyTorch", "NumPy", "SciPy", "SoundDevice", "SOFA / HRTF"],
      year: "2026",
      color: "#22c7a9",
      icon: "eye",
      highlights: ["Real-time YOLO obstacle detection", "Hazard assessment with persistent route memory", "Spatial audio cues through regular headphones"],
      links: { live: "", code: "https://github.com/ManishAdithya/BVI-navigation" }
    },
    {
      id: "ai-romanizer",
      title: "AI Romanizer",
      tagline: "LLM-powered Romanized Telugu understanding",
      description: "A language assistant that understands informal, dialect-rich Telugu written in English letters (Telglish), including inconsistent spellings, mixed English and regional dialects. It has five modes: English translation, word-by-word explanation, Telugu script conversion, conversation and customer support.",
      tech: ["Python", "LLMs", "GPT-OSS-120B", "Groq API", "Ollama", "SSE", "Docker"],
      year: "2026",
      color: "#7c6cff",
      icon: "language",
      highlights: ["Parallel language and dialect detection", "Token-by-token streaming with multi-turn memory", "Structured JSON insights and automated evaluation"],
      links: { live: "", code: "" }
    },
    {
      id: "preptrack",
      title: "PrepTrack",
      tagline: "Study hub for a college class, run by its students",
      description: "A study platform for one college class: notes, slides, previous year question papers and exam dates in one place, shared and reviewed by the students themselves. Live for the EEE 2024 batch at Amrita, with separate student, class representative (CR) and owner dashboards, a class forum and an exam countdown. Installable as an app (PWA) on laptops and phones.",
      tech: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB", "JWT", "Vercel Blob"],
      year: "2026",
      color: "#ff7a59",
      icon: "school",
      highlights: [
        "Community review: uploads go live after CR approval or 5 Helpful votes",
        "XP leaderboard, class forum and exam countdown",
        "Roll-number sign-in with JWT, bcrypt and account lockout",
        "Installable PWA, files stored on Vercel Blob"
      ],
      links: { demo: "assets/preptrack-demo.gif", live: "https://preptrack-app.vercel.app", code: "https://github.com/ManishAdithya/PrepTrack" }
    },
    {
      id: "pyq-lens",
      title: "PYQ Lens",
      tagline: "Finds the patterns in previous year question papers",
      description: "Upload previous year question papers for a subject as digital PDFs, scanned pages, phone photos or pasted text. PYQ Lens reads every question, groups the questions by topic and shows what to study first, which topics are likely due, which are rising or fading, questions repeated across years, a year-by-year marks heatmap, and marks by unit and question type. Live on Render with a Neon Postgres database: anyone can sign up, and each account keeps its own private subjects and papers. Free and open source, with no paid APIs.",
      tech: ["Python", "FastAPI", "SQLAlchemy", "PyMuPDF", "RapidOCR", "scikit-learn", "React", "TypeScript", "Vite", "Neon Postgres", "Neon Auth", "Render", "Modal", "Docker"],
      year: "2026",
      color: "#3b9eff",
      icon: "zoom-scan",
      highlights: [
        "Topics ranked by frequency, marks share and recency",
        "Spots likely-due, rising and fading topics plus repeated questions",
        "Drop a pile of photos: sorted into papers by header, numbering and print style",
        "OCR turns photos upright and keeps diagrams with their questions",
        "Runs on free tiers: Render (512 MB) plus an optional Modal OCR helper",
        "Email sign-up with Neon Auth, private subjects per account"
      ],
      links: { demo: "assets/pyq-lens-demo.gif", live: "https://pyq-lens.onrender.com", code: "https://github.com/ManishAdithya/pyq-lens" }
    }
  ],

  // level: 0-100 (rough self-rating). group is used for sections in the Task Manager.
  skills: [
    { name: "Python",     level: 90, group: "Languages" },
    { name: "Java",       level: 75, group: "Languages" },
    { name: "C",          level: 72, group: "Languages" },
    { name: "JavaScript", level: 78, group: "Languages" },

    { name: "Machine Learning",  level: 82, group: "AI / ML" },
    { name: "Deep Learning",     level: 75, group: "AI / ML" },
    { name: "Computer Vision",   level: 80, group: "AI / ML" },
    { name: "NLP and LLMs",      level: 80, group: "AI / ML" },
    { name: "PyTorch",           level: 75, group: "AI / ML" },
    { name: "OpenCV",            level: 80, group: "AI / ML" },
    { name: "YOLO",              level: 78, group: "AI / ML" },
    { name: "Scikit-learn",      level: 75, group: "AI / ML" },
    { name: "NumPy / Pandas",    level: 85, group: "AI / ML" },
    { name: "Prompt Engineering", level: 82, group: "AI / ML" },

    { name: "React.js",   level: 78, group: "Frameworks" },
    { name: "Express.js", level: 70, group: "Frameworks" },
    { name: "Flask",      level: 72, group: "Frameworks" },
    { name: "Full Stack Development", level: 75, group: "Frameworks" },

    { name: "PostgreSQL",     level: 70, group: "Databases and tools" },
    { name: "SQLite",         level: 72, group: "Databases and tools" },
    { name: "Room Database",  level: 68, group: "Databases and tools" },
    { name: "Git",            level: 82, group: "Databases and tools" },
    { name: "Docker",         level: 65, group: "Databases and tools" },
    { name: "Android Studio", level: 72, group: "Databases and tools" },

    { name: "Android App Hacking",    level: 75, group: "Security" },
    { name: "Penetration Testing",    level: 72, group: "Security" },
    { name: "Vulnerability Analysis", level: 72, group: "Security" },
    { name: "Malware Analysis",       level: 65, group: "Security" },
    { name: "Frida / Objection",      level: 72, group: "Security" },
    { name: "HTTP Toolkit",           level: 75, group: "Security" }
  ],

  // Files shown in the Recycle Bin. Have fun with these.
  badCode: [
    { name: "model_final_v2_REAL.py", content: "# accuracy: 99.8% (on the training set)\nmodel.fit(X_train, y_train, epochs=1000)\nmodel.evaluate(X_train, y_train)  # why test on anything else?" },
    { name: "fix_everything.sh", content: "#!/bin/bash\n# It works on my machine\ngit add .\ngit commit -m \"fixed stuff\"\ngit push --force   # what could go wrong" },
    { name: "isEven.js", content: "// TODO: fix later\nfunction isEven(n) {\n  if (n === 0) return true;\n  if (n === 1) return false;\n  if (n === 2) return true;\n  if (n === 3) return false;\n  // ...I gave up at 4,000\n}" },
    { name: "regex_from_stackoverflow.txt", content: "/^(?:(?!\\b\\d{3}\\b)[\\w-])+(?<!_)$/\n\nNo idea what this does. Do not touch. It holds up production." }
  ]
};
