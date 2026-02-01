# down.edit - User Guide

## Welcome

down.edit is a lightweight Windows application for viewing, editing, and exporting Markdown files. It supports GitHub Flavored Markdown (GFM) with full syntax highlighting and exports to PDF, Microsoft Word (.docx), and HTML formats.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Viewing Markdown](#viewing-markdown)
3. [Editing Markdown](#editing-markdown)
4. [Formatting Toolbar](#formatting-toolbar)
5. [Exporting Documents](#exporting-documents)
6. [Beautify & Utilities](#beautify--utilities)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

1. Download `down.edit_Setup.msi` from the releases page
2. Run the installer and follow the prompts
3. Launch down.edit from the Start menu or desktop shortcut

### System Requirements

- Windows 10 or later (64-bit)
- 100 MB disk space
- WebView2 Runtime (installed automatically if needed)

---

## Viewing Markdown

### Opening Files

There are three ways to open a markdown file:

#### Using the Toolbar
1. Click the **Open** button (or press `Ctrl+O`)
2. Browse to your markdown file (.md, .markdown, or .txt)
3. Click **Open**

#### Drag and Drop
1. Locate your markdown file in File Explorer
2. Drag the file onto the down.edit window
3. The file will open in a new tab

#### Double-Click (After File Association)
1. Right-click any .md file in File Explorer
2. Select **Open with** → **Choose another app**
3. Select down.edit and check "Always use this app"
4. Now you can double-click any .md file to open it

### Tabbed Interface

down.edit supports multiple open files using tabs:

- **Open new tab:** Open additional files using any method above
- **Switch tabs:** Click on a tab or use `Ctrl+Tab` / `Ctrl+Shift+Tab`
- **Close tab:** Click the × on the tab or use `Ctrl+W`
- **Unsaved indicator:** Tabs with unsaved changes show a dot

### View Modes

down.edit offers three viewing modes:

| Mode | Description | Shortcut |
|------|-------------|----------|
| **Edit** | Full-width text editor only | `Ctrl+1` |
| **Split** | Side-by-side editor and preview | `Ctrl+2` |
| **Preview** | Read-only rendered preview only | `Ctrl+3` |

Toggle modes using the toolbar buttons or keyboard shortcuts.

### Theme Selection

down.edit supports three theme modes:

| Theme | Description |
|-------|-------------|
| **System** | Automatically matches your Windows theme setting |
| **Light** | White background with dark text |
| **Dark** | Dark background with light text |

To change the theme, click the theme toggle button in the toolbar. It cycles through System → Light → Dark.

### Document Outline

The outline panel shows all headings in your document:

1. Click the **Outline** button in the toolbar (or press `Ctrl+Shift+O`)
2. The outline appears on the left side
3. Click any heading to jump to that section
4. Click the × or press `Ctrl+Shift+O` again to close

### Supported Markdown Features

down.edit supports full GitHub Flavored Markdown:

| Feature | Syntax Example |
|---------|----------------|
| **Bold** | `**text**` or `__text__` |
| *Italic* | `*text*` or `_text_` |
| ***Bold & Italic*** | `***text***` |
| ~~Strikethrough~~ | `~~text~~` |
| `Code` | `` `code` `` |
| Links | `[text](url)` |
| Images | `![alt](url)` |
| Headers | `# H1` through `###### H6` |
| Bullet Lists | `- item` or `* item` |
| Numbered Lists | `1. item` |
| Task Lists | `- [ ] task` or `- [x] done` |
| Tables | See table syntax below |
| Blockquotes | `> quote` |
| Code Blocks | ` ``` language ` |
| Horizontal Rule | `---` or `***` |

#### Code Block Syntax Highlighting

Code blocks support 20+ programming languages including:
JavaScript, TypeScript, Python, Rust, Go, Java, C#, C++, C, PHP, Ruby, Swift, Kotlin, SQL, Bash, PowerShell, HTML, CSS, JSON, YAML, XML, Markdown, Dockerfile

Each code block includes:
- Language label in the header
- Copy button (click to copy code)
- Syntax highlighting

---

## Editing Markdown

### Creating a New File

1. Click the **New** button in the toolbar (or press `Ctrl+N`)
2. A new untitled tab opens with the editor ready
3. Start typing your markdown content

### Editing an Existing File

1. Open the file you want to edit
2. The editor appears on the left in Split mode
3. Make your changes - preview updates in real-time
4. Save with `Ctrl+S`

### Editor Features

#### Line Numbers
The editor displays line numbers on the left side that scroll with your content.

#### Cursor Position
The status bar shows your current line and column position (e.g., "Ln 5, Col 12").

#### Tab Key
Pressing Tab inserts 2 spaces for consistent indentation.

### Saving Files

#### Save (Ctrl+S)
Saves changes to the current file. If the file is new (untitled), you'll be prompted to choose a location.

#### Save As (Ctrl+Shift+S)
Saves the current file to a new location with a new name.

### Auto-Save

down.edit automatically saves your work to local storage:
- Auto-save triggers after 1 second of inactivity
- The status bar shows "Saving..." then "Auto-saved"
- Your work is restored if the app closes unexpectedly
- Auto-saved content expires after 24 hours

### Document History

down.edit keeps a history of your document versions:

1. Click the **History** button in the toolbar (or press `Ctrl+H`)
2. The history panel appears on the right
3. Click any version to restore it
4. History shows timestamps and content previews

Features:
- Stores up to 20 versions per document
- Versions saved automatically as you edit
- Click any version to restore that content
- History persists across sessions

### Unsaved Changes

- Tabs with unsaved changes show a dot indicator
- When closing a tab with unsaved changes, you'll be prompted to save
- The confirmation dialog asks if you want to save before closing

---

## Formatting Toolbar

The formatting toolbar appears below the tabs when editing a document. It provides quick access to common markdown formatting.

### Text Formatting

| Button | Action | Shortcut |
|--------|--------|----------|
| **B** | Bold | `Ctrl+B` |
| *I* | Italic | `Ctrl+I` |
| ~~S~~ | Strikethrough | `Ctrl+Shift+S` |
| `</>` | Inline Code | - |

### Headings

Click the **H** dropdown button to select heading levels 1-6. The selected heading style is applied to the current line.

### Lists

| Button | Action | Shortcut |
|--------|--------|----------|
| • | Bullet List | `Ctrl+L` |
| 1. | Numbered List | `Ctrl+Shift+L` |
| ☐ | Task List | - |

### Block Elements

| Button | Action | Shortcut |
|--------|--------|----------|
| " | Blockquote | `Ctrl+Q` |
| — | Horizontal Rule | - |

### Insert Elements

#### Link Dialog (Ctrl+K)
1. Click the link button or press `Ctrl+K`
2. Enter the link text (pre-filled if text is selected)
3. Enter the URL
4. Optionally add a title
5. Click **Insert**

#### Image Dialog (Ctrl+Shift+I)
Two methods to insert images:

**From URL:**
1. Click the image button or press `Ctrl+Shift+I`
2. Select the "From URL" tab
3. Enter the image URL
4. Add alt text and optional title
5. Click **Insert**

**From File:**
1. Click the image button
2. Select the "From File" tab
3. Click **Browse...** to select a local image
4. The image preview appears
5. Alt text is auto-filled from filename
6. Click **Insert** (image is embedded as base64)

#### Table Generator
1. Click the table button
2. A visual table editor appears with a 3×3 default table
3. Edit cells directly - first row is the header
4. Use **Add Row** / **Add Column** to expand
5. Use **Remove Row** / **Remove Column** to shrink
6. Set column alignment (Left/Center/Right) for each column
7. Preview the markdown output in real-time
8. Use Tab to move between cells, Arrow keys to navigate
9. Click **Insert Table** when done

#### Code Block Dialog (Ctrl+Shift+C)
1. Click the code block button or press `Ctrl+Shift+C`
2. Select a programming language from the dropdown
3. Click **Insert**
4. Cursor is placed inside the code block for immediate typing

---

## Exporting Documents

Click the **Export** dropdown in the toolbar to access export options.

### Export to PDF

1. Click **Export** → **Export to PDF**
2. Configure export options:
   - **Theme:** Professional, Academic, or Minimal color schemes
   - **Page Size:** Letter, Legal, Tabloid, or A4
   - **Margin:** 0.25 to 2 inches
   - **Font Size:** 8 to 16 pt
   - **Line Height:** 1.0 to 3.0
3. Click **Export PDF**
4. Choose save location

**PDF Themes:**
| Theme | Description |
|-------|-------------|
| Professional | Clean design with blue accent headings |
| Academic | Formal style with dark gray headings |
| Minimal | Simple black and gray styling |

### Export to Word (.docx)

1. Click **Export** → **Export to Word**
2. Configure export options:
   - **Page Size:** Letter, Legal, or A4
   - **Margin:** 0.25 to 2 inches
3. Click **Export Word**
4. Choose save location

**Word Export Features:**
- Heading levels mapped to Word heading styles
- Bold, italic, and code formatting preserved
- Bullet and numbered lists
- Blockquotes with left border styling
- Code blocks with monospace font
- Links formatted as blue underlined text

### Export to HTML

1. Click **Export** → **Export to HTML**
2. Configure export options:
   - **Style:** Standalone (embedded CSS), Minimal, or Raw (no styling)
   - **Include dark mode support:** Adds CSS for automatic dark/light theme
3. Click **Export HTML**
4. Choose save location

**HTML Export Features:**
- Self-contained HTML file with embedded CSS
- Responsive design for all screen sizes
- Optional dark mode via `prefers-color-scheme`
- All markdown features rendered properly

---

## Beautify & Utilities

### Markdown Beautifier

The Beautifier cleans up and formats your markdown for consistency.

1. Click the **Beautify** button in the toolbar
2. Configure options:
   - **Normalize headings:** Convert to ATX style (#)
   - **Normalize list markers:** Standardize to -, *, or +
   - **Fix spacing:** Ensure consistent blank lines
   - **Indent nested lists:** Use 2-space indentation
   - **Wrap long lines:** Wrap at specified column width
   - **Remove trailing spaces:** Clean up line endings
3. Click **Beautify**

### Formatting Hints Panel

Quick reference for markdown syntax:

1. Click the **Hints** button in the toolbar
2. The hints panel slides in from the right
3. Shows examples for:
   - Text formatting (bold, italic, strikethrough, code)
   - Headings
   - Lists (bullet, numbered, task)
   - Links and images
   - Blocks (quotes, code blocks, horizontal rules)
   - Tables
4. Click × to close

### Fullscreen Mode

Press `F11` to toggle fullscreen mode for distraction-free writing.

---

## Keyboard Shortcuts

### File Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+W` | Close current tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |

### View & Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Edit mode |
| `Ctrl+2` | Split mode |
| `Ctrl+3` | Preview mode |
| `Ctrl+Shift+O` | Toggle outline panel |
| `Ctrl+H` | Toggle history panel |
| `F11` | Toggle fullscreen |

### Text Formatting

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+Shift+S` | Strikethrough |
| `Ctrl+K` | Insert link |
| `Ctrl+Shift+I` | Insert image |
| `Ctrl+Shift+C` | Insert code block |
| `Ctrl+Q` | Blockquote |
| `Ctrl+L` | Bullet list |
| `Ctrl+Shift+L` | Numbered list |

---

## Troubleshooting

### File Won't Open

**Problem:** Clicking Open does nothing or shows an error.

**Solutions:**
1. Ensure the file has a .md, .markdown, or .txt extension
2. Check that the file isn't open in another program with exclusive lock
3. Verify the file encoding is UTF-8

### Markdown Doesn't Render Correctly

**Problem:** Some markdown elements don't display properly.

**Solutions:**
1. Check your markdown syntax against the GFM specification
2. Ensure there are blank lines before and after block elements
3. For tables, ensure proper pipe alignment
4. Use the Beautify feature to clean up formatting

### Theme Doesn't Match System

**Problem:** System theme doesn't change when Windows theme changes.

**Solutions:**
1. Restart down.edit after changing Windows theme
2. Manually select Light or Dark mode instead

### Export Fails

**Problem:** Export to Word, PDF, or HTML shows an error.

**Solutions:**
1. Ensure you have write permission to the destination folder
2. Close the destination file if it's open in another program
3. Check that images referenced in the document exist
4. Try a different export location

### Auto-Save Not Working

**Problem:** Changes aren't being auto-saved.

**Solutions:**
1. Check the status bar for "Auto-saved" indicator
2. Ensure the document has been modified (dirty state)
3. Wait at least 1 second after making changes
4. Check browser localStorage isn't full or blocked

### Application Crashes

**Problem:** down.edit closes unexpectedly.

**Solutions:**
1. Try opening the file in a text editor to check for corruption
2. Clear auto-save data and restart
3. Update to the latest version
4. Report the issue with steps to reproduce

---

## Getting Help

- **GitHub Issues:** Report bugs and request features
- **Documentation:** Full documentation at the project repository

---

*down.edit v1.0.0 - User Guide*
