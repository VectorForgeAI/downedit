# down.edit PWA User Guide

The **down.edit Progressive Web App (PWA)** brings the full Markdown editing experience to your iPhone, iPad, Android device, or any web browser - with zero hosting costs and complete privacy.

---

## Getting Started

### Accessing the PWA

Visit: **https://vectorforgeai.github.io/downedit/pwa/**

The PWA works in any modern browser, but for the best experience on mobile devices, we recommend installing it to your home screen.

---

## Installing on iPhone/iPad

1. Open Safari and navigate to the PWA URL
2. Tap the **Share** button (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Give it a name (or keep "down.edit") and tap **Add**

The app icon will appear on your home screen. When you open it, it will run in full-screen mode like a native app.

### iOS Features
- Works completely offline after first visit
- Documents are stored locally in your browser
- Use Share Sheet to save files to iCloud Drive, send via email, or AirDrop
- Supports dark mode based on your system settings

---

## Installing on Android

1. Open Chrome and navigate to the PWA URL
2. You should see a prompt to **"Add to Home Screen"** or **"Install"**
3. Tap **Install** and confirm

Alternatively:
1. Tap the three-dot menu in Chrome
2. Select **"Add to Home Screen"** or **"Install App"**

### Android Features
- Works completely offline
- Can receive files shared from other apps
- Full-screen experience when launched from home screen
- Automatic updates when connected to internet

---

## Mobile Interface

The PWA uses a mobile-optimized layout:

```
┌────────────────────────┐
│       Toolbar          │  <- New, Open, Save, Export, Theme
├────────────────────────┤
│         Tabs           │  <- Switch between documents
├────────────────────────┤
│    Formatting Bar      │  <- Bold, Italic, Headings, Lists, etc.
├────────────────────────┤
│                        │
│    Preview Pane (TOP)  │  <- Rendered Markdown
│                        │
├────────────────────────┤
│     Resize Handle      │  <- Drag to adjust split
├────────────────────────┤
│                        │
│   Editor Pane (BOTTOM) │  <- Type Markdown here
│                        │
├────────────────────────┤
│      Status Bar        │  <- Word count, save status
└────────────────────────┘
```

### View Modes

| Mode | Description |
|------|-------------|
| **Edit** | Full-screen editor only |
| **Split** | Preview on top, editor on bottom (default) |
| **View** | Full-screen preview only |

Switch modes using the toggle buttons in the toolbar.

---

## Working with Files

### Creating a New Document

1. Tap the **+** (New) button in the toolbar
2. Start typing in the editor
3. Your document auto-saves to local storage

### Opening Files

1. Tap the **folder** (Open) button
2. iOS: Select from Files app (iCloud, On My iPhone, Dropbox, etc.)
3. Android: Select from your file manager
4. The file content loads into the editor

### Saving/Exporting Files

**Save to Device:**
1. Tap the **Save** button
2. On iOS: Share sheet opens - select "Save to Files"
3. On Android: File save dialog opens

**Export Formats:**
- **PDF** - Professional document with styling
- **Word (.docx)** - Microsoft Word compatible
- **HTML** - Standalone web page

---

## Document Storage

### How Documents are Stored

All documents are stored in **IndexedDB** within your browser:

| Storage Type | Details |
|--------------|---------|
| **Location** | Browser's local storage |
| **Persistence** | Survives app restarts |
| **Privacy** | Never leaves your device |
| **Backup** | Use Export to save copies |

### Documents List

Tap the grid icon (top-left) to see all saved documents:
- Sorted by last modified date
- Tap any document to open it
- Active document is highlighted

### Auto-Save

- Documents auto-save every second while typing
- Green dot in status bar = saved
- Yellow dot = saving in progress

---

## Formatting

### Toolbar Buttons

| Button | Action |
|--------|--------|
| **B** | Bold (`**text**`) |
| **I** | Italic (`*text*`) |
| **S** | Strikethrough (`~~text~~`) |
| **<>** | Inline code (`` `code` ``) |
| **H** | Headings dropdown |
| **-** | Bullet list |
| **1.** | Numbered list |
| **[ ]** | Task list |
| **"** | Blockquote |
| **---** | Horizontal rule |
| **Link** | Insert link |
| **Image** | Insert image |
| **Code** | Code block with language |

### Keyboard Shortcuts (with external keyboard)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + K` | Insert link |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + 1` | Edit mode |
| `Ctrl/Cmd + 2` | Split mode |
| `Ctrl/Cmd + 3` | Preview mode |

---

## Offline Support

The PWA works completely offline after the first visit:

1. **First Visit**: App files are downloaded and cached
2. **Subsequent Visits**: App loads instantly from cache
3. **Offline Use**: Full functionality without internet
4. **Updates**: New versions download automatically when online

### What Works Offline
- Creating and editing documents
- All formatting features
- PDF, Word, and HTML export
- Theme switching
- All documents you've created

### What Requires Internet
- Opening files from cloud services
- Sharing via cloud-based apps
- Initial installation

---

## Tips for Mobile Use

### Best Practices

1. **Rotate for more space**: Landscape mode gives more editor room
2. **Use Split mode**: See preview while typing
3. **External keyboard**: Full shortcuts available
4. **Regular exports**: Backup important documents to Files/cloud

### Known Limitations

| Limitation | Workaround |
|------------|------------|
| No direct file system access | Use Open/Save dialogs |
| Browser may clear storage under pressure | Export important documents |
| No spell-check on some browsers | Use external keyboard with spell-check |
| Limited drag & drop on mobile | Use Open button instead |

---

## Troubleshooting

### App not loading?

1. Check your internet connection (for first visit)
2. Try clearing browser cache and revisiting
3. Make sure JavaScript is enabled

### Documents missing?

1. Documents are browser-specific - check you're using same browser
2. If you cleared browser data, documents may be gone
3. Always export important documents as backup

### PWA not installing?

- **iOS**: Must use Safari (Chrome/Firefox don't support PWA install on iOS)
- **Android**: Use Chrome or Edge
- **Desktop**: Use Chrome, Edge, or Safari

### Export not working?

1. Check popup blocker settings
2. For PDF: make sure document has content
3. Try a different export format

---

## Privacy & Security

### Your Data

| Aspect | Details |
|--------|---------|
| **Storage** | Local browser storage only |
| **Cloud** | None - no data ever uploaded |
| **Analytics** | None - no tracking |
| **Accounts** | None required |

### Security Considerations

- Documents stored unencrypted in browser
- Shared device? Clear browser data when done
- Sensitive documents? Export and store securely

---

## Comparison: PWA vs Desktop App

| Feature | PWA | Desktop (Tauri) |
|---------|-----|-----------------|
| **Platforms** | Any browser, iOS, Android | Windows, macOS, Linux |
| **Install size** | ~2MB cached | ~15MB |
| **Offline** | Yes | Yes |
| **File access** | Via browser APIs | Native file system |
| **Performance** | Good | Excellent |
| **Auto-update** | Yes | Manual download |
| **Privacy** | 100% local | 100% local |

---

## Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/VectorForgeAI/downedit/issues)
- **Documentation**: [Full README](https://github.com/VectorForgeAI/downedit)

---

*down.edit PWA - Write freely. Own everything. Works everywhere.*
