# 👑 VELORA — The Luxury Perfume Era

Welcome to the official offline codebase for **VELORA Parfums**, a premium, royal-themed interactive fragrance showcase. 

This repository contains the complete static website assets, design structures, custom cursor trails, and a fully custom **direct-purchase luxury checkout system**.

---

## ✨ Features

1. **Cinematic Hero Entry:** Full-page scroll-driven immersive video experience utilizing modular speed interpolations.
2. **Flagship Fragrance Showcase:** 4 dedicated interactive pages featuring product summaries, olfactory note breakdowns, and beautiful visual frames:
   - [Velora Pour Femme](pour-femme.html)
   - [Velora Imperial](imperial.html)
   - [Velora Nocturne](nocturne.html)
   - [Velora Éternité](eternite.html)
3. **Direct Concierge Checkout Drawer:** Sliding checkout panel integrating product selections, quantity adjustments, secure address shipping, and credit card payments.
4. **Cinematic Payment Validations:** Interactive shaking invalid-field triggers, royal progress loaders, and a 3D-effect **red wax seal** confirmation receipt.
5. **Opulent Wishlist Toasts:** Save-to-wishlist triggers that persist in local storage and launch gorgeous custom slide-down gold-glass toast pop-ups.

---

## 🚀 How to Host Locally (Offline)

### Method A: One-Click Windows Launcher (Recommended)
If you are on Windows, simply double-click the **`start-server.bat`** file in the root folder. It will:
- Verify your Node.js installation.
- Automatically install dependencies (`npm install`) if they are missing.
- Launch your default browser directly at [http://127.0.0.1:8080](http://127.0.0.1:8080).
- Run the local server instantly.

---

### Method B: Manual Command Line
If you prefer running manual commands, open your terminal/command prompt in this folder and execute:

```bash
# 1. Install local server dependencies
npm install

# 2. Start the local server
npm start
```

Once started, open **[http://127.0.0.1:8080](http://127.0.0.1:8080)** in your browser of choice.

---

## 🏛️ Codebase Structure

```
velora/
├── index.html             # Immersive cinematic home page
├── pour-femme.html        # Velora Pour Femme detail page
├── nocturne.html          # Velora Nocturne detail page
├── imperial.html          # Velora Imperial detail page
├── eternite.html          # Velora Éternité detail page
├── package.json           # Scripts & dependency definitions
├── start-server.bat       # Single-click launcher for Windows
├── assets/                # Videos, fonts, and images
├── css/
│   ├── style.css          # Main homepage styling
│   └── product.css        # Flagship product layout & custom checkout styles
└── js/
    ├── main.js            # Scroll triggers, tilts, mist spawners
    └── product.js         # Direct purchase engine, card formatters, wax-seal receipts
```

---

## 👑 Credits & Luxury Identity
* **Maison de Parfum:** Est. MMXXV
* **Brand Aesthetic:** Deep Obsidian, Amber Velvets, and Royal Gold Leaf (`#c9a84c`).
