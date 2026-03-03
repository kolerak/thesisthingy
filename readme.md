
# Thesis Data Entry App — GitHub Codespaces Setup

## File Structure
```
thesis-entry/
├── .devcontainer/
│   └── devcontainer.json
├── src/
│   ├── main.jsx
│   └── App.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---
## FILE: package.json
```json
{
  "name": "thesis-entry",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 5173"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.1.0"
  }
}
```

---
## FILE: vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  }
})
```

---
## FILE: .devcontainer/devcontainer.json
```json
{
  "name": "Thesis Entry App",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18",
  "forwardPorts": [5173],
  "portsAttributes": {
    "5173": {
      "label": "Thesis App",
      "onAutoForward": "openBrowser"
    }
  },
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": ["esbenp.prettier-vscode", "dbaeumer.vscode-eslint"]
    }
  }
}
```

---
## FILE: index.html
```html


  
    
    
    Thesis Data Entry
    * { margin: 0; padding: 0; box-sizing: border-box; }
  
  
    
    
  

```

---
## FILE: src/main.jsx
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  
    
  
)
```

---
## FILE: src/App.jsx
# ⚠️  COPY THE FULL App.jsx FROM BELOW — only the storage functions differ from the artifact version

```jsx
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// STORAGE  — localStorage (works in any real browser / Codespaces)
// ═══════════════════════════════════════════════════════════════
const PFX = "tp:";

const saveP = p => {
  try { localStorage.setItem(`${PFX}${p._id}`, JSON.stringify(p)); }
  catch(e) { console.error("Save error", e); }
};

const loadAll = () => {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PFX)) {
      try { out.push(JSON.parse(localStorage.getItem(k))); } catch {}
    }
  }
  return out.sort((a, b) => a._num - b._num);
};

// ── everything else is identical to the artifact App.jsx ────────
// ── Paste the full component below this line ────────────────────
// ── The only difference: no async/await on saveP/loadAll ────────

// In the main App component, change:
//
//   useEffect(()=>{ (async()=>{ const loaded = await loadAll(); ...  })(); }, []);
// to:
//   useEffect(()=>{ const loaded = loadAll(); ... }, []);
//
// And the auto-save effect:
//   autoSave.current = setTimeout(()=>saveP(parts[pIdx]), 400);   ← stays the same
//
// And doExport:
//   const all = loadAll();   ← remove await
//
// And saveNext:
//   await saveP(parts[pIdx]);  →  saveP(parts[pIdx]);   ← remove await
```

---
## README.md
```markdown
# Thesis Data Entry App

Data entry tool for: MAI (52 items) + 3 DIT-2 style dilemma stories.

## Quick Start (Codespaces)
1. Open this repo in GitHub Codespaces
2. The terminal will run `npm install` automatically
3. Run: `npm run dev`
4. Codespaces will open port 5173 in your browser

## Data Persistence
- All data is saved to **localStorage** automatically after every keystroke
- Data survives browser refresh and Codespace restarts
- Click **⬇CSV** or **⬇SPSS+CSV** at any time to export — exports ALL saved participants

## Keyboard Shortcuts
| Key | Action |
|-----|--------|
| T | True (MAI sections, saved as 1) |
| R | False (MAI sections, saved as 2) |
| 1–7 | Rate item (Story sections) |
| ↑ / ↓ | Navigate rows |
| Tab | Next section |
| Shift+Tab | Previous section |
| Backspace | Clear current item |
| Enter | Save & next participant (Review tab) |

## Coding Guide (for SPSS)
- Missing: **-9**
- Gender: **1=Male 2=Female 3=Other 4=Not Specified**
- MAI: **1=True 2=False** (SPSS syntax recodes to 1/0 for scoring)
- Dilemmas: **1** (Not Important) to **7** (Very Important)

## Export Files
| File | Use |
|------|-----|
| `thesis_data.csv` | Import directly into SPSS or Excel |
| `thesis_syntax.sps` | Run in SPSS/PSPP — imports CSV, labels all variables, computes MAI subscales and N2 scores |

## Variable Count Per Participant
- 9 demographic variables
- 52 MAI items (mai_01 – mai_52)
- 12 Story 1 items (s1_q01–s1_q10, s1_m11, s1_m12)
- 13 Story 2 items (s2_q01–s2_q11, s2_m12, s2_m13)
- 12 Story 3 items (s3_q01–s3_q11, s3_m12)
- **Total: 98 variables**
```

---
## HOW TO PUT ON GITHUB

```bash
# 1. Create repo on github.com — name it thesis-entry
# 2. Clone it locally or open terminal in Codespaces, then:

git init
git add .
git commit -m "Initial commit — thesis data entry app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/thesis-entry.git
git push -u origin main

# 3. On GitHub: click green "Code" button → "Open with Codespaces" → "New codespace"
# 4. Wait ~1 min for setup, then run: npm run dev
# 5. Codespaces will show a popup "Open in Browser" — click it
```
