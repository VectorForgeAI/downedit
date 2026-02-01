// down.edit - Main Application
import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import mermaid from 'mermaid';

// Import common languages for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import go from 'highlight.js/lib/languages/go';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import powershell from 'highlight.js/lib/languages/powershell';
import jsonLang from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import cssLang from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import dockerfile from 'highlight.js/lib/languages/dockerfile';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('rs', rust);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', c);
hljs.registerLanguage('java', java);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cs', csharp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rb', ruby);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('kt', kotlin);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('ps1', powershell);
hljs.registerLanguage('json', jsonLang);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', cssLang);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('dockerfile', dockerfile);

// Application State
const state = {
  tabs: [],
  activeTabId: null,
  theme: 'system',
  outlineVisible: false,
  historyVisible: false,
  viewMode: 'split', // 'edit', 'split', 'preview'
  hintsVisible: false,
  autoSaveTimer: null,
  historyTimer: null,
  newFileCounter: 1,
  zoomLevel: 100, // percentage
  lastExportFormat: 'pdf', // for quick export
};

// Configure marked with GFM
const marked = new Marked({
  gfm: true,
  breaks: true,
  pedantic: false,
});

// Custom renderer for code blocks with copy button
const renderer = {
  code(token) {
    const code = token.text || '';
    const language = (token.lang || '').toLowerCase();
    
    // Handle Mermaid diagrams
    if (language === 'mermaid') {
      const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
      return `<div class="mermaid-wrapper">
        <div class="mermaid-header">
          <span>diagram</span>
        </div>
        <div class="mermaid" id="${id}">${escapeHtml(code)}</div>
      </div>`;
    }
    
    const validLanguage = language && hljs.getLanguage(language) ? language : 'plaintext';
    let highlighted;
    try {
      highlighted = hljs.highlight(code, { language: validLanguage }).value;
    } catch {
      highlighted = escapeHtml(code);
    }

    const langLabel = language || 'text';
    const escapedCode = escapeHtml(code);

    return `<div class="code-block-wrapper">
      <div class="code-block-header">
        <span>${langLabel}</span>
        <button class="copy-btn" data-code="${escapedCode.replace(/"/g, '&quot;')}">Copy</button>
      </div>
      <pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>
    </div>`;
  },

  heading(token) {
    const text = token.text || '';
    const level = token.depth || 1;
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<h${level} id="${id}">${text}</h${level}>`;
  },

  listitem(token) {
    const text = token.text || '';
    const task = token.task;
    const checked = token.checked;
    if (task) {
      return `<li class="task-list-item"><input type="checkbox" ${checked ? 'checked' : ''} disabled>${text}</li>`;
    }
    return `<li>${text}</li>`;
  },

  list(token) {
    const body = token.items ? token.items.map(item => this.listitem(item)).join('') : '';
    const ordered = token.ordered;
    const start = token.start;
    const type = ordered ? 'ol' : 'ul';
    const startAttr = (ordered && start !== 1) ? ` start="${start}"` : '';
    const taskClass = body.includes('task-list-item') ? ' class="task-list"' : '';
    return `<${type}${startAttr}${taskClass}>${body}</${type}>`;
  }
};

marked.use({ renderer });

// Utility Functions
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Word and character count
function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countChars(text) {
  return text.length;
}

// Theme Management
function initTheme() {
  const saved = localStorage.getItem('mdviewer-theme');
  if (saved) {
    state.theme = saved;
  }
  applyTheme();
  updateThemeLabel();
}

function applyTheme() {
  const html = document.documentElement;
  if (state.theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    html.setAttribute('data-theme', state.theme);
  }
}

function cycleTheme() {
  const themes = ['system', 'light', 'dark'];
  const currentIndex = themes.indexOf(state.theme);
  state.theme = themes[(currentIndex + 1) % themes.length];
  localStorage.setItem('mdviewer-theme', state.theme);
  applyTheme();
  updateThemeLabel();
}

function updateThemeLabel() {
  const label = document.getElementById('theme-label');
  const labels = { system: 'System', light: 'Light', dark: 'Dark' };
  label.textContent = labels[state.theme];
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.theme === 'system') {
    applyTheme();
  }
});

// Zoom Management
function zoomIn() {
  if (state.zoomLevel < 200) {
    state.zoomLevel += 10;
    applyZoom();
  }
}

function zoomOut() {
  if (state.zoomLevel > 50) {
    state.zoomLevel -= 10;
    applyZoom();
  }
}

function resetZoom() {
  state.zoomLevel = 100;
  applyZoom();
}

function applyZoom() {
  const app = document.getElementById('app');
  app.style.fontSize = `${state.zoomLevel}%`;
  // Update status bar or show notification
  console.log(`Zoom: ${state.zoomLevel}%`);
}

// Fullscreen Toggle
async function toggleFullscreen() {
  try {
    const window = getCurrentWindow();
    const isFullscreen = await window.isFullscreen();
    await window.setFullscreen(!isFullscreen);
  } catch (err) {
    console.error('Failed to toggle fullscreen:', err);
    // Fallback for browsers
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
}

// Quick Export (uses last format)
async function quickExport() {
  switch (state.lastExportFormat) {
    case 'pdf':
      await exportToPdf();
      break;
    case 'docx':
      await exportToDocx();
      break;
    case 'html':
      await exportToHtml();
      break;
    default:
      openPdfDialog();
  }
}

// View Mode Management
function setViewMode(mode) {
  state.viewMode = mode;
  const container = document.getElementById('editor-container');
  container.setAttribute('data-mode', mode);

  // Update mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`btn-mode-${mode}`).classList.add('active');
}

// ==========================================
// Markdown Beautifier
// ==========================================

function openBeautifyDialog() {
  openDialog('beautify-dialog');
}

function beautifyMarkdown() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  // Get options
  const normalizeHeadings = document.getElementById('beautify-headings').checked;
  const normalizeLists = document.getElementById('beautify-lists').checked;
  const listMarker = document.getElementById('beautify-list-marker').value;
  const fixSpacing = document.getElementById('beautify-spacing').checked;
  const indentLists = document.getElementById('beautify-indent').checked;
  const wrapLines = document.getElementById('beautify-wrap').checked;
  const wrapWidth = parseInt(document.getElementById('beautify-wrap-width').value) || 80;
  const removeTrailing = document.getElementById('beautify-trailing').checked;

  let content = tab.content;
  let lines = content.split('\n');

  // Process each line
  lines = lines.map((line, index) => {
    // Remove trailing spaces
    if (removeTrailing) {
      line = line.replace(/\s+$/, '');
    }

    // Normalize headings to ATX style (# Heading)
    if (normalizeHeadings) {
      // Convert underline-style headings (Setext) to ATX
      // Check if next line is === or ---
      if (index < lines.length - 1) {
        const nextLine = lines[index + 1];
        if (/^=+\s*$/.test(nextLine)) {
          lines[index + 1] = ''; // Mark for removal
          line = '# ' + line.trim();
        } else if (/^-+\s*$/.test(nextLine) && line.trim() && !/^[-*+]\s/.test(line)) {
          lines[index + 1] = ''; // Mark for removal
          line = '## ' + line.trim();
        }
      }
      
      // Ensure space after # in headings
      line = line.replace(/^(#{1,6})([^\s#])/, '$1 $2');
    }

    // Normalize list markers
    if (normalizeLists) {
      // Unordered lists - preserve indentation
      line = line.replace(/^(\s*)[\*\+\-](\s)/, `$1${listMarker}$2`);
      
      // Ensure space after list marker
      line = line.replace(/^(\s*)([\*\+\-])([^\s])/, `$1$2 $3`);
    }

    // Indent nested lists properly (2 spaces per level)
    if (indentLists) {
      const listMatch = line.match(/^(\s*)([\*\+\-]|\d+\.)\s/);
      if (listMatch) {
        const currentIndent = listMatch[1].length;
        // Normalize to multiples of 2 spaces
        const normalizedIndent = Math.floor(currentIndent / 2) * 2;
        line = ' '.repeat(normalizedIndent) + line.trimStart();
      }
    }

    return line;
  });

  // Fix spacing - ensure consistent blank lines
  if (fixSpacing) {
    const processedLines = [];
    let prevLineEmpty = false;
    let inCodeBlock = false;

    for (const line of lines) {
      // Track code blocks
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
      }

      // Skip processing inside code blocks
      if (inCodeBlock) {
        processedLines.push(line);
        prevLineEmpty = false;
        continue;
      }

      const isEmpty = line.trim() === '';

      // Don't allow more than one consecutive empty line
      if (isEmpty && prevLineEmpty) {
        continue;
      }

      // Add blank line before headings (if not at start)
      if (/^#{1,6}\s/.test(line) && processedLines.length > 0 && !prevLineEmpty) {
        processedLines.push('');
      }

      // Add blank line after headings
      if (processedLines.length > 0) {
        const prevLine = processedLines[processedLines.length - 1];
        if (/^#{1,6}\s/.test(prevLine) && !isEmpty && line.trim() !== '') {
          processedLines.push('');
        }
      }

      processedLines.push(line);
      prevLineEmpty = isEmpty;
    }

    lines = processedLines;
  }

  // Wrap long lines
  if (wrapLines) {
    const wrappedLines = [];
    let inCodeBlock = false;

    for (const line of lines) {
      // Track code blocks - don't wrap inside them
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        wrappedLines.push(line);
        continue;
      }

      if (inCodeBlock) {
        wrappedLines.push(line);
        continue;
      }

      // Don't wrap headings, lists, blockquotes, or short lines
      if (/^#{1,6}\s/.test(line) || /^\s*[\*\+\-]\s/.test(line) || 
          /^\s*\d+\.\s/.test(line) || /^>\s/.test(line) ||
          line.length <= wrapWidth) {
        wrappedLines.push(line);
        continue;
      }

      // Wrap long paragraph lines
      const words = line.split(' ');
      let currentLine = '';

      for (const word of words) {
        if (currentLine.length + word.length + 1 <= wrapWidth) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine);
          }
          currentLine = word;
        }
      }
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    }

    lines = wrappedLines;
  }

  // Filter out empty lines that were marked for removal (from Setext heading conversion)
  lines = lines.filter((line, index) => {
    // Keep the line unless it was marked as empty during Setext conversion
    return true;
  });

  // Update the content
  const beautifiedContent = lines.join('\n');
  
  // Update editor
  const editor = document.getElementById('editor');
  if (editor) {
    editor.value = beautifiedContent;
    tab.content = beautifiedContent;
    tab.modified = true;
    updateTabUI(tab);
    updatePreview();
    saveTabState();
  }

  closeDialog('beautify-dialog');
}

// ==========================================
// Word to Markdown Import
// ==========================================

// Initialize Turndown service with custom rules
function createTurndownService() {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined'
  });

  // Add custom rule for tables (turndown doesn't handle tables by default)
  turndownService.addRule('table', {
    filter: 'table',
    replacement: function(content, node) {
      const rows = node.querySelectorAll('tr');
      if (rows.length === 0) return '';

      let markdown = '\n';
      let headerProcessed = false;

      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('th, td');
        const cellContents = Array.from(cells).map(cell =>
          cell.textContent.trim().replace(/\|/g, '\\|').replace(/\n/g, ' ')
        );

        markdown += '| ' + cellContents.join(' | ') + ' |\n';

        // Add header separator after first row
        if (rowIndex === 0 && !headerProcessed) {
          markdown += '| ' + cellContents.map(() => '---').join(' | ') + ' |\n';
          headerProcessed = true;
        }
      });

      return markdown + '\n';
    }
  });

  // Handle strikethrough
  turndownService.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: function(content) {
      return '~~' + content + '~~';
    }
  });

  // Handle task lists
  turndownService.addRule('taskListItem', {
    filter: function(node) {
      return node.nodeName === 'LI' && node.querySelector('input[type="checkbox"]');
    },
    replacement: function(content, node) {
      const checkbox = node.querySelector('input[type="checkbox"]');
      const checked = checkbox && checkbox.checked ? '[x]' : '[ ]';
      const text = content.replace(/^\s*\[[ x]\]\s*/i, '').trim();
      return '- ' + checked + ' ' + text + '\n';
    }
  });

  return turndownService;
}

// Convert Word document to Markdown
async function convertWordToMarkdown(arrayBuffer, options = {}) {
  const {
    preserveImages = true,
    styleMap = []
  } = options;

  // Default style mappings for better conversion
  const defaultStyleMap = [
    "p[style-name='Title'] => h1",
    "p[style-name='Heading 1'] => h1",
    "p[style-name='Heading 2'] => h2",
    "p[style-name='Heading 3'] => h3",
    "p[style-name='Heading 4'] => h4",
    "p[style-name='Heading 5'] => h5",
    "p[style-name='Heading 6'] => h6",
    ...styleMap
  ];

  // Mammoth options
  const mammothOptions = {
    styleMap: defaultStyleMap
  };

  // If preserving images, include image conversion
  if (preserveImages) {
    mammothOptions.convertImage = mammoth.images.imgElement(function(image) {
      return image.read('base64').then(function(imageBuffer) {
        const mimeType = image.contentType || 'image/png';
        return {
          src: `data:${mimeType};base64,${imageBuffer}`
        };
      });
    });
  }

  // Convert DOCX to HTML using Mammoth
  const result = await mammoth.convertToHtml({ arrayBuffer }, mammothOptions);
  const html = result.value;
  const messages = result.messages;

  // Log any warnings from mammoth
  if (messages.length > 0) {
    console.log('Word conversion messages:', messages);
  }

  // Convert HTML to Markdown using Turndown
  const turndownService = createTurndownService();
  let markdown = turndownService.turndown(html);

  // Post-process markdown to clean up common issues
  markdown = postProcessMarkdown(markdown);

  return {
    markdown,
    warnings: messages.map(m => m.message)
  };
}

// Post-process markdown to clean up formatting
function postProcessMarkdown(markdown) {
  let result = markdown;

  // Remove excessive blank lines (more than 2 consecutive)
  result = result.replace(/\n{4,}/g, '\n\n\n');

  // Ensure headings have blank lines before and after
  result = result.replace(/([^\n])\n(#{1,6} )/g, '$1\n\n$2');
  result = result.replace(/(#{1,6} [^\n]+)\n([^\n#])/g, '$1\n\n$2');

  // Clean up list formatting
  result = result.replace(/\n{3,}(-|\*|\d+\.)/g, '\n\n$1');

  // Remove trailing whitespace from lines
  result = result.split('\n').map(line => line.trimEnd()).join('\n');

  // Ensure file ends with single newline
  result = result.trimEnd() + '\n';

  return result;
}

// Open Word file and convert to Markdown
async function importFromWord() {
  try {
    // Show file dialog for Word documents
    const filePath = await invoke('open_word_file_dialog');

    if (!filePath) {
      return; // User cancelled
    }

    // Show loading state
    showImportProgress('Reading Word document...');

    // Read the file as base64
    const base64Data = await invoke('read_file_as_base64', { path: filePath });

    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;

    // Update progress
    showImportProgress('Converting to Markdown...');

    // Get conversion options from dialog (if shown) or use defaults
    const options = {
      preserveImages: document.getElementById('import-preserve-images')?.checked ?? true
    };

    // Convert to Markdown
    const result = await convertWordToMarkdown(arrayBuffer, options);

    // Get filename for the new tab
    const originalFileName = await invoke('get_file_name', { path: filePath });
    const newFileName = originalFileName.replace(/\.(docx?|doc)$/i, '.md');

    // Create a new tab with the converted content
    createTab(null, newFileName, result.markdown, true);

    // Hide progress
    hideImportProgress();

    // Show warnings if any
    if (result.warnings.length > 0) {
      console.log('Import warnings:', result.warnings);
    }

  } catch (err) {
    hideImportProgress();
    console.error('Error importing Word document:', err);
    alert(`Failed to import Word document: ${err}`);
  }
}

// Show import progress indicator
function showImportProgress(message) {
  let progressEl = document.getElementById('import-progress');
  if (!progressEl) {
    progressEl = document.createElement('div');
    progressEl.id = 'import-progress';
    progressEl.className = 'import-progress';
    progressEl.innerHTML = `
      <div class="import-progress-content">
        <div class="import-spinner"></div>
        <span class="import-message"></span>
      </div>
    `;
    document.body.appendChild(progressEl);
  }
  progressEl.querySelector('.import-message').textContent = message;
  progressEl.classList.remove('hidden');
}

// Hide import progress indicator
function hideImportProgress() {
  const progressEl = document.getElementById('import-progress');
  if (progressEl) {
    progressEl.classList.add('hidden');
  }
}

// Hints Panel Management
function toggleHints() {
  state.hintsVisible = !state.hintsVisible;
  document.getElementById('hints-panel').classList.toggle('hidden', !state.hintsVisible);
}

function closeHints() {
  state.hintsVisible = false;
  document.getElementById('hints-panel').classList.add('hidden');
}

// About Dialog
function showAboutDialog() {
  document.getElementById('about-dialog').classList.remove('hidden');
}

// Tab Management
function createTab(filePath, fileName, content, isNew = false) {
  const id = generateId();
  const tab = {
    id,
    filePath,
    fileName,
    content,
    originalContent: content,
    scrollPosition: 0,
    editorScrollPosition: 0,
    isDirty: isNew,
    isNew,
  };

  state.tabs.push(tab);
  renderTabs();
  activateTab(id);

  return tab;
}

function activateTab(id) {
  // Save current tab state
  if (state.activeTabId) {
    const currentTab = state.tabs.find(t => t.id === state.activeTabId);
    if (currentTab) {
      const editor = document.getElementById('editor');
      const viewer = document.getElementById('viewer');
      if (editor) currentTab.editorScrollPosition = editor.scrollTop;
      if (viewer) currentTab.scrollPosition = viewer.scrollTop;
      currentTab.content = editor.value;
    }
  }

  state.activeTabId = id;
  renderTabs();
  renderContent();
  updateOutline();
  updateStatusBar();
  showEditorView();
}

function closeTab(id, force = false) {
  const tab = state.tabs.find(t => t.id === id);
  if (!tab) return;

  // Check for unsaved changes
  if (tab.isDirty && !force) {
    handleUnsavedChanges(tab, () => closeTab(id, true));
    return;
  }

  const index = state.tabs.findIndex(t => t.id === id);
  state.tabs.splice(index, 1);

  if (state.tabs.length === 0) {
    state.activeTabId = null;
    showWelcome();
  } else if (id === state.activeTabId) {
    const newIndex = Math.min(index, state.tabs.length - 1);
    activateTab(state.tabs[newIndex].id);
  }

  renderTabs();
}

async function handleUnsavedChanges(tab, callback) {
  const shouldSave = await invoke('confirm_dialog', {
    title: 'Unsaved Changes',
    message: `Do you want to save changes to "${tab.fileName}"?`
  });

  if (shouldSave) {
    await saveFile();
  }
  callback();
}

function renderTabs() {
  const tabsContainer = document.getElementById('tabs');

  if (state.tabs.length === 0) {
    tabsContainer.innerHTML = '';
    return;
  }

  tabsContainer.innerHTML = state.tabs.map(tab => `
    <div class="tab ${tab.id === state.activeTabId ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}" data-id="${tab.id}">
      <span class="tab-title" title="${tab.filePath || tab.fileName}">${tab.fileName}</span>
      <button class="tab-close" data-id="${tab.id}" title="Close">×</button>
    </div>
  `).join('');

  tabsContainer.querySelectorAll('.tab').forEach(tabEl => {
    tabEl.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close')) {
        activateTab(tabEl.dataset.id);
      }
    });
  });

  tabsContainer.querySelectorAll('.tab-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(btn.dataset.id);
    });
  });
}

// Content Rendering
function showWelcome() {
  document.getElementById('welcome').classList.remove('hidden');
  document.getElementById('editor-container').classList.add('hidden');
  document.getElementById('status-bar').classList.add('hidden');
  document.getElementById('outline-content').innerHTML = '';
  hideFormattingToolbar();
}

function showEditorView() {
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('editor-container').classList.remove('hidden');
  document.getElementById('status-bar').classList.remove('hidden');
  showFormattingToolbar();
}

function renderContent() {
  if (!state.activeTabId) {
    showWelcome();
    return;
  }

  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  const editor = document.getElementById('editor');
  const viewer = document.getElementById('viewer');

  // Set editor content
  editor.value = tab.content;
  editor.scrollTop = tab.editorScrollPosition || 0;

  // Update line numbers
  updateLineNumbers();
  syncLineNumbersScroll();
  updateCursorPosition();

  // Render preview
  renderPreview();

  // Restore viewer scroll position
  viewer.scrollTop = tab.scrollPosition || 0;

  // Add copy button functionality
  viewer.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copyCode(btn));
  });
}

async function renderPreview() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  const viewer = document.getElementById('viewer');
  viewer.innerHTML = marked.parse(tab.content);

  // Re-add copy button functionality
  viewer.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copyCode(btn));
  });
  
  // Render any Mermaid diagrams
  const mermaidElements = viewer.querySelectorAll('.mermaid');
  if (mermaidElements.length > 0) {
    try {
      await mermaid.run({ nodes: mermaidElements });
    } catch (err) {
      console.error('Mermaid rendering error:', err);
    }
  }
}

async function copyCode(btn) {
  const code = btn.dataset.code
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

  try {
    await navigator.clipboard.writeText(code);
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// Status Bar
function updateStatusBar() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  const wordCount = countWords(tab.content);
  const charCount = countChars(tab.content);

  document.getElementById('status-wordcount').textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
  document.getElementById('status-charcount').textContent = `${charCount} character${charCount !== 1 ? 's' : ''}`;
}

function showAutoSaveStatus(saving = false) {
  const indicator = document.querySelector('.autosave-indicator');
  const text = document.getElementById('autosave-text');

  if (saving) {
    indicator.classList.add('saving');
    text.textContent = 'Saving...';
  } else {
    indicator.classList.remove('saving');
    text.textContent = 'Auto-saved';
  }
}

// Auto-save to localStorage
function autoSave() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  showAutoSaveStatus(true);

  // Save to localStorage
  const autoSaveData = {
    tabs: state.tabs.map(t => ({
      id: t.id,
      fileName: t.fileName,
      content: t.content,
      filePath: t.filePath,
      isNew: t.isNew,
    })),
    activeTabId: state.activeTabId,
    timestamp: Date.now(),
  };

  localStorage.setItem('mdviewer-autosave', JSON.stringify(autoSaveData));

  // Also save to history on auto-save
  saveToHistory(tab);

  setTimeout(() => showAutoSaveStatus(false), 500);
}

function loadAutoSave() {
  const saved = localStorage.getItem('mdviewer-autosave');
  if (!saved) return false;

  try {
    const data = JSON.parse(saved);
    // Only restore if less than 24 hours old
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('mdviewer-autosave');
      return false;
    }

    data.tabs.forEach(t => {
      createTab(t.filePath, t.fileName, t.content, t.isNew);
    });

    if (data.activeTabId && state.tabs.find(t => t.id === data.activeTabId)) {
      activateTab(data.activeTabId);
    }

    return state.tabs.length > 0;
  } catch {
    return false;
  }
}

// Outline
function updateOutline() {
  const outlineContent = document.getElementById('outline-content');
  const viewer = document.getElementById('viewer');

  if (!state.activeTabId) {
    outlineContent.innerHTML = '';
    return;
  }

  const headings = viewer.querySelectorAll('h1, h2, h3, h4, h5, h6');

  if (headings.length === 0) {
    outlineContent.innerHTML = '<p style="padding: 16px; color: var(--text-muted); font-size: 13px;">No headings found</p>';
    return;
  }

  outlineContent.innerHTML = Array.from(headings).map(h => {
    const level = parseInt(h.tagName[1]);
    const text = h.textContent;
    const id = h.id;
    return `<button class="outline-item" data-level="${level}" data-id="${id}">${text}</button>`;
  }).join('');

  outlineContent.querySelectorAll('.outline-item').forEach(item => {
    item.addEventListener('click', () => {
      const heading = document.getElementById(item.dataset.id);
      if (heading) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function toggleOutline() {
  const panel = document.getElementById('outline-panel');
  state.outlineVisible = !state.outlineVisible;
  panel.classList.toggle('hidden', !state.outlineVisible);
}

function toggleHistory() {
  const panel = document.getElementById('history-panel');
  state.historyVisible = !state.historyVisible;
  panel.classList.toggle('hidden', !state.historyVisible);
  if (state.historyVisible) {
    renderHistory();
  }
}

// Line Numbers
function updateLineNumbers() {
  const editor = document.getElementById('editor');
  const lineNumbers = document.getElementById('line-numbers');

  const lines = editor.value.split('\n').length;
  const numbers = [];
  for (let i = 1; i <= lines; i++) {
    numbers.push(i);
  }
  lineNumbers.innerHTML = numbers.join('<br>');
}

function syncLineNumbersScroll() {
  const editor = document.getElementById('editor');
  const lineNumbers = document.getElementById('line-numbers');
  lineNumbers.scrollTop = editor.scrollTop;
}

// Cursor Position Tracking
function updateCursorPosition() {
  const editor = document.getElementById('editor');
  const statusLine = document.getElementById('status-line');

  const text = editor.value.substring(0, editor.selectionStart);
  const lines = text.split('\n');
  const lineNumber = lines.length;
  const columnNumber = lines[lines.length - 1].length + 1;

  statusLine.textContent = `Ln ${lineNumber}, Col ${columnNumber}`;
}

// Document History Management
function getHistoryKey(tabId) {
  return `mdviewer-history-${tabId}`;
}

function saveToHistory(tab) {
  if (!tab || !tab.content.trim()) return;

  const key = getHistoryKey(tab.id);
  let history = [];

  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      history = JSON.parse(saved);
    }
  } catch {
    history = [];
  }

  // Don't save if content hasn't changed from the last entry
  if (history.length > 0 && history[0].content === tab.content) {
    return;
  }

  // Add new entry at the beginning
  history.unshift({
    content: tab.content,
    timestamp: Date.now(),
    preview: tab.content.substring(0, 100).replace(/\n/g, ' ').trim()
  });

  // Keep only last 20 versions
  history = history.slice(0, 20);

  localStorage.setItem(key, JSON.stringify(history));
}

function loadHistory(tabId) {
  const key = getHistoryKey(tabId);
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore errors
  }
  return [];
}

function restoreFromHistory(historyEntry) {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab || !historyEntry) return;

  const editor = document.getElementById('editor');
  tab.content = historyEntry.content;
  editor.value = tab.content;
  tab.isDirty = tab.content !== tab.originalContent;

  renderTabs();
  renderPreview();
  updateOutline();
  updateStatusBar();
  updateLineNumbers();

  // Close history panel
  toggleHistory();
}

function renderHistory() {
  const historyContent = document.getElementById('history-content');

  if (!state.activeTabId) {
    historyContent.innerHTML = '<p class="history-empty">No document selected</p>';
    return;
  }

  const history = loadHistory(state.activeTabId);

  if (history.length === 0) {
    historyContent.innerHTML = '<p class="history-empty">No history available yet.<br>History is saved automatically as you edit.</p>';
    return;
  }

  historyContent.innerHTML = history.map((entry, index) => {
    const date = new Date(entry.timestamp);
    const timeStr = formatHistoryTime(date);
    const preview = entry.preview || '(empty)';

    return `
      <div class="history-item" data-index="${index}">
        <span class="history-item-time">${timeStr}</span>
        <span class="history-item-preview">${escapeHtml(preview)}</span>
      </div>
    `;
  }).join('');

  historyContent.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      const history = loadHistory(state.activeTabId);
      if (history[index]) {
        restoreFromHistory(history[index]);
      }
    });
  });
}

function formatHistoryTime(date) {
  const now = new Date();
  const diff = now - date;

  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  // More than a day
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ==========================================
// PHASE III: Formatting Toolbar Functions
// ==========================================

// Formatting toolbar visibility
function showFormattingToolbar() {
  document.getElementById('formatting-toolbar').classList.remove('hidden');
}

function hideFormattingToolbar() {
  document.getElementById('formatting-toolbar').classList.add('hidden');
}

// Text manipulation utilities
function getEditorSelection() {
  const editor = document.getElementById('editor');
  return {
    start: editor.selectionStart,
    end: editor.selectionEnd,
    text: editor.value.substring(editor.selectionStart, editor.selectionEnd),
    before: editor.value.substring(0, editor.selectionStart),
    after: editor.value.substring(editor.selectionEnd)
  };
}

function setEditorContent(content, selectionStart, selectionEnd) {
  const editor = document.getElementById('editor');
  editor.value = content;
  editor.selectionStart = selectionStart;
  editor.selectionEnd = selectionEnd;
  editor.focus();
  handleEditorInput();
}

function wrapSelection(prefix, suffix = prefix) {
  const sel = getEditorSelection();
  const newContent = sel.before + prefix + sel.text + suffix + sel.after;
  const newStart = sel.start + prefix.length;
  const newEnd = sel.end + prefix.length;
  setEditorContent(newContent, newStart, newEnd);
}

function insertAtCursor(text) {
  const sel = getEditorSelection();
  const newContent = sel.before + text + sel.after;
  const newPos = sel.start + text.length;
  setEditorContent(newContent, newPos, newPos);
}

function insertAtLineStart(prefix) {
  const editor = document.getElementById('editor');
  const sel = getEditorSelection();

  // Find the start of the current line
  let lineStart = sel.start;
  while (lineStart > 0 && editor.value[lineStart - 1] !== '\n') {
    lineStart--;
  }

  // Check if line already has the prefix
  const lineText = editor.value.substring(lineStart, sel.start);
  if (lineText.startsWith(prefix)) {
    // Remove prefix
    const newContent = editor.value.substring(0, lineStart) +
                      editor.value.substring(lineStart + prefix.length);
    setEditorContent(newContent, sel.start - prefix.length, sel.end - prefix.length);
  } else {
    // Add prefix
    const newContent = editor.value.substring(0, lineStart) + prefix + editor.value.substring(lineStart);
    setEditorContent(newContent, sel.start + prefix.length, sel.end + prefix.length);
  }
}

// Formatting functions
function formatBold() {
  wrapSelection('**');
}

function formatItalic() {
  wrapSelection('*');
}

function formatStrikethrough() {
  wrapSelection('~~');
}

function formatInlineCode() {
  wrapSelection('`');
}

function formatHeading(level) {
  const prefix = '#'.repeat(level) + ' ';
  const editor = document.getElementById('editor');
  const sel = getEditorSelection();

  // Find the start of the current line
  let lineStart = sel.start;
  while (lineStart > 0 && editor.value[lineStart - 1] !== '\n') {
    lineStart--;
  }

  // Find the end of the current line
  let lineEnd = sel.end;
  while (lineEnd < editor.value.length && editor.value[lineEnd] !== '\n') {
    lineEnd++;
  }

  const lineText = editor.value.substring(lineStart, lineEnd);

  // Remove existing heading prefix if any
  const headingMatch = lineText.match(/^#{1,6}\s*/);
  let newLineText = lineText;
  let adjustment = 0;

  if (headingMatch) {
    newLineText = lineText.substring(headingMatch[0].length);
    adjustment = -headingMatch[0].length;
  }

  // Add new heading prefix
  newLineText = prefix + newLineText;
  adjustment += prefix.length;

  const newContent = editor.value.substring(0, lineStart) + newLineText + editor.value.substring(lineEnd);
  setEditorContent(newContent, sel.start + adjustment, sel.end + adjustment);

  // Close the heading dropdown
  document.getElementById('heading-menu').classList.add('hidden');
}

function formatBulletList() {
  insertAtLineStart('- ');
}

function formatNumberedList() {
  insertAtLineStart('1. ');
}

function formatTaskList() {
  insertAtLineStart('- [ ] ');
}

function formatBlockquote() {
  insertAtLineStart('> ');
}

function formatHorizontalRule() {
  const sel = getEditorSelection();
  const needsNewlineBefore = sel.start > 0 && sel.before[sel.before.length - 1] !== '\n';
  const hr = (needsNewlineBefore ? '\n' : '') + '\n---\n\n';
  insertAtCursor(hr);
}

// Dialog management
function openDialog(dialogId) {
  document.getElementById(dialogId).classList.remove('hidden');
  const firstInput = document.querySelector(`#${dialogId} input`);
  if (firstInput) {
    firstInput.focus();
  }
}

function closeDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  dialog.classList.add('hidden');
  // Clear inputs
  dialog.querySelectorAll('input').forEach(input => {
    input.value = '';
  });
  document.getElementById('editor').focus();
}

function closeAllDialogs() {
  document.querySelectorAll('.modal-overlay').forEach(dialog => {
    dialog.classList.add('hidden');
    dialog.querySelectorAll('input').forEach(input => {
      input.value = '';
    });
  });
}

// Link dialog
function openLinkDialog() {
  const sel = getEditorSelection();
  if (sel.text) {
    document.getElementById('link-text').value = sel.text;
  }
  openDialog('link-dialog');
}

function insertLink() {
  const text = document.getElementById('link-text').value || 'link text';
  const url = document.getElementById('link-url').value;
  const title = document.getElementById('link-title').value;

  if (!url) {
    document.getElementById('link-url').focus();
    return;
  }

  let markdown = `[${text}](${url}`;
  if (title) {
    markdown += ` "${title}"`;
  }
  markdown += ')';

  const sel = getEditorSelection();
  if (sel.text) {
    // Replace selection
    const newContent = sel.before + markdown + sel.after;
    setEditorContent(newContent, sel.start, sel.start + markdown.length);
  } else {
    insertAtCursor(markdown);
  }

  closeDialog('link-dialog');
}

// Image dialog
let imageSourceMode = 'url';
let selectedImageData = null;

function openImageDialog() {
  const sel = getEditorSelection();
  if (sel.text) {
    document.getElementById('image-alt').value = sel.text;
  }
  // Reset to URL tab
  switchImageTab('url');
  selectedImageData = null;
  document.getElementById('image-file-path').value = '';
  document.getElementById('image-preview').classList.add('hidden');
  openDialog('image-dialog');
}

function switchImageTab(tab) {
  imageSourceMode = tab;
  
  // Update tab buttons
  document.getElementById('image-tab-url').classList.toggle('active', tab === 'url');
  document.getElementById('image-tab-file').classList.toggle('active', tab === 'file');
  
  // Show/hide panels
  document.getElementById('image-source-url').classList.toggle('hidden', tab !== 'url');
  document.getElementById('image-source-file').classList.toggle('hidden', tab !== 'file');
}

async function browseForImage() {
  try {
    const filePath = await invoke('open_image_dialog');
    if (filePath) {
      document.getElementById('image-file-path').value = filePath;
      
      // Read the file and convert to base64
      const imageData = await invoke('read_image_as_base64', { path: filePath });
      selectedImageData = imageData;
      
      // Show preview
      const previewImg = document.getElementById('image-preview-img');
      previewImg.src = imageData;
      document.getElementById('image-preview').classList.remove('hidden');
      
      // Set alt text from filename if empty
      const altInput = document.getElementById('image-alt');
      if (!altInput.value) {
        const fileName = filePath.split(/[/\\]/).pop().replace(/\.[^.]+$/, '');
        altInput.value = fileName;
      }
    }
  } catch (err) {
    console.error('Failed to load image:', err);
  }
}

function insertImage() {
  const alt = document.getElementById('image-alt').value || 'image';
  const title = document.getElementById('image-title').value;
  let imageUrl = '';

  if (imageSourceMode === 'url') {
    imageUrl = document.getElementById('image-url').value;
    if (!imageUrl) {
      document.getElementById('image-url').focus();
      return;
    }
  } else {
    // File mode - use base64 data
    if (!selectedImageData) {
      document.getElementById('image-browse-btn').focus();
      return;
    }
    imageUrl = selectedImageData;
  }

  let markdown = `![${alt}](${imageUrl}`;
  if (title) {
    markdown += ` "${title}"`;
  }
  markdown += ')';

  insertAtCursor(markdown);
  closeDialog('image-dialog');
  
  // Reset state
  selectedImageData = null;
}

// Table dialog - Visual Editor
let tableData = {
  rows: 3,
  cols: 3,
  cells: [],  // 2D array: cells[row][col]
  alignments: []
};

function openTableDialog() {
  // Initialize with default 3x3 table
  tableData = {
    rows: 3,
    cols: 3,
    cells: [],
    alignments: []
  };
  
  // Initialize cells with empty values (row 0 is header)
  for (let r = 0; r < tableData.rows; r++) {
    tableData.cells[r] = [];
    for (let c = 0; c < tableData.cols; c++) {
      tableData.cells[r][c] = r === 0 ? `Header ${c + 1}` : '';
    }
  }
  
  // Initialize alignments
  for (let c = 0; c < tableData.cols; c++) {
    tableData.alignments[c] = 'left';
  }
  
  renderTableGrid();
  openDialog('table-dialog');
}

function renderTableGrid() {
  const tableGrid = document.getElementById('table-grid');
  tableGrid.innerHTML = '';
  
  // Build table HTML
  for (let r = 0; r < tableData.rows; r++) {
    const tr = document.createElement('tr');
    
    // Row number cell
    const rowNumCell = document.createElement(r === 0 ? 'th' : 'td');
    rowNumCell.className = 'row-number';
    rowNumCell.textContent = r === 0 ? '#' : r;
    tr.appendChild(rowNumCell);
    
    // Data cells
    for (let c = 0; c < tableData.cols; c++) {
      const cell = document.createElement(r === 0 ? 'th' : 'td');
      const input = document.createElement('input');
      input.type = 'text';
      input.value = tableData.cells[r]?.[c] || '';
      input.dataset.row = r;
      input.dataset.col = c;
      input.placeholder = r === 0 ? `Header ${c + 1}` : '';
      
      // Update data on input
      input.addEventListener('input', (e) => {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        if (!tableData.cells[row]) tableData.cells[row] = [];
        tableData.cells[row][col] = e.target.value;
        updateTableMarkdownPreview();
      });
      
      // Tab navigation
      input.addEventListener('keydown', (e) => {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        
        if (e.key === 'Tab') {
          e.preventDefault();
          let nextRow = row;
          let nextCol = col + (e.shiftKey ? -1 : 1);
          
          if (nextCol >= tableData.cols) {
            nextCol = 0;
            nextRow = row + 1;
          } else if (nextCol < 0) {
            nextCol = tableData.cols - 1;
            nextRow = row - 1;
          }
          
          if (nextRow >= 0 && nextRow < tableData.rows) {
            const nextInput = tableGrid.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
            if (nextInput) nextInput.focus();
          }
        } else if (e.key === 'ArrowUp' && row > 0) {
          const nextInput = tableGrid.querySelector(`input[data-row="${row - 1}"][data-col="${col}"]`);
          if (nextInput) nextInput.focus();
        } else if (e.key === 'ArrowDown' && row < tableData.rows - 1) {
          const nextInput = tableGrid.querySelector(`input[data-row="${row + 1}"][data-col="${col}"]`);
          if (nextInput) nextInput.focus();
        }
      });
      
      cell.appendChild(input);
      tr.appendChild(cell);
    }
    
    tableGrid.appendChild(tr);
  }
  
  // Update alignment controls
  renderAlignmentControls();
  updateTableMarkdownPreview();
}

function renderAlignmentControls() {
  const container = document.getElementById('table-alignment');
  container.innerHTML = '';
  
  for (let c = 0; c < tableData.cols; c++) {
    const control = document.createElement('div');
    control.className = 'alignment-control';
    control.innerHTML = `
      <label>Col ${c + 1}:</label>
      <select data-col="${c}">
        <option value="left" ${tableData.alignments[c] === 'left' ? 'selected' : ''}>Left</option>
        <option value="center" ${tableData.alignments[c] === 'center' ? 'selected' : ''}>Center</option>
        <option value="right" ${tableData.alignments[c] === 'right' ? 'selected' : ''}>Right</option>
      </select>
    `;
    
    control.querySelector('select').addEventListener('change', (e) => {
      const col = parseInt(e.target.dataset.col);
      tableData.alignments[col] = e.target.value;
      updateTableMarkdownPreview();
    });
    
    container.appendChild(control);
  }
}

function addTableRow() {
  tableData.rows++;
  tableData.cells[tableData.rows - 1] = [];
  for (let c = 0; c < tableData.cols; c++) {
    tableData.cells[tableData.rows - 1][c] = '';
  }
  renderTableGrid();
}

function removeTableRow() {
  if (tableData.rows > 2) {  // Keep at least header + 1 row
    tableData.rows--;
    tableData.cells.pop();
    renderTableGrid();
  }
}

function addTableColumn() {
  if (tableData.cols < 10) {  // Max 10 columns
    tableData.cols++;
    tableData.alignments.push('left');
    for (let r = 0; r < tableData.rows; r++) {
      if (!tableData.cells[r]) tableData.cells[r] = [];
      tableData.cells[r].push(r === 0 ? `Header ${tableData.cols}` : '');
    }
    renderTableGrid();
  }
}

function removeTableColumn() {
  if (tableData.cols > 1) {  // Keep at least 1 column
    tableData.cols--;
    tableData.alignments.pop();
    for (let r = 0; r < tableData.rows; r++) {
      if (tableData.cells[r]) {
        tableData.cells[r].pop();
      }
    }
    renderTableGrid();
  }
}

function updateTableMarkdownPreview() {
  const preview = document.getElementById('table-markdown-preview');
  preview.textContent = generateTableMarkdown();
}

function generateTableMarkdown() {
  const lines = [];
  
  // Header row
  const headerCells = [];
  for (let c = 0; c < tableData.cols; c++) {
    headerCells.push(tableData.cells[0]?.[c] || `Header ${c + 1}`);
  }
  lines.push('| ' + headerCells.join(' | ') + ' |');
  
  // Separator row with alignment
  const separatorCells = [];
  for (let c = 0; c < tableData.cols; c++) {
    const align = tableData.alignments[c] || 'left';
    if (align === 'center') {
      separatorCells.push(':---:');
    } else if (align === 'right') {
      separatorCells.push('---:');
    } else {
      separatorCells.push('---');
    }
  }
  lines.push('| ' + separatorCells.join(' | ') + ' |');
  
  // Data rows
  for (let r = 1; r < tableData.rows; r++) {
    const dataCells = [];
    for (let c = 0; c < tableData.cols; c++) {
      dataCells.push(tableData.cells[r]?.[c] || '');
    }
    lines.push('| ' + dataCells.join(' | ') + ' |');
  }
  
  return lines.join('\n');
}

function insertTable() {
  const markdown = '\n' + generateTableMarkdown() + '\n';
  insertAtCursor(markdown);
  closeDialog('table-dialog');
}

// Code block dialog
function openCodeDialog() {
  openDialog('code-dialog');
}

function insertCodeBlock() {
  const language = document.getElementById('code-language').value;
  const codeBlock = '\n```' + language + '\n\n```\n';

  const sel = getEditorSelection();
  const newContent = sel.before + codeBlock + sel.after;
  // Position cursor inside the code block
  const cursorPos = sel.start + 4 + language.length + 1;
  setEditorContent(newContent, cursorPos, cursorPos);

  closeDialog('code-dialog');
}

// ==========================================
// PHASE IV: Export Functions
// ==========================================

// Export dropdown toggle
function toggleExportMenu() {
  const menu = document.getElementById('export-menu');
  menu.classList.toggle('hidden');
}

// Close export menu when clicking outside
function closeExportMenu() {
  document.getElementById('export-menu').classList.add('hidden');
}

// PDF Export
function openPdfDialog() {
  closeExportMenu();
  openDialog('pdf-dialog');
}

async function exportToPdf() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  state.lastExportFormat = 'pdf';
  const theme = document.getElementById('pdf-theme').value;
  const pageSize = document.getElementById('pdf-pagesize').value;
  const marginInches = parseFloat(document.getElementById('pdf-margin').value) || 1;
  const fontSize = parseInt(document.getElementById('pdf-fontsize').value) || 11;
  const lineHeight = parseFloat(document.getElementById('pdf-lineheight').value) || 1.5;

  closeDialog('pdf-dialog');

  // Convert inches to mm (1 inch = 25.4mm)
  const margin = marginInches * 25.4;

  // Get page dimensions in mm
  const pageSizes = {
    letter: [215.9, 279.4],  // 8.5 x 11 inches
    legal: [215.9, 355.6],   // 8.5 x 14 inches
    tabloid: [279.4, 431.8], // 11 x 17 inches
    a4: [210, 297]
  };
  const [pageWidth, pageHeight] = pageSizes[pageSize] || pageSizes.letter;

  // Theme colors
  const themes = {
    professional: { heading: '#0066cc', text: '#1a1a1a', code: '#f6f8fa' },
    academic: { heading: '#333333', text: '#1a1a1a', code: '#f0f0f0' },
    minimal: { heading: '#000000', text: '#333333', code: '#ffffff' }
  };
  const colors = themes[theme] || themes.professional;

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize === 'a4' ? 'a4' : pageSize
  });

  // Parse markdown to get content
  const content = tab.content;
  const lines = content.split('\n');

  let y = margin;
  const maxWidth = pageWidth - (margin * 2);
  const lineSpacing = fontSize * 0.35 * lineHeight;

  // Set default font
  pdf.setFont('helvetica');
  pdf.setFontSize(fontSize);

  for (const line of lines) {
    // Check for page break
    if (y > pageHeight - margin - 10) {
      pdf.addPage();
      y = margin;
    }

    // Handle different markdown elements
    if (line.startsWith('# ')) {
      // H1
      pdf.setFontSize(fontSize * 2);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.heading);
      const text = line.substring(2);
      const splitText = pdf.splitTextToSize(text, maxWidth);
      pdf.text(splitText, margin, y);
      y += splitText.length * fontSize * 0.7 + lineSpacing * 2;
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.text);
    } else if (line.startsWith('## ')) {
      // H2
      pdf.setFontSize(fontSize * 1.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.heading);
      const text = line.substring(3);
      const splitText = pdf.splitTextToSize(text, maxWidth);
      pdf.text(splitText, margin, y);
      y += splitText.length * fontSize * 0.55 + lineSpacing * 1.5;
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.text);
    } else if (line.startsWith('### ')) {
      // H3
      pdf.setFontSize(fontSize * 1.2);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.heading);
      const text = line.substring(4);
      const splitText = pdf.splitTextToSize(text, maxWidth);
      pdf.text(splitText, margin, y);
      y += splitText.length * fontSize * 0.45 + lineSpacing;
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.text);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Bullet list
      const text = '• ' + line.substring(2);
      const splitText = pdf.splitTextToSize(text, maxWidth - 5);
      pdf.text(splitText, margin + 5, y);
      y += splitText.length * lineSpacing;
    } else if (/^\d+\.\s/.test(line)) {
      // Numbered list
      const splitText = pdf.splitTextToSize(line, maxWidth - 5);
      pdf.text(splitText, margin + 5, y);
      y += splitText.length * lineSpacing;
    } else if (line.startsWith('> ')) {
      // Blockquote
      pdf.setTextColor('#666666');
      const text = line.substring(2);
      const splitText = pdf.splitTextToSize(text, maxWidth - 10);
      // Draw left border
      pdf.setDrawColor('#cccccc');
      pdf.setLineWidth(0.5);
      pdf.line(margin + 2, y - lineSpacing * 0.5, margin + 2, y + splitText.length * lineSpacing - lineSpacing * 0.5);
      pdf.text(splitText, margin + 8, y);
      y += splitText.length * lineSpacing;
      pdf.setTextColor(colors.text);
    } else if (line.startsWith('```')) {
      // Code block - skip the fence
      continue;
    } else if (line === '---' || line === '***') {
      // Horizontal rule
      pdf.setDrawColor('#e0e0e0');
      pdf.setLineWidth(0.3);
      pdf.line(margin, y, pageWidth - margin, y);
      y += lineSpacing;
    } else if (line.trim() === '') {
      // Empty line
      y += lineSpacing * 0.5;
    } else {
      // Regular paragraph
      // Handle inline formatting (bold, italic) by stripping markers
      let text = line
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

      const splitText = pdf.splitTextToSize(text, maxWidth);
      pdf.text(splitText, margin, y);
      y += splitText.length * lineSpacing;
    }
  }

  // Save PDF using Tauri save dialog
  const defaultFileName = tab.fileName.replace(/\.(md|markdown|txt)$/, '') + '.pdf';
  
  try {
    const filePath = await invoke('save_file_dialog', { defaultName: defaultFileName });
    if (filePath) {
      // Get PDF as array buffer
      const pdfOutput = pdf.output('arraybuffer');
      const uint8Array = new Uint8Array(pdfOutput);
      
      // Write to file using Tauri
      await invoke('write_binary_file', { path: filePath, data: Array.from(uint8Array) });
    }
  } catch (err) {
    // Fallback to browser download if Tauri not available
    console.log('Using browser download fallback:', err);
    pdf.save(defaultFileName);
  }
}

