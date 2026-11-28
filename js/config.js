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

  about: [
    "I'm a Computer Science and Engineering student passionate about Artificial Intelligence, Machine Learning, Data Science, and Software Development. I enjoy building practical projects, exploring emerging technologies, and solving real-world problems through code.",
    "I'm continuously improving my skills in programming, problem-solving, and intelligent systems, with a goal of creating impactful technology.",
    "I'm also into cybersecurity. I reverse engineer Android apps, analyse real-world malware and play CTFs, and I write up what I find in my security blogs."
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
      id: "bhashify",
      title: "Bhashify",
      tagline: "Your Telugu group chat, in English",
      description: "A Chrome extension for WhatsApp Web that tells people who don't speak Telugu what their Telugu group chat said. Pick a time range and get an English summary: the important details (deadlines, exams, payments, links), who said what, and what you need to do. Any message can be translated right inside the chat. Behind it is an LLM backend that understands Telugu the way people actually type it: in English letters mixed with English (\"Telglish\"), with no fixed spelling, in any dialect. It comes with a hand-reviewed dataset and an evaluation pipeline that measures how well it really works.",
      tech: ["Python", "FastAPI", "Chrome Extension", "GPT-OSS-120B", "Gemini", "Groq", "RAG", "SSE", "Docker", "Vercel"],
      year: "2026",
      color: "#ff8a1f",
      icon: "language",
      highlights: [
        "Summaries of any period: deadlines, payments, who said what and your to-dos",
        "77% correct meaning on 140 held-out sentences, graded by a separate judge model",
        "Grounded support agent: right help article first 96% of the time, never guesses",
        "Telugu-script pivot, retrieved examples and parallel dialect detection, streamed over SSE",
        "77 Python and 6 JavaScript tests, GitHub Actions CI, Docker image"
      ],
      links: { demo: "assets/bhashify-demo.gif", live: "https://bhashify.vercel.app/", code: "https://github.com/ManishAdithya/Bhashify" }
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

  // Security write-ups on Medium, newest first. The section hides while posts is empty.
  // kind groups the filter buttons. image: the post's cover (any URL). minutes: read time.
  // Optional stats, shown when filled in: views, reads, claps.
  blog: {
    url: "https://medium.com/@5h3nron",
    handle: "@5h3nron",
    posts: [
      {
        title: "Analyzing a new Persian Malware (I'll call it Netix)",
        url: "https://medium.com/@5h3nron/analyzing-a-new-persian-malware-ill-call-it-netix-a37c934b5cb2",
        date: "2025-04-27", minutes: 10, kind: "Malware analysis",
        summary: "A deep breakdown of an Android banking trojan aimed at Iranian bank users: hidden C2 servers, forced SMS and contact permissions, data theft, persistence through Firebase, and ransomware-style behaviour.",
        tags: ["Android malware", "Banking trojan", "Reverse engineering"],
        image: "https://cdn-images-1.medium.com/max/600/1*l7PhhX0URhcG2ARxdgEMZg.png"
      },
      {
        title: "Analyzing a Malicious Android APK: The Iranian APK, Sana System",
        url: "https://medium.com/@5h3nron/analyzing-a-malicious-android-apk-the-iranian-apk-sana-system-bebeddec87d8",
        date: "2024-11-14", minutes: 4, kind: "Malware analysis",
        summary: "How an Android app tricks users into granting SMS access, then intercepts and stores their messages. Covers its data storage, WebView handling and SMS interception code.",
        tags: ["Android malware", "Static analysis", "SMS interception"],
        image: "https://cdn-images-1.medium.com/max/600/1*3vPfNaweDfn7PU6_KXmGjw.png"
      },
      {
        title: "Solving the Mobisec Challenge: DefCamp 2024",
        url: "https://medium.com/@5h3nron/solving-the-mobisec-challenge-defcamp-2024-ad3376afaaf4",
        date: "2024-10-25", minutes: 4, kind: "CTF write-up",
        summary: "Analysing and exploiting the Mobisec Android app from DefCamp 2024: spotting the flaw, scripting UUID checks and reversing hashes to pull out the flags.",
        tags: ["DefCamp", "Android", "Hash reversing"],
        image: "https://cdn-images-1.medium.com/max/600/1*AUZJItbZ9d_-TO_2ymlDvw.png"
      },
      {
        title: "Lookdown Challenge from TCP1P: A Step-by-Step Guide",
        url: "https://medium.com/@5h3nron/lookdown-challenge-from-tcp1p-a-step-by-step-guide-3ed20e9ec385",
        date: "2024-10-15", minutes: 5, kind: "CTF write-up",
        summary: "Solving an Android challenge that is only beaten by submitting a proof-of-concept app: the vulnerable code, the logic behind the PoC, and how it gets the flag.",
        tags: ["TCP1P CTF", "Android", "Proof of concept"],
        image: "https://cdn-images-1.medium.com/max/600/1*-Ika58fEcfPkGZbT2svF5Q.png"
      },
      {
        title: "Solving Treasure Hunt from Iron CTF",
        url: "https://medium.com/@5h3nron/solving-tresure-hunt-from-iron-ctf-5fa0ab33697c",
        date: "2024-10-06", minutes: 3, kind: "CTF write-up",
        summary: "Following clues through an Android app's files and activities to find a hidden flag, written to be easy to follow for people new to reverse engineering.",
        tags: ["Iron CTF", "Android reversing"],
        image: "https://cdn-images-1.medium.com/max/600/1*VlSxPiIkYtnyIB0YjSQgeQ.png"
      },
      {
        title: "Solving CryptoHorrific Challenge from Hack The Box",
        url: "https://medium.com/@5h3nron/solving-cryptohorrific-challenge-from-hack-the-box-0e79f0138af6",
        date: "2024-10-03", minutes: 3, kind: "CTF write-up",
        summary: "A mobile crypto puzzle from Hack The Box: reversing an iOS Mach-O binary and its plist to recover the key and decrypt the flag.",
        tags: ["Hack The Box", "iOS", "Cryptography"],
        image: "https://cdn-images-1.medium.com/max/600/1*ph1Ofzq6fZL-etcHqSyCEw.png"
      },
      {
        title: "HTB “Saw” Challenge: The Saw APK",
        url: "https://medium.com/@5h3nron/htb-saw-challenge-the-saw-apk-d4be714b0a0e",
        date: "2024-09-09", minutes: 6, kind: "CTF write-up",
        summary: "Reverse engineering the Saw APK from Hack The Box, from the Java code down to its native library in IDA, to uncover the hidden flag.",
        tags: ["Hack The Box", "Android", "Native code", "IDA"],
        image: "https://cdn-images-1.medium.com/max/600/1*5NIlLtOQh1JsBAHqf-H01A.png"
      },
      {
        title: "Breaking Down the Injured Android APK, Part 2",
        url: "https://medium.com/@5h3nron/breaking-down-the-injured-android-apk-part-2-e4ad96c0c6c0",
        date: "2024-08-22", minutes: 4, kind: "CTF write-up",
        summary: "More flags from the deliberately vulnerable Injured Android app: protected components, remote code execution, XSS and binary exploitation.",
        tags: ["Injured Android", "RCE", "XSS"],
        image: "https://cdn-images-1.medium.com/max/600/1*kXV9zxHMZAUFyemtCJl03A.png"
      },
      {
        title: "Hacking SpacePeng with Frida: Game Hacking and Script Exploits",
        url: "https://medium.com/@5h3nron/hacking-spacepeng-with-frida-a-deep-dive-into-game-hacking-and-script-exploits-559e7546fab2",
        date: "2024-08-17", minutes: 4, kind: "Game hacking",
        summary: "Using Frida to hook a mobile game at runtime and add cheats: infinite lives, rapid fire, invisibility and more, with the scripts explained.",
        tags: ["Frida", "Dynamic instrumentation", "Android"],
        image: "https://cdn-images-1.medium.com/max/600/1*BKOTCNXsCeS0KGqpGjKKqg.png"
      }
    ]
  },

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
