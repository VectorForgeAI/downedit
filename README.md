# down.edit

<p align="center">
  <img src="LOGO.png" alt="down.edit Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A modern, fast, and feature-rich Markdown editor for Windows</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#building-from-source">Build</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

**down.edit** is a lightweight, native Windows application for viewing, editing, and exporting Markdown files. Built with [Tauri](https://tauri.app/) for blazing-fast performance and a small footprint, it delivers a seamless editing experience with real-time preview, syntax highlighting, and professional export capabilities.

Whether you're writing documentation, taking notes, or creating content, down.edit provides all the tools you need in a clean, distraction-free interface.

---

## Features

### Viewing & Editing

| Feature | Description |
|---------|-------------|
| **Live Preview** | Real-time side-by-side Markdown preview as you type |
| **GitHub Flavored Markdown** | Full GFM support including tables, task lists, footnotes, and more |
| **Syntax Highlighting** | Code blocks with highlighting for 25+ programming languages |
| **Multiple View Modes** | Switch between Edit, Split, and Preview modes |
| **Tabbed Interface** | Work with multiple documents simultaneously |
| **Document Outline** | Navigate long documents with an interactive heading outline |
| **Theme Support** | Light, Dark, and System-adaptive themes |
| **Line Numbers** | Editor with line numbers and cursor position tracking |

### Formatting & Tools

| Feature | Description |
|---------|-------------|
| **Formatting Toolbar** | One-click formatting for bold, italic, headings, lists, and more |
| **Link Builder** | Insert links with a visual dialog |
| **Image Embedder** | Insert images from URL or local files with preview |
| **Table Generator** | Visual table builder with alignment controls |
| **Code Block Helper** | Insert code blocks with language selection |
| **Markdown Beautifier** | Clean up and normalize Markdown formatting |
| **Markdown Hints** | Built-in syntax reference panel |

### Export & Conversion

| Feature | Description |
|---------|-------------|
| **Export to PDF** | Professional PDFs with customizable themes, page sizes, and margins |
| **Export to Word** | Native .docx export with proper heading styles and formatting |
| **Export to HTML** | Standalone HTML files with optional dark mode support |
| **PDF Themes** | Professional, Academic, and Minimal styling options |

### Productivity

| Feature | Description |
|---------|-------------|
| **Auto-Save** | Automatic saving to local storage with visual indicator |
| **Document History** | Version history with restore capability |
| **Drag & Drop** | Open files by dragging onto the window |
| **Keyboard Shortcuts** | Comprehensive shortcuts for all common actions |
| **Word & Character Count** | Live statistics in the status bar |
| **Unsaved Indicators** | Visual cues for modified documents |

---

## Screenshots

<p align="center">
  <em>Split view with live preview</em>
</p>

<!-- Add screenshots here -->

---

## Installation

### Windows Installer

1. Download the latest release from the [Releases](../../releases) page
2. Run `down.edit_1.0.0_x64-setup.exe` or `down.edit_1.0.0_x64.msi`
3. Follow the installation wizard
4. Launch down.edit from the Start menu

### System Requirements

- **OS:** Windows 10 version 1803 or later (64-bit)
- **RAM:** 100 MB minimum
- **Disk:** 50 MB for installation
- **Runtime:** WebView2 (automatically installed if needed)

---

## Usage

### Opening Files

- **File Menu:** Click **Open** or press `Ctrl+O`
- **Drag & Drop:** Drag `.md`, `.markdown`, or `.txt` files onto the window
- **File Association:** Double-click Markdown files (after setting as default app)

### View Modes

| Mode | Description | Shortcut |
|------|-------------|----------|
| **Edit** | Full-width text editor | `Ctrl+1` |
| **Split** | Side-by-side editor and preview | `Ctrl+2` |
| **Preview** | Full-width rendered preview | `Ctrl+3` |

### Formatting

Use the formatting toolbar or keyboard shortcuts:

| Action | Shortcut |
|--------|----------|
| Bold | `Ctrl+B` |
| Italic | `Ctrl+I` |
| Insert Link | `Ctrl+K` |
| Insert Image | `Ctrl+Shift+I` |
| Code Block | `Ctrl+Shift+C` |
| Blockquote | `Ctrl+Q` |
| Bullet List | `Ctrl+L` |
| Numbered List | `Ctrl+Shift+L` |

### Exporting

1. Click the **Export** button in the toolbar
2. Choose your format (PDF, Word, or HTML)
3. Configure export options in the dialog
4. Select a save location

For a complete guide, see the [User Guide](USER_GUIDE.md).

---

## Keyboard Shortcuts

### File Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+W` | Close tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |

### Navigation & View

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+O` | Toggle outline panel |
| `Ctrl+H` | Toggle history panel |
| `Ctrl+1` | Edit mode |
| `Ctrl+2` | Split mode |
| `Ctrl+3` | Preview mode |
| `F11` | Toggle fullscreen |
| `Ctrl++` / `Ctrl+=` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |

### Export

| Shortcut | Action |
|----------|--------|
| `Ctrl+E` | Open export menu |
| `Ctrl+Shift+E` | Quick export (last format) |

---

## Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or later
- [Rust](https://www.rust-lang.org/tools/install) 1.70 or later
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Development

```bash
# Clone the repository
git clone https://github.com/yourusername/MarkdownViewer.git
cd MarkdownViewer/markdown-viewer

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Production Build

```bash
# Build for Windows
npm run tauri build
```

Build outputs:
- `src-tauri/target/release/down.edit.exe` - Standalone executable
- `src-tauri/target/release/bundle/msi/*.msi` - Windows installer
- `src-tauri/target/release/bundle/nsis/*.exe` - NSIS installer

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Framework** | [Tauri 2.x](https://tauri.app/) |
| **Backend** | Rust |
| **Frontend** | HTML, CSS, JavaScript |
| **Bundler** | [Vite](https://vitejs.dev/) |
| **Markdown** | [marked](https://marked.js.org/) |
| **Syntax Highlighting** | [highlight.js](https://highlightjs.org/) |
| **PDF Export** | [jsPDF](https://github.com/parallax/jsPDF) |
| **Word Export** | [docx](https://github.com/dolanmiu/docx) |

---

## Supported Languages (Syntax Highlighting)

down.edit provides syntax highlighting for code blocks in:

- JavaScript / TypeScript
- Python
- Rust
- C / C++
- Java / Kotlin
- C# / Go / Swift
- Ruby / PHP
- SQL / JSON / YAML
- HTML / CSS / SCSS
- Bash / Shell / PowerShell
- Markdown / Dockerfile
- And more...

---

## Project Structure

```
MarkdownViewer/
├── markdown-viewer/           # Main application
│   ├── src/                   # Frontend source
│   │   ├── main.js            # Core application logic
│   │   ├── styles.css         # Styling with theme support
│   │   └── index.html         # Main HTML entry
│   ├── src-tauri/             # Rust backend
│   │   ├── src/
│   │   │   ├── main.rs        # Entry point
│   │   │   └── lib.rs         # Tauri commands
│   │   ├── Cargo.toml         # Rust dependencies
│   │   └── tauri.conf.json    # Tauri configuration
│   ├── package.json           # NPM dependencies
│   └── vite.config.js         # Vite bundler config
├── .github/                   # GitHub workflows
│   └── workflows/
│       └── release.yml        # Automated releases
├── README.md                  # This file
├── USER_GUIDE.md              # User documentation
├── DEVELOPMENT.md             # Developer documentation
└── LOGO.png                   # Application logo
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Test your changes thoroughly
- Update documentation as needed
- Keep commits focused and atomic

---

## Roadmap

### Planned Features

- [ ] Find & Replace
- [ ] Spell Check integration
- [ ] Custom CSS for preview
- [ ] Document templates
- [ ] Recent files menu
- [ ] Print support
- [ ] Table of Contents generator
- [ ] CSV to Table conversion
- [ ] HTML to Markdown conversion

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Tauri](https://tauri.app/) - For the amazing cross-platform framework
- [marked](https://marked.js.org/) - For reliable Markdown parsing
- [highlight.js](https://highlightjs.org/) - For beautiful syntax highlighting
- [jsPDF](https://github.com/parallax/jsPDF) & [docx](https://github.com/dolanmiu/docx) - For export capabilities

---

<p align="center">
  Made with ❤️ for the Markdown community
</p>