// DOCX Export
function openDocxDialog() {
  closeExportMenu();
  openDialog('docx-dialog');
}

async function exportToDocx() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  state.lastExportFormat = 'docx';
  const pageSize = document.getElementById('docx-pagesize').value;
  const marginInches = parseFloat(document.getElementById('docx-margin').value) || 1;

  closeDialog('docx-dialog');

  // Convert inches to twips (1 inch = 1440 twips)
  const marginTwips = marginInches * 1440;

  const content = tab.content;
  const lines = content.split('\n');
  const children = [];

  let inCodeBlock = false;
  let codeBlockLines = [];

  for (const line of lines) {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeBlockLines.join('\n'),
                font: 'Consolas',
                size: 20,
              })
            ],
            shading: { fill: 'F0F0F0' },
            spacing: { before: 100, after: 100 },
          })
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    }
    // H2
    else if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    }
    // H3
    else if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: line.substring(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    }
    // H4
    else if (line.startsWith('#### ')) {
      children.push(
        new Paragraph({
          text: line.substring(5),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 120, after: 60 },
        })
      );
    }
    // Bullet list
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      children.push(
        new Paragraph({
          text: line.substring(2),
          bullet: { level: 0 },
        })
      );
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, '');
      children.push(
        new Paragraph({
          text: text,
          numbering: { reference: 'default-numbering', level: 0 },
        })
      );
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.substring(2),
              italics: true,
              color: '666666',
            })
          ],
          indent: { left: 720 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 12, color: 'CCCCCC' },
          },
        })
      );
    }
    // Horizontal rule
    else if (line === '---' || line === '***') {
      children.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E0E0E0' } },
          spacing: { before: 200, after: 200 },
        })
      );
    }
    // Empty line
    else if (line.trim() === '') {
      children.push(new Paragraph({ text: '' }));
    }
    // Regular paragraph with inline formatting
    else {
      const textRuns = parseInlineFormatting(line);
      children.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 120 },
        })
      );
    }
  }

  // Page size dimensions in twips (1 inch = 1440 twips)
  const pageSizesDocx = {
    letter: { width: 12240, height: 15840 },  // 8.5 x 11 inches
    legal: { width: 12240, height: 20160 },   // 8.5 x 14 inches
    a4: { width: 11906, height: 16838 }       // 210 x 297 mm
  };
  const docPageSize = pageSizesDocx[pageSize] || pageSizesDocx.letter;

  // Create document
  const doc = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [{
          level: 0,
          format: 'decimal',
          text: '%1.',
          alignment: AlignmentType.START,
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: docPageSize,
          margin: {
            top: marginTwips,
            right: marginTwips,
            bottom: marginTwips,
            left: marginTwips,
          },
        },
      },
      children: children,
    }],
  });

  // Generate file
  const blob = await Packer.toBlob(doc);
  const defaultFileName = tab.fileName.replace(/\.(md|markdown|txt)$/, '') + '.docx';

  try {
    const filePath = await invoke('save_file_dialog', { defaultName: defaultFileName });
    if (filePath) {
      // Convert blob to array
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Write to file using Tauri
      await invoke('write_binary_file', { path: filePath, data: Array.from(uint8Array) });
    }
  } catch (err) {
    // Fallback to browser download if Tauri not available
    console.log('Using browser download fallback:', err);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Parse inline markdown formatting
function parseInlineFormatting(text) {
  const runs = [];
  let remaining = text;

  // Simple regex-based parsing for bold, italic, code, and links
  const patterns = [
    { regex: /\*\*([^*]+)\*\*/, bold: true },
    { regex: /\*([^*]+)\*/, italics: true },
    { regex: /`([^`]+)`/, font: 'Consolas' },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, link: true },
  ];

  while (remaining.length > 0) {
    let earliestMatch = null;
    let earliestIndex = Infinity;
    let matchedPattern = null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index < earliestIndex) {
        earliestMatch = match;
        earliestIndex = match.index;
        matchedPattern = pattern;
      }
    }

    if (earliestMatch && earliestIndex < remaining.length) {
      // Add text before the match
      if (earliestIndex > 0) {
        runs.push(new TextRun({ text: remaining.substring(0, earliestIndex) }));
      }

      // Add the formatted text
      if (matchedPattern.link) {
        runs.push(new TextRun({
          text: earliestMatch[1],
          color: '0066CC',
          underline: {},
        }));
      } else {
        runs.push(new TextRun({
          text: earliestMatch[1],
          bold: matchedPattern.bold,
          italics: matchedPattern.italics,
          font: matchedPattern.font,
        }));
      }

      remaining = remaining.substring(earliestIndex + earliestMatch[0].length);
    } else {
      // No more matches, add remaining text
      runs.push(new TextRun({ text: remaining }));
      break;
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text: text })];
}

// HTML Export
function openHtmlDialog() {
  closeExportMenu();
  openDialog('html-dialog');
}

async function exportToHtml() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  state.lastExportFormat = 'html';
  const style = document.getElementById('html-style').value;
  const includeDarkMode = document.getElementById('html-darkmode').checked;

  closeDialog('html-dialog');

  // Generate HTML with styling
  const renderedContent = marked.parse(tab.content);

  // Build CSS based on options
  let css = '';
  
  if (style !== 'raw') {
    css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-primary);
      background: var(--bg-primary);
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    h1 { font-size: 2em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }

    p { margin-bottom: 16px; }

    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    code {
      font-family: 'Cascadia Code', Consolas, monospace;
      font-size: 0.9em;
      padding: 0.2em 0.4em;
      background: var(--code-bg);
      border-radius: 4px;
    }

    pre {
      margin-bottom: 16px;
      padding: 16px;
      background: var(--code-bg);
      border-radius: 6px;
      overflow-x: auto;
    }

    pre code {
      padding: 0;
      background: transparent;
    }

    blockquote {
      margin-bottom: 16px;
      padding: 0 1em;
      border-left: 4px solid var(--border);
      color: var(--text-secondary);
    }

    ul, ol { margin-bottom: 16px; padding-left: 2em; }
    li { margin-bottom: 4px; }

    table {
      width: 100%;
      margin-bottom: 16px;
      border-collapse: collapse;
    }

    th, td {
      padding: 8px 12px;
      border: 1px solid var(--border);
      text-align: left;
    }

    th { background: var(--code-bg); font-weight: 600; }

    hr {
      margin: 24px 0;
      border: none;
      border-top: 1px solid var(--border);
    }

    img { max-width: 100%; height: auto; border-radius: 6px; }`;
  }

  // CSS variables
  let cssVars = `
    :root {
      --bg-primary: #ffffff;
      --text-primary: #1a1a1a;
      --text-secondary: #666666;
      --accent: #0066cc;
      --border: #e0e0e0;
      --code-bg: #f6f8fa;
    }`;

  if (includeDarkMode && style !== 'raw') {
    cssVars += `

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #1e1e1e;
        --text-primary: #e0e0e0;
        --text-secondary: #a0a0a0;
        --accent: #4da6ff;
        --border: #404040;
        --code-bg: #2d2d2d;
      }
    }`;
  }

  const fullCss = style === 'raw' ? '' : `<style>${cssVars}${css}
  </style>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(tab.fileName)}</title>
  ${fullCss}
</head>
<body>
${renderedContent}
</body>
</html>`;

  const defaultFileName = tab.fileName.replace(/\.(md|markdown|txt)$/, '') + '.html';

  try {
    const filePath = await invoke('save_file_dialog', { defaultName: defaultFileName });
    if (filePath) {
      // Write to file using Tauri
      await invoke('write_file', { path: filePath, content: html });
    }
  } catch (err) {
    // Fallback to browser download if Tauri not available
    console.log('Using browser download fallback:', err);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// File Operations
function newFile() {
  const fileName = `Untitled-${state.newFileCounter++}.md`;
  createTab(null, fileName, '', true);
}

async function openFile() {
  try {
    const selected = await invoke('open_file_dialog');
    if (selected && selected.length > 0) {
      for (const filePath of selected) {
        await loadFile(filePath);
      }
    }
  } catch (err) {
    console.error('Error opening file:', err);
    alert(`Error opening file dialog: ${err}`);
  }
}

async function loadFile(filePath) {
  // Check if file is already open
  const existingTab = state.tabs.find(t => t.filePath === filePath);
  if (existingTab) {
    activateTab(existingTab.id);
    return;
  }

  try {
    const fileName = await invoke('get_file_name', { path: filePath });
    
    // Check if it's a Word document
    if (filePath.toLowerCase().endsWith('.docx') || filePath.toLowerCase().endsWith('.doc')) {
      // Convert Word document to Markdown
      await loadWordFile(filePath, fileName);
    } else {
      // Regular text file
      const content = await invoke('read_file', { path: filePath });
      createTab(filePath, fileName, content, false);
    }
  } catch (err) {
    console.error('Error loading file:', err);
    alert(`Failed to open file: ${err}`);
  }
}

// Load and convert Word document
async function loadWordFile(filePath, originalFileName) {
  try {
    showImportProgress('Reading Word document...');

    // Read the file as base64
    const base64Data = await invoke('read_file_as_base64', { path: filePath });

    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;

    showImportProgress('Converting to Markdown...');

    // Convert to Markdown
    const options = { preserveImages: true };
    const result = await convertWordToMarkdown(arrayBuffer, options);

    // Create new filename with .md extension
    const newFileName = originalFileName.replace(/\.(docx?|doc)$/i, '.md');

    // Create a new tab with the converted content (unsaved, no file path)
    createTab(null, newFileName, result.markdown, true);

    hideImportProgress();

    if (result.warnings.length > 0) {
      console.log('Conversion warnings:', result.warnings);
    }
  } catch (err) {
    hideImportProgress();
    console.error('Error converting Word document:', err);
    alert(`Failed to open Word document: ${err}`);
  }
}

async function saveFile() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  if (tab.isNew || !tab.filePath) {
    await saveFileAs();
    return;
  }

  try {
    await invoke('write_file', { path: tab.filePath, content: tab.content });
    tab.originalContent = tab.content;
    tab.isDirty = false;
    renderTabs();
  } catch (err) {
    console.error('Error saving file:', err);
    alert(`Failed to save file: ${err}`);
  }
}

async function saveFileAs() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  try {
    const filePath = await invoke('save_file_dialog', { defaultName: tab.fileName });
    if (filePath) {
      await invoke('write_file', { path: filePath, content: tab.content });
      tab.filePath = filePath;
      tab.fileName = await invoke('get_file_name', { path: filePath });
      tab.originalContent = tab.content;
      tab.isDirty = false;
      tab.isNew = false;
      renderTabs();
    }
  } catch (err) {
    console.error('Error saving file:', err);
    alert(`Failed to save file: ${err}`);
  }
}

