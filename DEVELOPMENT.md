# MarkdownViewer - Development Documentation

## Project Overview

**Application Name:** MarkdownViewer
**Framework:** Tauri 2.x (Rust backend + Web frontend)
**Platform:** Windows
**Purpose:** A full-featured markdown editor with viewing, editing, and export capabilities (inspired by MarkdownForge)

---

## Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Backend | Rust + Tauri | File I/O, system integration, window management |
| Frontend | HTML/CSS/JavaScript + Vite | UI rendering, markdown parsing |
| Markdown | marked.js + highlight.js | GFM parsing and syntax highlighting |
| Export | docx.js + jsPDF | Word and PDF generation |

### Project Structure

```
markdown-viewer/
├── src/                    # Frontend source
│   ├── main.js             # Core application logic
│   ├── styles.css          # Styling (theme support)
├── index.html              # Main HTML (Vite entry)
├── vite.config.js          # Vite bundler config
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── lib.rs          # Library exports + Tauri commands
│   ├── Cargo.toml          # Rust dependencies
│   ├── capabilities/       # Permission configuration
│   └── tauri.conf.json     # Tauri configuration
├── package.json            # NPM dependencies
├── DEVELOPMENT.md          # This file
└── USER_GUIDE.md           # User documentation
```

---

## Phase I: Markdown Viewer ✅ COMPLETE

### Features

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| F1.1 | File Opening | Open .md/.txt files via menu, drag-drop | ✅ Complete |
| F1.2 | GFM Rendering | Full GitHub Flavored Markdown support | ✅ Complete |
| F1.3 | Syntax Highlighting | Code block syntax highlighting (25+ languages) | ✅ Complete |
| F1.4 | Tabbed Interface | Multiple files in tabs | ✅ Complete |
| F1.5 | Theme Support | Dark/Light/System with user toggle | ✅ Complete |
| F1.6 | Navigation | Document outline panel | ✅ Complete |

---

## Phase II: Editor Mode ✅ COMPLETE

### Features

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| F2.1 | Split-Pane Editor | Side-by-side markdown editor and live preview | ✅ Complete |
| F2.2 | View Modes | Toggle between Edit Only / Preview Only / Split | ✅ Complete |
| F2.3 | Auto-Save | Auto-save to local storage with indicator | ✅ Complete |
| F2.4 | Save/Save As | Save to file system (Ctrl+S, Ctrl+Shift+S) | ✅ Complete |
| F2.5 | New File | Create new markdown document | ✅ Complete |
| F2.6 | Word/Char Count | Live word and character counter | ✅ Complete |
| F2.7 | History | Document history/versions (local storage) | ✅ Complete |
| F2.8 | Unsaved Indicator | Show unsaved changes in tab (asterisk) | ✅ Complete |
| F2.9 | Close Confirmation | Prompt when closing unsaved document | ✅ Complete |
| F2.10 | Fullscreen Mode | Distraction-free fullscreen editing | ✅ Complete |

### Tasks

| ID | Task | Description | Status |
|----|------|-------------|--------|
| T2.1 | Editor Component | Textarea with line numbers and syntax highlighting | ✅ Complete |
| T2.2 | Split Pane Layout | Resizable split-pane with editor and preview | ✅ Complete |
| T2.3 | View Mode Toggle | Edit/Preview/Split mode buttons | ✅ Complete |
| T2.4 | Live Preview | Real-time markdown rendering as you type | ✅ Complete |
| T2.5 | File Save Commands | Rust commands for file write operations | ✅ Complete |
| T2.6 | Auto-Save System | LocalStorage auto-save with timestamp | ✅ Complete |
| T2.7 | History System | Store document versions in LocalStorage | ✅ Complete |
| T2.8 | Word Counter | Real-time word/character counting | ✅ Complete |
| T2.9 | Dirty State Tracking | Track unsaved changes per tab | ✅ Complete |
| T2.10 | Close Confirmation Dialog | Unsaved changes prompt | ✅ Complete |
| T2.11 | Fullscreen Toggle | F11 or button for fullscreen mode | ✅ Complete |
| T2.12 | Keyboard Shortcuts | Ctrl+S, Ctrl+Shift+S, Ctrl+N, etc. | ✅ Complete |

### Technical Specifications

#### Editor Layout (F2.1)
```
┌─────────────────────────────────────────────────────────────────┐
│ [New] [Open] [Save] │ [Edit] [Split] [Preview] │ [⛶] [Theme ◐] │
├─────────────────────────────────────────────────────────────────┤
│ Tab1 │ Tab2* │ Tab3 │                                           │
├───────────────────────────┬─────────────────────────────────────┤
│                           │                                     │
│   EDITOR                  │      PREVIEW                        │
│   (textarea/codemirror)   │      (rendered markdown)            │
│                           │                                     │
├───────────────────────────┴─────────────────────────────────────┤
│ Auto-saved ✓                              │ 245 words · 1,432 chars │
└─────────────────────────────────────────────────────────────────┘
```

#### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl+N | New file |
| Ctrl+O | Open file |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save As |
| Ctrl+W | Close tab |
| Ctrl+Tab | Next tab |
| Ctrl+Shift+Tab | Previous tab |
| F11 | Toggle fullscreen |
| Ctrl+1 | Edit mode |
| Ctrl+2 | Split mode |
| Ctrl+3 | Preview mode |

---

## Phase III: Formatting Toolbar & Helpers ✅ COMPLETE

### Features

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| F3.1 | Formatting Toolbar | Bold, italic, heading, list, quote buttons | ✅ Complete |
| F3.2 | Link Builder | Dialog to insert markdown links | ✅ Complete |
| F3.3 | Image Embedder | Dialog to insert images (local/URL) | ✅ Complete |
| F3.4 | Table Generator | Visual table builder interface | ✅ Complete |
| F3.5 | Task List Helper | Quick task list insertion | ✅ Complete |
| F3.6 | TOC Generator | Auto-generate table of contents | ⬜ Deferred |
| F3.7 | Code Block Helper | Insert code block with language picker | ✅ Complete |
| F3.8 | Markdown Beautifier | Clean up and format markdown | ⬜ Deferred |

### Tasks

| ID | Task | Description | Status |
|----|------|-------------|--------|
| T3.1 | Formatting Toolbar UI | Button bar with formatting icons | ✅ Complete |
| T3.2 | Text Selection Formatting | Wrap selected text with markdown syntax | ✅ Complete |
| T3.3 | Link Dialog | Modal for URL, text, title input | ✅ Complete |
| T3.4 | Image Dialog | Modal for image URL/file selection | ✅ Complete |
| T3.5 | Table Generator UI | Spreadsheet-like table builder | ✅ Complete |
| T3.6 | Table Alignment Controls | Left/center/right column alignment | ✅ Complete |
| T3.7 | CSV Import for Tables | Import CSV to markdown table | ⬜ Deferred |
| T3.8 | TOC Generation Logic | Parse headings and generate TOC | ⬜ Deferred |
| T3.9 | Code Block Insertion | Language selector + code block template | ✅ Complete |
| T3.10 | Beautifier Logic | Normalize spacing, indentation, styles | ⬜ Deferred |
| T3.11 | Formatting Shortcuts | Ctrl+B, Ctrl+I, Ctrl+K, etc. | ✅ Complete |

### Technical Specifications

#### Formatting Toolbar
```
┌──────────────────────────────────────────────────────────────────┐
│ [B] [I] [S] │ [H1▾] │ [•] [1.] [☐] │ ["] [—] │ [🔗] [🖼] [📊] [</>] │
└──────────────────────────────────────────────────────────────────┘
  Bold Italic    Heading  Lists    Block    Link Image Table Code
  Strikethrough           Task     Quote
```

#### Formatting Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+Shift+S | Strikethrough |
| Ctrl+K | Insert link |
| Ctrl+Shift+I | Insert image |
| Ctrl+Shift+C | Insert code block |
| Ctrl+Q | Blockquote |
| Ctrl+L | Bullet list |
| Ctrl+Shift+L | Numbered list |

#### Table Generator
- Visual grid interface (spreadsheet-like)
- Add/remove rows and columns
- Column alignment controls (left/center/right)
- CSV import capability
- Tab/Arrow key navigation between cells
- Real-time markdown preview

---

## Phase IV: Export & Conversion ✅ COMPLETE

### Features

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| F4.1 | Export to PDF | Convert markdown to PDF with themes | ✅ Complete |
| F4.2 | Export to DOCX | Convert markdown to Word document | ✅ Complete |
| F4.3 | Export to HTML | Export as standalone HTML file | ✅ Complete |
| F4.4 | PDF Themes | Professional, Academic, Minimal, Custom | ✅ Complete |
| F4.5 | PDF Options | Page size, margins, font size, line height | ✅ Complete |
| F4.6 | HTML to Markdown | Convert HTML content to markdown | ⬜ Deferred |
| F4.7 | CSV to Table | Convert CSV data to markdown table | ⬜ Deferred |

### Tasks

| ID | Task | Description | Status |
|----|------|-------------|--------|
| T4.1 | PDF Generator | Implement jsPDF/pdfmake integration | ✅ Complete |
| T4.2 | PDF Theme System | Preset themes with color schemes | ✅ Complete |
| T4.3 | PDF Options Dialog | Page size, margins, fonts UI | ✅ Complete |
| T4.4 | DOCX Generator | Implement docx.js integration | ✅ Complete |
| T4.5 | DOCX Style Mapping | Map markdown to Word styles | ✅ Complete |
| T4.6 | HTML Export | Generate standalone HTML with styles | ✅ Complete |
| T4.7 | HTML to MD Converter | turndown.js integration | ⬜ Deferred |
| T4.8 | CSV Parser | Parse CSV and generate table markdown | ⬜ Deferred |
| T4.9 | Export Dialog UI | Unified export dialog with options | ✅ Complete |
| T4.10 | Image Embedding | Embed images in PDF/DOCX exports | ⬜ Deferred |

