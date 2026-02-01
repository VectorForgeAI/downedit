# down.edit

<p align="center">
  <img src="LOGO.png" alt="down.edit Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A modern, fast, and feature-rich Markdown editor for Windows, macOS, and Linux</strong>
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

**down.edit** is a lightweight, cross-platform application for viewing, editing, and exporting Markdown files. Built with [Tauri](https://tauri.app/) for blazing-fast performance and a small footprint, it delivers a seamless editing experience with real-time preview, syntax highlighting, and professional export capabilities. Available for Windows, macOS, and Linux.

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

### Import & Conversion

| Feature | Description |
|---------|-------------|
| **Import from Word** | Convert .docx files to Markdown with preserved formatting |
| **Smart Conversion** | Headings, lists, tables, links, and images are converted accurately |
| **Embedded Images** | Images from Word documents are embedded as base64 in Markdown |

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

Download the latest release from the [Releases](../../releases) page.

### Windows

1. Download `down.edit-x.x.x-windows.exe`
2. Run the installer and follow the wizard
3. Launch down.edit from the Start menu

**Requirements:** Windows 10 version 1803 or later (64-bit). WebView2 runtime is installed automatically if needed.

### macOS

1. Download `down.edit-x.x.x-macos.dmg`
2. Open the DMG file
3. Drag down.edit to your Applications folder
4. Launch from Applications or Spotlight

**Requirements:** macOS 10.15 (Catalina) or later.

### Linux

1. Download `down.edit-x.x.x-linux.AppImage`
2. Make it executable: `chmod +x down.edit-x.x.x-linux.AppImage`
3. Run the AppImage directly

**Requirements:** A modern Linux distribution with GTK 3 and WebKitGTK installed.

### System Requirements (All Platforms)

- **RAM:** 100 MB minimum
- **Disk:** 50 MB for installation

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
# Build for your current platform
npm run tauri build
```

Build outputs vary by platform:

**Windows:**
- `src-tauri/target/release/down.edit.exe` - Standalone executable
- `src-tauri/target/release/bundle/msi/*.msi` - MSI installer
- `src-tauri/target/release/bundle/nsis/*.exe` - NSIS installer

**macOS:**
- `src-tauri/target/release/bundle/dmg/*.dmg` - Disk image
- `src-tauri/target/release/bundle/macos/*.app` - Application bundle

**Linux:**
- `src-tauri/target/release/bundle/appimage/*.AppImage` - Portable AppImage
- `src-tauri/target/release/bundle/deb/*.deb` - Debian package

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
| **Word Import** | [mammoth](https://github.com/mwilliamson/mammoth.js) |
| **HTML to Markdown** | [turndown](https://github.com/mixmark-io/turndown) |

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

### Completed Features

- [x] Word to Markdown import (.docx)
- [x] HTML to Markdown conversion (via Word import)

### Planned Features

- [ ] Find & Replace
- [ ] Spell Check integration
- [ ] Custom CSS for preview
- [ ] Document templates
- [ ] Recent files menu
- [ ] Print support
- [ ] Table of Contents generator
- [ ] CSV to Table conversion
- [ ] PDF to Markdown import

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Tauri](https://tauri.app/) - For the amazing cross-platform framework
- [marked](https://marked.js.org/) - For reliable Markdown parsing
- [highlight.js](https://highlightjs.org/) - For beautiful syntax highlighting
- [jsPDF](https://github.com/parallax/jsPDF) & [docx](https://github.com/dolanmiu/docx) - For export capabilities
- [mammoth](https://github.com/mwilliamson/mammoth.js) & [turndown](https://github.com/mixmark-io/turndown) - For Word import capabilities

---

<p align="center">
  Made with ❤️ for the Markdown community
</p>