// Editor Input Handler
function handleEditorInput() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  const editor = document.getElementById('editor');
  tab.content = editor.value;
  tab.isDirty = tab.content !== tab.originalContent;

  renderTabs();
  renderPreview();
  updateOutline();
  updateStatusBar();
  updateLineNumbers();
  updateCursorPosition();

  // Debounced auto-save
  clearTimeout(state.autoSaveTimer);
  state.autoSaveTimer = setTimeout(autoSave, 1000);

  // Debounced history save (save every 30 seconds of inactivity)
  clearTimeout(state.historyTimer);
  state.historyTimer = setTimeout(() => saveToHistory(tab), 30000);
}

// Resize Handle
function initResizeHandle() {
  const handle = document.getElementById('resize-handle');
  const editorPane = document.getElementById('editor-pane');
  const container = document.getElementById('editor-container');

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = editorPane.offsetWidth;
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const containerWidth = container.offsetWidth;
    const newWidth = startWidth + (e.clientX - startX);
    const minWidth = 200;
    const maxWidth = containerWidth - 204; // 200 min for preview + 4 for handle

    editorPane.style.flex = 'none';
    editorPane.style.width = `${Math.min(Math.max(newWidth, minWidth), maxWidth)}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

// Drag and Drop
async function initDragDrop() {
  const overlay = document.createElement('div');
  overlay.className = 'drop-overlay';
  overlay.innerHTML = `
    <div class="drop-overlay-content">
      <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
      </svg>
      <p>Drop markdown or text file here</p>
    </div>
  `;
  document.body.appendChild(overlay);

  try {
    await listen('tauri://drag-over', () => {
      overlay.classList.add('active');
    });

    await listen('tauri://drag-leave', () => {
      overlay.classList.remove('active');
    });

    await listen('tauri://drag-drop', async (event) => {
      overlay.classList.remove('active');
      const paths = event.payload.paths || event.payload;
      if (Array.isArray(paths)) {
        for (const filePath of paths) {
          if (filePath.endsWith('.md') || filePath.endsWith('.markdown') || filePath.endsWith('.txt')) {
            await loadFile(filePath);
          }
        }
      }
    });
  } catch (err) {
    console.error('Error setting up drag-drop:', err);
  }
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // F11 - Toggle fullscreen
    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullscreen();
    }

    // Ctrl+N - New file
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      newFile();
    }

    // Ctrl+O - Open file
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      openFile();
    }

    // Ctrl+S - Save
    if (e.ctrlKey && !e.shiftKey && e.key === 's') {
      e.preventDefault();
      saveFile();
    }

    // Ctrl+Shift+S - Save As
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      saveFileAs();
    }

    // Ctrl+W - Close tab
    if (e.ctrlKey && e.key === 'w') {
      e.preventDefault();
      if (state.activeTabId) {
        closeTab(state.activeTabId);
      }
    }

    // Ctrl+Tab - Next tab
    if (e.ctrlKey && e.key === 'Tab') {
      e.preventDefault();
      if (state.tabs.length > 1) {
        const currentIndex = state.tabs.findIndex(t => t.id === state.activeTabId);
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + state.tabs.length) % state.tabs.length
          : (currentIndex + 1) % state.tabs.length;
        activateTab(state.tabs[nextIndex].id);
      }
    }

    // Ctrl+Shift+O - Toggle outline
    if (e.ctrlKey && e.shiftKey && e.key === 'O') {
      e.preventDefault();
      toggleOutline();
    }

    // Ctrl+H - Toggle history
    if (e.ctrlKey && e.key === 'h') {
      e.preventDefault();
      toggleHistory();
    }

    // Ctrl+E - Export dialog (open PDF dialog as default)
    if (e.ctrlKey && !e.shiftKey && e.key === 'e') {
      e.preventDefault();
      if (state.activeTabId) {
        toggleExportMenu();
      }
    }

    // Ctrl+Shift+E - Quick export (last format)
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      if (state.activeTabId) {
        quickExport();
      }
    }

    // Ctrl++ or Ctrl+= - Zoom in
    if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      zoomIn();
    }

    // Ctrl+- - Zoom out
    if (e.ctrlKey && e.key === '-') {
      e.preventDefault();
      zoomOut();
    }

    // Ctrl+0 - Reset zoom
    if (e.ctrlKey && e.key === '0') {
      e.preventDefault();
      resetZoom();
    }

    // Ctrl+1 - Edit mode
    if (e.ctrlKey && e.key === '1') {
      e.preventDefault();
      setViewMode('edit');
    }

    // Ctrl+2 - Split mode
    if (e.ctrlKey && e.key === '2') {
      e.preventDefault();
      setViewMode('split');
    }

    // Ctrl+3 - Preview mode
    if (e.ctrlKey && e.key === '3') {
      e.preventDefault();
      setViewMode('preview');
    }


    // Formatting shortcuts (only when editor is focused)
    if (document.activeElement === document.getElementById('editor')) {
      // Ctrl+B - Bold
      if (e.ctrlKey && !e.shiftKey && e.key === 'b') {
        e.preventDefault();
        formatBold();
      }

      // Ctrl+I - Italic
      if (e.ctrlKey && !e.shiftKey && e.key === 'i') {
        e.preventDefault();
        formatItalic();
      }

      // Ctrl+K - Insert link
      if (e.ctrlKey && !e.shiftKey && e.key === 'k') {
        e.preventDefault();
        openLinkDialog();
      }

      // Ctrl+Shift+I - Insert image
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        openImageDialog();
      }

      // Ctrl+Shift+C - Insert code block
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        openCodeDialog();
      }

      // Ctrl+Q - Blockquote
      if (e.ctrlKey && !e.shiftKey && e.key === 'q') {
        e.preventDefault();
        formatBlockquote();
      }

      // Ctrl+L - Bullet list
      if (e.ctrlKey && !e.shiftKey && e.key === 'l') {
        e.preventDefault();
        formatBulletList();
      }

      // Ctrl+Shift+L - Numbered list
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        formatNumberedList();
      }
    }
  });
}

// Event Listeners
function initEventListeners() {
  // Toolbar buttons
  document.getElementById('btn-new').addEventListener('click', newFile);
  document.getElementById('btn-open').addEventListener('click', openFile);
  document.getElementById('btn-save').addEventListener('click', saveFile);
  document.getElementById('btn-history').addEventListener('click', toggleHistory);
  document.getElementById('btn-outline').addEventListener('click', toggleOutline);
  document.getElementById('btn-close-outline').addEventListener('click', toggleOutline);
  document.getElementById('btn-close-history').addEventListener('click', toggleHistory);
  document.getElementById('btn-beautify').addEventListener('click', openBeautifyDialog);
  document.getElementById('beautify-apply').addEventListener('click', beautifyMarkdown);
  document.getElementById('btn-theme').addEventListener('click', cycleTheme);
  document.getElementById('btn-hints').addEventListener('click', toggleHints);
  document.getElementById('btn-close-hints').addEventListener('click', closeHints);
  document.getElementById('btn-about').addEventListener('click', showAboutDialog);

  // Welcome buttons
  document.getElementById('btn-new-welcome').addEventListener('click', newFile);
  document.getElementById('btn-open-welcome').addEventListener('click', openFile);

  // View mode buttons
  document.getElementById('btn-mode-edit').addEventListener('click', () => setViewMode('edit'));
  document.getElementById('btn-mode-split').addEventListener('click', () => setViewMode('split'));
  document.getElementById('btn-mode-preview').addEventListener('click', () => setViewMode('preview'));

  // Editor input
  const editor = document.getElementById('editor');
  editor.addEventListener('input', handleEditorInput);

  // Cursor position tracking
  editor.addEventListener('click', updateCursorPosition);
  editor.addEventListener('keyup', updateCursorPosition);
  editor.addEventListener('select', updateCursorPosition);

  // Sync line numbers scroll
  editor.addEventListener('scroll', syncLineNumbersScroll);

  // Handle tab key in editor
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
      handleEditorInput();
    }
  });

  // Formatting toolbar buttons
  initFormattingToolbar();
}

function initFormattingToolbar() {
  // Text formatting
  document.getElementById('fmt-bold').addEventListener('click', formatBold);
  document.getElementById('fmt-italic').addEventListener('click', formatItalic);
  document.getElementById('fmt-strikethrough').addEventListener('click', formatStrikethrough);
  document.getElementById('fmt-code-inline').addEventListener('click', formatInlineCode);

  // Heading dropdown
  const headingBtn = document.getElementById('fmt-heading');
  const headingMenu = document.getElementById('heading-menu');

  headingBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    headingMenu.classList.toggle('hidden');
  });

  headingMenu.querySelectorAll('[data-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      formatHeading(parseInt(btn.dataset.level));
    });
  });

  // Close heading menu when clicking outside
  document.addEventListener('click', () => {
    headingMenu.classList.add('hidden');
  });

  // Lists
  document.getElementById('fmt-ul').addEventListener('click', formatBulletList);
  document.getElementById('fmt-ol').addEventListener('click', formatNumberedList);
  document.getElementById('fmt-task').addEventListener('click', formatTaskList);

  // Block elements
  document.getElementById('fmt-quote').addEventListener('click', formatBlockquote);
  document.getElementById('fmt-hr').addEventListener('click', formatHorizontalRule);

  // Insert elements
  document.getElementById('fmt-link').addEventListener('click', openLinkDialog);
  document.getElementById('fmt-image').addEventListener('click', openImageDialog);
  document.getElementById('fmt-table').addEventListener('click', openTableDialog);
  document.getElementById('fmt-code-block').addEventListener('click', openCodeDialog);

  // Dialog event listeners
  initDialogs();
}

function initDialogs() {
  // Close buttons for all modals
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        closeDialog(modal.id);
      }
    });
  });

  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeDialog(overlay.id);
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDialogs();
    }
  });

  // Link dialog
  document.getElementById('link-insert').addEventListener('click', insertLink);
  document.getElementById('link-url').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      insertLink();
    }
  });

  // Image dialog
  document.getElementById('image-insert').addEventListener('click', insertImage);
  document.getElementById('image-url').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      insertImage();
    }
  });
  document.getElementById('image-tab-url').addEventListener('click', () => switchImageTab('url'));
  document.getElementById('image-tab-file').addEventListener('click', () => switchImageTab('file'));
  document.getElementById('image-browse-btn').addEventListener('click', browseForImage);

  // Table dialog
  document.getElementById('table-insert').addEventListener('click', insertTable);
  document.getElementById('table-add-row').addEventListener('click', addTableRow);
  document.getElementById('table-remove-row').addEventListener('click', removeTableRow);
  document.getElementById('table-add-col').addEventListener('click', addTableColumn);
  document.getElementById('table-remove-col').addEventListener('click', removeTableColumn);

  // Code dialog
  document.getElementById('code-insert').addEventListener('click', insertCodeBlock);

  // Export functionality
  initExportListeners();
}

function initExportListeners() {
  // Export dropdown toggle
  const exportBtn = document.getElementById('btn-export');
  const exportMenu = document.getElementById('export-menu');

  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleExportMenu();
  });

  // Close export menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!exportBtn.contains(e.target) && !exportMenu.contains(e.target)) {
      closeExportMenu();
    }
  });

  // Export options - all open dialogs now
  document.getElementById('export-pdf').addEventListener('click', openPdfDialog);
  document.getElementById('export-docx').addEventListener('click', openDocxDialog);
  document.getElementById('export-html').addEventListener('click', openHtmlDialog);

  // Export buttons in dialogs
  document.getElementById('pdf-export-btn').addEventListener('click', exportToPdf);
  document.getElementById('docx-export-btn').addEventListener('click', exportToDocx);
  document.getElementById('html-export-btn').addEventListener('click', exportToHtml);
}

function initImportListeners() {
  // Import dropdown toggle
  const importBtn = document.getElementById('btn-import');
  const importMenu = document.getElementById('import-menu');

  if (!importBtn || !importMenu) return;

  importBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleImportMenu();
  });

  // Close import menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!importBtn.contains(e.target) && !importMenu.contains(e.target)) {
      closeImportMenu();
    }
  });

  // Import from Word option
  document.getElementById('import-word').addEventListener('click', () => {
    closeImportMenu();
    importFromWord();
  });
}

function toggleImportMenu() {
  const menu = document.getElementById('import-menu');
  menu.classList.toggle('hidden');
}

function closeImportMenu() {
  document.getElementById('import-menu').classList.add('hidden');
}

// ============================================
// AI Integration
// ============================================

// AI Settings state
const aiState = {
  provider: '',
  apiKey: '',
  model: '',
  baseUrl: '',
  isConfigured: false
};

// Available models per provider
const AI_MODELS = {
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Latest)' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Fast)' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o (Latest)' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  ],
  google: [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fast)' },
  ],
  perplexity: [
    { id: 'sonar', name: 'Sonar' },
    { id: 'sonar-pro', name: 'Sonar Pro' },
  ],
  ollama: [
    { id: 'llama3.2', name: 'Llama 3.2' },
    { id: 'mistral', name: 'Mistral' },
    { id: 'codellama', name: 'Code Llama' },
    { id: 'phi3', name: 'Phi-3' },
  ]
};

// Load AI settings from localStorage
function loadAISettings() {
  try {
    const saved = localStorage.getItem('downedit-ai-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      aiState.provider = settings.provider || '';
      aiState.apiKey = settings.apiKey || '';
      aiState.model = settings.model || '';
      aiState.baseUrl = settings.baseUrl || '';
      aiState.isConfigured = !!(aiState.provider && (aiState.apiKey || aiState.provider === 'ollama'));
    }
  } catch (err) {
    console.error('Error loading AI settings:', err);
  }
}

// Save AI settings to localStorage
function saveAISettings() {
  try {
    localStorage.setItem('downedit-ai-settings', JSON.stringify({
      provider: aiState.provider,
      apiKey: aiState.apiKey,
      model: aiState.model,
      baseUrl: aiState.baseUrl
    }));
    aiState.isConfigured = !!(aiState.provider && (aiState.apiKey || aiState.provider === 'ollama'));
  } catch (err) {
    console.error('Error saving AI settings:', err);
  }
}

// Open AI settings dialog
function openAISettingsDialog() {
  const dialog = document.getElementById('ai-settings-dialog');
  loadAISettings();
  
  // Populate form with current settings
  document.getElementById('ai-provider').value = aiState.provider;
  document.getElementById('ai-api-key').value = aiState.apiKey;
  document.getElementById('ai-base-url').value = aiState.baseUrl || 'http://localhost:11434';
  
  // Update UI based on provider
  updateAISettingsUI();
  
  // Set model after updating UI (so the options exist)
  if (aiState.model) {
    document.getElementById('ai-model').value = aiState.model;
  }
  
  dialog.classList.remove('hidden');
}

// Update AI settings UI based on selected provider
function updateAISettingsUI() {
  const provider = document.getElementById('ai-provider').value;
  const apiKeyGroup = document.getElementById('ai-api-key-group');
  const modelGroup = document.getElementById('ai-model-group');
  const baseUrlGroup = document.getElementById('ai-base-url-group');
  const modelSelect = document.getElementById('ai-model');
  const testBtn = document.getElementById('ai-test-btn');
  const saveBtn = document.getElementById('ai-save-btn');
  
  // Reset status
  hideAIStatus();
  
  if (!provider) {
    apiKeyGroup.classList.add('hidden');
    modelGroup.classList.add('hidden');
    baseUrlGroup.classList.add('hidden');
    testBtn.disabled = true;
    saveBtn.disabled = true;
    return;
  }
  
  // Show/hide API key based on provider (Ollama doesn't need one)
  if (provider === 'ollama') {
    apiKeyGroup.classList.add('hidden');
    baseUrlGroup.classList.remove('hidden');
  } else {
    apiKeyGroup.classList.remove('hidden');
    baseUrlGroup.classList.add('hidden');
  }
  
  // Populate model dropdown
  modelGroup.classList.remove('hidden');
  const models = AI_MODELS[provider] || [];
  modelSelect.innerHTML = '<option value="">-- Select Model --</option>' + 
    models.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  
  // Enable buttons
  updateAIButtonStates();
}

// Update button states
function updateAIButtonStates() {
  const provider = document.getElementById('ai-provider').value;
  const apiKey = document.getElementById('ai-api-key').value;
  const model = document.getElementById('ai-model').value;
  const testBtn = document.getElementById('ai-test-btn');
  const saveBtn = document.getElementById('ai-save-btn');
  
  const hasCredentials = provider === 'ollama' || apiKey.trim();
  testBtn.disabled = !provider || !hasCredentials;
  saveBtn.disabled = !provider || !hasCredentials || !model;
}

// Show AI status message
function showAIStatus(type, message) {
  const status = document.getElementById('ai-status');
  const icon = document.getElementById('ai-status-icon');
  const text = document.getElementById('ai-status-text');
  
  status.className = 'ai-status ' + type;
  
  if (type === 'success') {
    icon.textContent = '✓';
  } else if (type === 'error') {
    icon.textContent = '✕';
  } else if (type === 'loading') {
    icon.textContent = '⟳';
  }
  
  text.textContent = message;
  status.classList.remove('hidden');
}

function hideAIStatus() {
  document.getElementById('ai-status').classList.add('hidden');
}

// Test AI connection
async function testAIConnection() {
  const provider = document.getElementById('ai-provider').value;
  const apiKey = document.getElementById('ai-api-key').value;
  const model = document.getElementById('ai-model').value || getDefaultModel(provider);
  const baseUrl = document.getElementById('ai-base-url').value;
  
  showAIStatus('loading', 'Testing connection...');
  
  try {
    const response = await callAI(provider, apiKey, model, baseUrl, 'Say "Hello" in exactly one word.');
    if (response) {
      showAIStatus('success', 'Connection successful! Response: ' + response.substring(0, 50));
    }
  } catch (err) {
    showAIStatus('error', 'Connection failed: ' + err.message);
  }
}

function getDefaultModel(provider) {
  const models = AI_MODELS[provider];
  return models && models.length > 0 ? models[0].id : '';
}

// Save AI settings
function saveAISettingsFromDialog() {
  aiState.provider = document.getElementById('ai-provider').value;
  aiState.apiKey = document.getElementById('ai-api-key').value;
  aiState.model = document.getElementById('ai-model').value;
  aiState.baseUrl = document.getElementById('ai-base-url').value;
  
  saveAISettings();
  showAIStatus('success', 'Settings saved successfully!');
  
  setTimeout(() => {
    document.getElementById('ai-settings-dialog').classList.add('hidden');
  }, 1000);
}

// Toggle API key visibility
function toggleAPIKeyVisibility() {
  const input = document.getElementById('ai-api-key');
  const eyeOpen = document.getElementById('ai-key-eye-open');
  const eyeClosed = document.getElementById('ai-key-eye-closed');
  
  if (input.type === 'password') {
    input.type = 'text';
    eyeOpen.classList.add('hidden');
    eyeClosed.classList.remove('hidden');
  } else {
    input.type = 'password';
    eyeOpen.classList.remove('hidden');
    eyeClosed.classList.add('hidden');
  }
}

// Core AI call function
async function callAI(provider, apiKey, model, baseUrl, prompt) {
  switch (provider) {
    case 'anthropic':
      return await callAnthropic(apiKey, model, prompt);
    case 'openai':
      return await callOpenAI(apiKey, model, 'https://api.openai.com/v1', prompt);
    case 'google':
      return await callGoogle(apiKey, model, prompt);
    case 'perplexity':
      return await callOpenAI(apiKey, model, 'https://api.perplexity.ai', prompt);
    case 'ollama':
      return await callOpenAI('', model, baseUrl || 'http://localhost:11434', prompt);
    default:
      throw new Error('Unknown provider: ' + provider);
  }
}

// Anthropic API
async function callAnthropic(apiKey, model, prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'API error');
  }
  
  return data.content[0].text;
}

// OpenAI-compatible API (works for OpenAI, Perplexity, Ollama)
async function callOpenAI(apiKey, model, baseUrl, prompt) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  // Ollama uses a different endpoint
  const isOllama = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  const endpoint = isOllama ? `${baseUrl}/api/chat` : `${baseUrl}/chat/completions`;
  
  const body = isOllama ? {
    model: model,
    messages: [{ role: 'user', content: prompt }],
    stream: false
  } : {
    model: model,
    messages: [{ role: 'user', content: prompt }]
  };
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'API error');
  }
  
  // Ollama returns response differently
  if (isOllama) {
    return data.message?.content || '';
  }
  
  return data.choices[0].message.content;
}

// Google AI API
async function callGoogle(apiKey, model, prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'API error');
  }
  
  return data.candidates[0].content.parts[0].text;
}

// Initialize AI settings listeners
function initAISettingsListeners() {
  // Open AI settings
  document.getElementById('btn-ai-settings').addEventListener('click', openAISettingsDialog);
  
  // Provider change
  document.getElementById('ai-provider').addEventListener('change', updateAISettingsUI);
  
  // Input changes to update button states
  document.getElementById('ai-api-key').addEventListener('input', updateAIButtonStates);
  document.getElementById('ai-model').addEventListener('change', updateAIButtonStates);
  
  // Toggle API key visibility
  document.getElementById('ai-key-toggle').addEventListener('click', toggleAPIKeyVisibility);
  
  // Test and save buttons
  document.getElementById('ai-test-btn').addEventListener('click', testAIConnection);
  document.getElementById('ai-save-btn').addEventListener('click', saveAISettingsFromDialog);
  
  // Close dialog
  document.querySelectorAll('#ai-settings-dialog [data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('ai-settings-dialog').classList.add('hidden');
    });
  });
}

// High-level AI function for converting ASCII to Mermaid
async function convertASCIIToMermaid(asciiArt) {
  if (!aiState.isConfigured) {
    throw new Error('AI is not configured. Please set up AI in settings.');
  }
  
  const prompt = `Convert this ASCII diagram to Mermaid syntax. Return ONLY the Mermaid code, no explanation, no markdown code fences.

ASCII Diagram:
${asciiArt}

Mermaid code:`;

  return await callAI(aiState.provider, aiState.apiKey, aiState.model, aiState.baseUrl, prompt);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  // Initialize Mermaid
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit'
  });
  
  initTheme();
  initEventListeners();
  initDragDrop();
  initKeyboardShortcuts();
  initResizeHandle();
  initImportListeners();
  initAISettingsListeners();
  loadAISettings();
  setViewMode('split');

  // Try to restore auto-saved content
  if (!loadAutoSave()) {
    showWelcome();
  }
});