### Technical Specifications

#### PDF Export Options
```
┌─────────────────────────────────────────┐
│           Export to PDF                 │
├─────────────────────────────────────────┤
│ Theme:    [Professional ▾]              │
│                                         │
│ Page Size: [A4 ▾]  [Letter] [Legal]     │
│                                         │
│ Margins:   [20] mm                      │
│ Font Size: [11] pt                      │
│ Line Height: [1.5]                      │
│                                         │
│ ☐ Include Table of Contents             │
│ ☐ Include Page Numbers                  │
│                                         │
│         [Cancel]  [Export PDF]          │
└─────────────────────────────────────────┘
```

#### PDF Themes
| Theme | Description |
|-------|-------------|
| Professional | Clean, modern, blue accents |
| Academic | Formal, serif fonts, scholarly |
| Minimal | Simple, lots of whitespace |
| Creative | Bold colors, modern typography |
| Custom | User-defined colors and fonts |

---

## Phase V: Advanced Features (Future)

### Potential Features

| Feature | Description |
|---------|-------------|
| Cheat Sheet | Built-in markdown syntax reference |
| Find & Replace | Search and replace in editor |
| Spell Check | Integrated spell checking |
| Custom CSS | User-defined preview styles |
| Templates | Pre-built document templates |
| Recent Files | Quick access to recent documents |
| Print | Direct print support |

---

## Dependencies

### Frontend (package.json)
```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.9.1",
    "@tauri-apps/plugin-dialog": "^2.6.0",
    "@tauri-apps/plugin-fs": "^2.4.5",
    "marked": "^17.0.1",
    "highlight.js": "^11.11.1"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2",
    "vite": "^5.0.0"
  }
}
```

### Future Dependencies (Phase III-IV)
```json
{
  "dependencies": {
    "docx": "^8.x",
    "jspdf": "^2.x",
    "turndown": "^7.x"
  }
}
```

### Backend (Cargo.toml)
```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

---

## Build Instructions

### Development
```bash
# Install dependencies
npm install

# Run in development mode (with Vite hot-reload)
npm run tauri dev
```

### Production Build
```bash
# Create Windows installer
npm run tauri build
```

### Output
- `src-tauri/target/release/MarkdownViewer.exe`
- `src-tauri/target/release/bundle/msi/MarkdownViewer_1.0.0_x64.msi`

---

## Progress Log

### 2026-01-31 - Phase I Complete

**Implementation:**
- Initialized Tauri 2.x project with Vite bundler
- Created Rust backend with file operations
- Implemented full GFM markdown rendering
- Added syntax highlighting for 25+ languages
- Built tabbed interface with scroll position memory
- Created theme system (System/Light/Dark)
- Implemented native file dialogs (.md, .markdown, .txt)
- Added drag-and-drop file support
- Built document outline panel

**Status:** Phase I complete, ready for Phase II

---

## Testing Checklist

### Phase I ✅
- [x] Open files via Open button
- [x] Open files via Ctrl+O
- [x] Open files via drag and drop
- [x] Support .md, .markdown, .txt files
- [x] GFM elements render correctly
- [x] Code blocks have syntax highlighting
- [x] Copy button works on code blocks
- [x] Multiple tabs work correctly
- [x] Tab switching preserves scroll position
- [x] Theme toggle works
- [x] Outline panel shows headings
- [x] Clicking outline scrolls to heading

### Phase II
- [ ] Split-pane editor displays correctly
- [ ] Live preview updates as you type
- [ ] View mode toggles work
- [ ] Save file (Ctrl+S)
- [ ] Save As (Ctrl+Shift+S)
- [ ] New file (Ctrl+N)
- [ ] Auto-save works
- [ ] Word/char count updates
- [ ] Unsaved indicator shows
- [ ] Close confirmation appears
- [ ] Fullscreen mode works

### Phase III
- [ ] Formatting toolbar displays
- [ ] Bold/Italic/etc. buttons work
- [ ] Link builder dialog works
- [ ] Image embedder works
- [ ] Table generator creates tables
- [ ] TOC generator works
- [ ] Code block helper works
- [ ] Beautifier cleans up markdown

### Phase IV
- [ ] PDF export with themes
- [ ] DOCX export works
- [ ] HTML export works
- [ ] Export options save correctly
- [ ] Images embedded in exports
- [ ] Tables render in exports
- [ ] HTML to MD conversion works
- [ ] CSV to table conversion works

---

*Last Updated: 2026-01-31 - Phase II-IV planning complete*
