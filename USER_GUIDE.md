# down.edit User Guide

Welcome to **down.edit**, a modern Markdown editor for Windows, macOS, and Linux. This guide covers everything you need to know to get the most out of the application.

---

## Table of Contents

1. [Getting Started](#getting-started)
   - [Installation](#installation)
   - [System Requirements](#system-requirements)
   - [First Launch](#first-launch)
2. [Interface Overview](#interface-overview)
   - [Toolbar](#toolbar)
   - [Tabs](#tabs)
   - [Editor & Preview](#editor--preview)
   - [Status Bar](#status-bar)
3. [Working with Files](#working-with-files)
   - [Creating New Files](#creating-new-files)
   - [Opening Files](#opening-files)
   - [Saving Files](#saving-files)
   - [Closing Files](#closing-files)
4. [Editing Markdown](#editing-markdown)
   - [View Modes](#view-modes)
   - [Formatting Toolbar](#formatting-toolbar)
   - [Using the Editor](#using-the-editor)
5. [Markdown Reference](#markdown-reference)
   - [Basic Formatting](#basic-formatting)
   - [Headings](#headings)
   - [Lists](#lists)
   - [Links & Images](#links--images)
   - [Code](#code)
   - [Tables](#tables)
   - [Other Elements](#other-elements)
6. [Navigation & Organization](#navigation--organization)
   - [Document Outline](#document-outline)
   - [Document History](#document-history)
   - [Markdown Hints](#markdown-hints)
7. [Exporting Documents](#exporting-documents)
   - [Export to PDF](#export-to-pdf)
   - [Export to Word](#export-to-word-docx)
   - [Export to HTML](#export-to-html)
8. [Customization](#customization)
   - [Themes](#themes)
   - [Resizing Panes](#resizing-panes)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

Download the latest release from the [GitHub Releases](https://github.com/VectorForgeAI/downedit/releases) page.

#### Windows
1. Download `down.edit-x.x.x-windows.exe`
2. Run the installer and follow the on-screen instructions
3. Launch down.edit from the Start menu or desktop shortcut

#### macOS
1. Download `down.edit-x.x.x-macos.dmg`
2. Open the DMG and drag down.edit to Applications
3. Launch from Applications or use Spotlight search

#### Linux
1. Download `down.edit-x.x.x-linux.AppImage`
2. Make executable: `chmod +x down.edit-*.AppImage`
3. Run the AppImage directly

### System Requirements

| Platform | Requirements |
|----------|--------------|
| Windows | Windows 10 version 1803+ (64-bit), WebView2 runtime |
| macOS | macOS 10.15 Catalina or later |
| Linux | GTK 3, WebKitGTK, modern distribution |
| All | 100 MB RAM, 50 MB disk space |

### First Launch

When you first open down.edit, you'll see the welcome screen with options to:

- **Create New File** - Start a new Markdown document
- **Open File** - Browse for an existing Markdown file
- **Drag & Drop** - Drop any `.md`, `.markdown`, or `.txt` file onto the window

---

## Interface Overview

### Toolbar

The main toolbar contains essential controls:

| Button | Description |
|--------|-------------|
| **Open** | Open an existing file |
| **Outline** | Toggle the document outline panel |
| **History** | Toggle the document history panel |
| **Beautify** | Clean up Markdown formatting |
| **Hints** | Show Markdown syntax reference |
| **Export** | Export to PDF, Word, or HTML |
| **Edit / Split / Preview** | Switch view modes |
| **Theme** | Cycle through Light, Dark, and System themes |

### Tabs

Each open document appears as a tab at the top of the window:

- **Click a tab** to switch to that document
- **Click the × button** to close a tab
- **Asterisk (*)** after the filename indicates unsaved changes
- Use `Ctrl+Tab` and `Ctrl+Shift+Tab` to navigate between tabs

### Editor & Preview

In **Split** mode, the window is divided into two panes:

- **Left pane (Editor)**: Where you write Markdown
  - Line numbers on the left side
  - Monospace font for easy editing
  
- **Right pane (Preview)**: Rendered Markdown output
  - Updates in real-time as you type
  - Full GFM styling with syntax highlighting

Drag the divider between panes to adjust their sizes.

### Status Bar

The status bar at the bottom shows:

- **Auto-save indicator**: Green dot when saved, amber when saving
- **Cursor position**: Current line and column number
- **Word count**: Total words in the document
- **Character count**: Total characters in the document

---

## Working with Files

### Creating New Files

To create a new Markdown file:

1. Press `Ctrl+N` or click **File → New**
2. A new tab opens with the name "Untitled-1.md"
3. Start typing your content
4. Save with `Ctrl+S` when ready

### Opening Files

There are several ways to open files:

#### Using the Open Dialog
1. Press `Ctrl+O` or click the **Open** button
2. Navigate to your file in the dialog
3. Select one or more files and click **Open**

#### Drag and Drop
1. Locate your file in File Explorer
2. Drag the file onto the down.edit window
3. The file opens in a new tab

#### Supported File Types
- `.md` - Markdown files
- `.markdown` - Markdown files (alternate extension)
- `.txt` - Plain text files

### Saving Files

#### Save (Ctrl+S)
- Saves the current file to its existing location
- If the file is new/untitled, opens the Save As dialog

#### Save As (Ctrl+Shift+S)
- Saves the file to a new location
- Allows you to change the filename

#### Auto-Save
down.edit automatically saves your work to local storage:
- Saves after 1 second of inactivity
- Restores your session when you reopen the app
- Auto-save data persists for 24 hours

### Closing Files

- **Single file**: Click the × on the tab or press `Ctrl+W`
- **All files**: Close the application window

If you have unsaved changes, you'll be prompted to save before closing.

---

## Editing Markdown

### View Modes

Switch between modes using the toolbar buttons or keyboard shortcuts:

| Mode | Description | Shortcut |
|------|-------------|----------|
| **Edit** | Full-width editor only | `Ctrl+1` |
| **Split** | Side-by-side editor and preview | `Ctrl+2` |
| **Preview** | Full-width preview only | `Ctrl+3` |

### Formatting Toolbar

The formatting toolbar appears below the main toolbar when a document is open:

| Button | Action | Shortcut |
|--------|--------|----------|
| **B** | Bold text | `Ctrl+B` |
| **I** | Italic text | `Ctrl+I` |
| **S** | Strikethrough | - |
| **`** | Inline code | - |
| **H▾** | Heading (dropdown for H1-H6) | - |
| **•** | Bullet list | `Ctrl+L` |
| **1.** | Numbered list | `Ctrl+Shift+L` |
| **☐** | Task list | - |
| **"** | Blockquote | `Ctrl+Q` |
| **—** | Horizontal rule | - |
| **🔗** | Insert link | `Ctrl+K` |
| **🖼** | Insert image | `Ctrl+Shift+I` |
| **📊** | Insert table | - |
| **</>** | Insert code block | `Ctrl+Shift+C` |

### Using the Editor

#### Selecting Text
- Click and drag to select text
- Double-click to select a word
- Triple-click to select a line
- `Ctrl+A` to select all

#### Formatting Selected Text
1. Select the text you want to format
2. Click a formatting button or use a shortcut
3. The Markdown syntax wraps your selection

For example, selecting "hello" and pressing `Ctrl+B` produces `**hello**`.

#### Inserting at Cursor
If no text is selected:
- Formatting buttons insert syntax at the cursor position
- Link/image/table dialogs open for input

---

## Markdown Reference

### Basic Formatting

| Format | Markdown | Result |
|--------|----------|--------|
| Bold | `**text**` | **text** |
| Italic | `*text*` | *text* |
| Bold & Italic | `***text***` | ***text*** |
| Strikethrough | `~~text~~` | ~~text~~ |
| Inline Code | `` `code` `` | `code` |

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

### Lists

#### Bullet Lists
```markdown
- Item one
- Item two
  - Nested item
  - Another nested item
- Item three
```

#### Numbered Lists
```markdown
1. First item
2. Second item
3. Third item
```

#### Task Lists
```markdown
- [ ] Incomplete task
- [x] Completed task
- [ ] Another task
```

### Links & Images

#### Links
```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Title")
```

#### Images
```markdown
![Alt text](image-url.jpg)
![Alt text](image-url.jpg "Image title")
```

### Code

#### Inline Code
```markdown
Use the `print()` function.
```

#### Code Blocks
````markdown
```python
def hello():
    print("Hello, World!")
```
````

Supported languages include: javascript, typescript, python, rust, c, cpp, java, csharp, go, php, ruby, swift, kotlin, sql, bash, powershell, json, yaml, html, css, and many more.

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|:--------:|---------:|
| Left     | Center   | Right    |
| aligned  | aligned  | aligned  |
```

Column alignment:
- `:---` - Left aligned (default)
- `:---:` - Center aligned
- `---:` - Right aligned

### Other Elements

#### Blockquotes
```markdown
> This is a blockquote.
> It can span multiple lines.
>
> > Nested blockquote
```

#### Horizontal Rules
```markdown
---
```

---

## Navigation & Organization

### Document Outline

The outline panel shows all headings in your document for quick navigation:

1. Click **Outline** in the toolbar or press `Ctrl+Shift+O`
2. The panel appears on the left side
3. Click any heading to jump to that section
4. Headings are indented based on their level

### Document History

down.edit automatically saves versions of your document as you work:

1. Click **History** in the toolbar or press `Ctrl+H`
2. The panel appears on the right side
3. Each entry shows the time and a preview
4. Click an entry to restore that version

History features:
- Saves automatically every 30 seconds of inactivity
- Stores up to 20 versions per document
- Versions are stored in local browser storage

### Markdown Hints

Need a quick syntax reminder? Use the hints panel:

1. Click the **?** (Hints) button in the toolbar
2. A floating panel shows common Markdown syntax
3. Click the × to close it

---

## Exporting Documents

### Export to PDF

Create professional PDF documents from your Markdown:

1. Click **Export** → **PDF**
2. Configure export options:

| Option | Description |
|--------|-------------|
| **Theme** | Professional, Academic, or Minimal styling |
| **Page Size** | Letter, Legal, Tabloid, or A4 |
| **Margins** | Page margins in inches |
| **Font Size** | Base font size in points |
| **Line Height** | Spacing between lines |

3. Click **Export PDF**
4. Choose a save location

### Export to Word (DOCX)

Create Word documents that preserve your formatting:

1. Click **Export** → **Word Document (.docx)**
2. Configure export options:

| Option | Description |
|--------|-------------|
| **Page Size** | Letter, Legal, or A4 |
| **Margins** | Page margins in inches |

3. Click **Export DOCX**
4. Choose a save location

Word export features:
- Headings map to Word heading styles
- Lists maintain proper formatting
- Code blocks use monospace font
- Inline formatting is preserved

### Export to HTML

Create standalone HTML files:

1. Click **Export** → **HTML**
2. Configure export options:

| Option | Description |
|--------|-------------|
| **Style** | Styled (with CSS) or Raw (no styling) |
| **Dark Mode** | Include dark mode support (auto-detects) |

3. Click **Export HTML**
4. Choose a save location

---

## Customization

### Themes

down.edit supports three theme modes:

| Theme | Description |
|-------|-------------|
| **System** | Follows your Windows theme setting |
| **Light** | White background with dark text |
| **Dark** | Dark background with light text |

To change themes:
- Click the theme button (☀/☽) in the toolbar
- Cycles through: System → Light → Dark → System

### Resizing Panes

In Split mode, adjust the editor and preview sizes:

1. Hover over the divider between panes
2. The cursor changes to a resize handle
3. Click and drag to adjust the split
4. Release to set the new size

---

## Keyboard Shortcuts

### File Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save file |
| `Ctrl+Shift+S` | Save file as |
| `Ctrl+W` | Close current tab |

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+Shift+O` | Toggle outline panel |
| `Ctrl+H` | Toggle history panel |

### View & Window

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Edit mode |
| `Ctrl+2` | Split mode |
| `Ctrl+3` | Preview mode |
| `F11` | Toggle fullscreen |
| `Ctrl++` or `Ctrl+=` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |

### Text Formatting (Editor Focused)

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+K` | Insert link |
| `Ctrl+Shift+I` | Insert image |
| `Ctrl+Shift+C` | Insert code block |
| `Ctrl+Q` | Blockquote |
| `Ctrl+L` | Bullet list |
| `Ctrl+Shift+L` | Numbered list |

### Export

| Shortcut | Action |
|----------|--------|
| `Ctrl+E` | Open export menu |
| `Ctrl+Shift+E` | Quick export (last used format) |

### Editor

| Shortcut | Action |
|----------|--------|
| `Tab` | Insert 2 spaces |
| `Ctrl+A` | Select all |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

---

## Troubleshooting

### File Won't Open

**Problem:** Clicking Open shows an error or does nothing.

**Solutions:**
- Ensure the file has a `.md`, `.markdown`, or `.txt` extension
- Check that the file isn't locked by another program
- Verify the file encoding is UTF-8

### Preview Doesn't Update

**Problem:** Changes in the editor don't appear in the preview.

**Solutions:**
- Ensure you're in Split or Preview mode
- Check for syntax errors in your Markdown
- Try switching to Edit mode and back to Split

### Markdown Doesn't Render Correctly

**Problem:** Some Markdown elements display incorrectly.

**Solutions:**
- Add blank lines before and after block elements (headings, code blocks, lists)
- Ensure table columns are properly aligned with pipes
- Check for unclosed formatting (missing closing `**` or `*`)

### Export Fails

**Problem:** Export shows an error.

**Solutions:**
- Ensure you have write permission to the destination folder
- Close the target file if it's open in another application
- Check that referenced images exist at their paths

### Auto-Save Data Lost

**Problem:** Previous session wasn't restored.

**Solutions:**
- Auto-save data expires after 24 hours
- Check that browser storage isn't being cleared
- Avoid using the app in private/incognito mode

### Application Won't Start

**Problem:** down.edit fails to launch.

**Solutions:**
- Ensure WebView2 runtime is installed (download from Microsoft)
- Try running as administrator
- Reinstall the application

---

## Getting Help

If you encounter issues not covered here:

- **GitHub Issues**: Report bugs and request features on the project repository
- **Documentation**: Check the DEVELOPMENT.md file for technical details

---

*down.edit v1.0.0 - User Guide*
