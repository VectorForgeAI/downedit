# MarkdownViewer - User Guide

## Welcome

MarkdownViewer is a lightweight Windows application for viewing, editing, and exporting Markdown files. It supports GitHub Flavored Markdown (GFM) with full syntax highlighting and exports to Microsoft Word (.docx) and PDF formats.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Phase I: Viewing Markdown](#phase-i-viewing-markdown)
3. [Phase II: Editing Markdown](#phase-ii-editing-markdown)
4. [Phase III: Exporting Documents](#phase-iii-exporting-documents)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

1. Download `MarkdownViewer_Setup.msi` from the releases page
2. Run the installer and follow the prompts
3. Launch MarkdownViewer from the Start menu or desktop shortcut

### System Requirements

- Windows 10 or later (64-bit)
- 100 MB disk space
- WebView2 Runtime (installed automatically if needed)

---

## Phase I: Viewing Markdown

### Opening Files

There are three ways to open a markdown file:

#### Using the File Menu
1. Click **File** → **Open** (or press `Ctrl+O`)
2. Browse to your markdown file (.md or .markdown)
3. Click **Open**

#### Drag and Drop
1. Locate your markdown file in File Explorer
2. Drag the file onto the MarkdownViewer window
3. The file will open in a new tab

#### Double-Click (After File Association)
1. Right-click any .md file in File Explorer
2. Select **Open with** → **Choose another app**
3. Select MarkdownViewer and check "Always use this app"
4. Now you can double-click any .md file to open it

### Tabbed Interface

MarkdownViewer supports multiple open files using tabs:

- **Open new tab:** Open additional files using any method above
- **Switch tabs:** Click on a tab or use `Ctrl+Tab`
- **Close tab:** Click the × on the tab or use `Ctrl+W`
- **Reorder tabs:** Drag and drop tabs to rearrange

### Theme Selection

MarkdownViewer supports three theme modes:

| Theme | Description |
|-------|-------------|
| **System** | Automatically matches your Windows theme setting |
| **Light** | White background with dark text |
| **Dark** | Dark background with light text |

To change the theme:
1. Click the theme toggle button (◐) in the toolbar
2. Or use **View** → **Theme** → Select your preference

### Document Outline

The outline panel shows all headings in your document:

1. Click **View** → **Show Outline** (or press `Ctrl+Shift+O`)
2. The outline appears on the left side
3. Click any heading to jump to that section

### Supported Markdown Features

MarkdownViewer supports full GitHub Flavored Markdown:

| Feature | Syntax Example |
|---------|----------------|
| **Bold** | `**text**` or `__text__` |
| *Italic* | `*text*` or `_text_` |
| ~~Strikethrough~~ | `~~text~~` |
| `Code` | `` `code` `` |
| Links | `[text](url)` |
| Images | `![alt](url)` |
| Headers | `# H1` through `###### H6` |
| Lists | `- item` or `1. item` |
| Task Lists | `- [ ] task` or `- [x] done` |
| Tables | See table syntax below |
| Blockquotes | `> quote` |
| Code Blocks | ` ``` language ` |
| Footnotes | `[^1]` and `[^1]: note` |

#### Code Block Syntax Highlighting

Code blocks support 50+ programming languages:

~~~markdown
```javascript
function hello() {
    console.log("Hello, World!");
}
```
~~~

Each code block includes:
- Line numbers
- Language label
- Copy button (click to copy code)

---

## Phase II: Editing Markdown

*Available after Phase II implementation*

### View Modes

MarkdownViewer offers three viewing modes when editing:

| Mode | Description |
|------|-------------|
| **View** | Read-only rendered preview |
| **Edit** | Full-width text editor |
| **Split** | Side-by-side editor and preview |

Toggle modes using the toolbar buttons or keyboard shortcuts.

### Creating a New File

1. Click **File** → **New** (or press `Ctrl+N`)
2. A new untitled tab opens in edit mode
3. Start typing your markdown content

### Editing an Existing File

1. Open the file you want to edit
2. Click the **Edit** button in the toolbar
3. Make your changes in the editor
4. Preview updates in real-time (in Split mode)

### Saving Files

#### Save (Ctrl+S)
Saves changes to the current file. If the file is new (untitled), you'll be prompted to choose a location.

#### Save As (Ctrl+Shift+S)
Saves the current file to a new location with a new name.

### Unsaved Changes

- Tabs with unsaved changes show an asterisk (*) after the filename
- When closing a tab with unsaved changes, you'll be asked to save
- When closing the application with unsaved changes, you'll be prompted for each file

### Formatting Toolbar

The toolbar provides quick buttons for common formatting:

| Button | Action | Shortcut |
|--------|--------|----------|
| **B** | Bold | `Ctrl+B` |
| *I* | Italic | `Ctrl+I` |
| 🔗 | Insert Link | `Ctrl+K` |
| H1 | Heading 1 | `Ctrl+1` |
| H2 | Heading 2 | `Ctrl+2` |
| H3 | Heading 3 | `Ctrl+3` |
| • | Bullet List | `Ctrl+Shift+U` |
| 1. | Numbered List | `Ctrl+Shift+O` |
| ☐ | Task List | `Ctrl+Shift+T` |
| `` | Code | `Ctrl+`` ` |
| "" | Blockquote | `Ctrl+Shift+.` |

---

## Phase III: Exporting Documents

*Available after Phase III implementation*

### Export to Microsoft Word (.docx)

1. Open the markdown file you want to export
2. Click **File** → **Export** → **Word Document (.docx)**
3. Choose export options (optional):
   - **Include Table of Contents:** Adds a TOC based on headings
   - **Embed Images:** Includes images in the document
4. Choose a save location and filename
5. Click **Export**

### Export to PDF

1. Open the markdown file you want to export
2. Click **File** → **Export** → **PDF Document**
3. Choose export options:
   - **Page Size:** A4 or Letter
   - **Margins:** Normal, Narrow, or Wide
   - **Include Page Numbers:** Footer with page numbers
   - **Include Table of Contents:** Adds a TOC
4. Choose a save location and filename
5. Click **Export**

### Export Options

| Option | Description |
|--------|-------------|
| Page Size | A4 (210×297mm) or Letter (8.5×11in) |
| Margins | Normal (1in), Narrow (0.5in), Wide (1.5in) |
| Table of Contents | Auto-generated from headings |
| Page Numbers | Bottom center of each page |
| Embed Images | Local images included in document |

### Batch Export

Export all open tabs at once:

1. Open all files you want to export
2. Click **File** → **Export All**
3. Choose format (DOCX or PDF)
4. Choose a destination folder
5. All files export with their original names

### Export Quality Notes

- **Headings:** Map to Word heading styles (H1→Heading 1, etc.)
- **Code Blocks:** Preserve syntax highlighting and monospace font
- **Tables:** Include borders and proper cell formatting
- **Images:** Embedded at original resolution
- **Links:** Preserved as clickable hyperlinks

---

## Keyboard Shortcuts

### General

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open file |
| `Ctrl+W` | Close current tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+Q` | Quit application |
| `F11` | Toggle fullscreen |

### Viewing

| Shortcut | Action |
|----------|--------|
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |
| `Ctrl+Shift+O` | Toggle outline panel |
| `Ctrl+F` | Find in document |

### Editing (Phase II)

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+K` | Insert link |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

### Export (Phase III)

| Shortcut | Action |
|----------|--------|
| `Ctrl+E` | Export dialog |
| `Ctrl+Shift+E` | Quick export (last format) |

---

## Troubleshooting

### File Won't Open

**Problem:** Clicking Open does nothing or shows an error.

**Solutions:**
1. Ensure the file has a .md or .markdown extension
2. Check that the file isn't open in another program with exclusive lock
3. Verify the file encoding is UTF-8

### Markdown Doesn't Render Correctly

**Problem:** Some markdown elements don't display properly.

**Solutions:**
1. Check your markdown syntax against the GFM specification
2. Ensure there are blank lines before and after block elements
3. For tables, ensure proper pipe alignment

### Theme Doesn't Match System

**Problem:** System theme doesn't change when Windows theme changes.

**Solutions:**
1. Restart MarkdownViewer after changing Windows theme
2. Manually select Light or Dark mode instead

### Export Fails

**Problem:** Export to Word or PDF shows an error.

**Solutions:**
1. Ensure you have write permission to the destination folder
2. Close the destination file if it's open in another program
3. Check that images referenced in the document exist

### Application Crashes

**Problem:** MarkdownViewer closes unexpectedly.

**Solutions:**
1. Try opening the file in a text editor to check for corruption
2. Update to the latest version
3. Report the issue with steps to reproduce

---

## Getting Help

- **GitHub Issues:** Report bugs and request features
- **Documentation:** Full documentation at the project repository

---

*MarkdownViewer v1.0.0 - User Guide*
