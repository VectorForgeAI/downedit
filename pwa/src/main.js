// down.edit PWA - Mobile-First Markdown Editor
import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

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

// ==========================================
// IndexedDB Storage for PWA
// ==========================================
const DB_NAME = 'downedit-pwa';
const DB_VERSION = 1;
let db = null;

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Store for documents
      if (!database.objectStoreNames.contains('documents')) {
        const docStore = database.createObjectStore('documents', { keyPath: 'id' });
        docStore.createIndex('name', 'name', { unique: false });
        docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Store for app state
      if (!database.objectStoreNames.contains('state')) {
        database.createObjectStore('state', { keyPath: 'key' });
      }

      // Store for history
      if (!database.objectStoreNames.contains('history')) {
        const historyStore = database.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        historyStore.createIndex('docId', 'docId', { unique: false });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function saveDocument(doc) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');
    const request = store.put(doc);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getDocument(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['documents'], 'readonly');
    const store = transaction.objectStore('documents');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllDocuments() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['documents'], 'readonly');
    const store = transaction.objectStore('documents');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteDocument(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function saveState(key, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['state'], 'readwrite');
    const store = transaction.objectStore('state');
    const request = store.put({ key, value });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getState(key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['state'], 'readonly');
    const store = transaction.objectStore('state');
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.value);
    request.onerror = () => reject(request.error);
  });
}

async function saveHistory(docId, content) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['history'], 'readwrite');
    const store = transaction.objectStore('history');
    const entry = {
      docId,
      content,
      timestamp: Date.now(),
      preview: content.substring(0, 100).replace(/\n/g, ' ').trim()
    };
    const request = store.add(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getHistory(docId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['history'], 'readonly');
    const store = transaction.objectStore('history');
    const index = store.index('docId');
    const request = index.getAll(docId);
    request.onsuccess = () => {
      const history = request.result.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
      resolve(history);
    };
    request.onerror = () => reject(request.error);
  });
}

// ==========================================
// Application State
// ==========================================
const state = {
  tabs: [],
  activeTabId: null,
  theme: 'system',
  viewMode: 'split', // 'edit', 'split', 'preview'
  hintsVisible: false,
  autoSaveTimer: null,
  historyTimer: null,
  newFileCounter: 1,
  zoomLevel: 100,
  lastExportFormat: 'pdf',
  documentsListVisible: false,
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
    const language = token.lang || '';
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

// ==========================================
// Utility Functions
// ==========================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countChars(text) {
  return text.length;
}

// ==========================================
// Theme Management
// ==========================================
function initTheme() {
  const saved = localStorage.getItem('downedit-pwa-theme');
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
  localStorage.setItem('downedit-pwa-theme', state.theme);
  applyTheme();
  updateThemeLabel();
}

function updateThemeLabel() {
  const label = document.getElementById('theme-label');
  if (label) {
    const labels = { system: 'System', light: 'Light', dark: 'Dark' };
    label.textContent = labels[state.theme];
  }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.theme === 'system') {
    applyTheme();
  }
});

// ==========================================
// View Mode Management (Mobile-First: Preview Top, Editor Bottom)
// ==========================================
function setViewMode(mode) {
  state.viewMode = mode;
  const container = document.getElementById('editor-container');
  container.setAttribute('data-mode', mode);

  // Update mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`btn-mode-${mode}`);
  if (activeBtn) activeBtn.classList.add('active');
}

// ==========================================
// Tab Management
// ==========================================
function createTab(fileName, content, isNew = false) {
  const id = generateId();
  const tab = {
    id,
    fileName,
    content,
    originalContent: content,
    scrollPosition: 0,
    editorScrollPosition: 0,
    isDirty: isNew,
    isNew,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  state.tabs.push(tab);
  renderTabs();
  activateTab(id);

  // Save to IndexedDB
  saveDocument(tab);

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
      currentTab.content = editor?.value || currentTab.content;
    }
  }

  state.activeTabId = id;
  renderTabs();
  renderContent();
  updateStatusBar();
  showEditorView();

  // Save active tab state
  saveState('activeTabId', id);
}

function closeTab(id, force = false) {
  const tab = state.tabs.find(t => t.id === id);
  if (!tab) return;

  // Check for unsaved changes
  if (tab.isDirty && !force) {
    if (!confirm(`Do you want to discard changes to "${tab.fileName}"?`)) {
      return;
    }
  }

  const index = state.tabs.findIndex(t => t.id === id);
  state.tabs.splice(index, 1);

  // Delete from IndexedDB
  deleteDocument(id);

  if (state.tabs.length === 0) {
    state.activeTabId = null;
    showWelcome();
  } else if (id === state.activeTabId) {
    const newIndex = Math.min(index, state.tabs.length - 1);
    activateTab(state.tabs[newIndex].id);
  }

  renderTabs();
}

function updateTabUI(tab) {
  const tabEl = document.querySelector(`.tab[data-id="${tab.id}"]`);
  if (tabEl) {
    tabEl.classList.toggle('dirty', tab.isDirty);
    tabEl.querySelector('.tab-title').textContent = tab.fileName;
  }
}

function renderTabs() {
  const tabsContainer = document.getElementById('tabs');

  if (state.tabs.length === 0) {
    tabsContainer.innerHTML = '';
    return;
  }

  tabsContainer.innerHTML = state.tabs.map(tab => `
    <div class="tab ${tab.id === state.activeTabId ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}" data-id="${tab.id}">
      <span class="tab-title">${tab.fileName}</span>
      <button class="tab-close" data-id="${tab.id}" title="Close">&times;</button>
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

// ==========================================
// Content Rendering
// ==========================================
function showWelcome() {
  document.getElementById('welcome').classList.remove('hidden');
  document.getElementById('editor-container').classList.add('hidden');
  document.getElementById('status-bar').classList.add('hidden');
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

  // Render preview
  renderPreview();

  // Restore viewer scroll position
  viewer.scrollTop = tab.scrollPosition || 0;

  // Add copy button functionality
  viewer.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copyCode(btn));
  });
}

function renderPreview() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  const viewer = document.getElementById('viewer');
  viewer.innerHTML = marked.parse(tab.content);

  // Re-add copy button functionality
  viewer.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copyCode(btn));
  });
}

function updatePreview() {
  renderPreview();
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

// ==========================================
// Status Bar
// ==========================================
function updateStatusBar() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  const wordCount = countWords(tab.content);
  const charCount = countChars(tab.content);

  const wordEl = document.getElementById('status-wordcount');
  const charEl = document.getElementById('status-charcount');

  if (wordEl) wordEl.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
  if (charEl) charEl.textContent = `${charCount} char${charCount !== 1 ? 's' : ''}`;
}

function showAutoSaveStatus(saving = false) {
  const indicator = document.querySelector('.autosave-indicator');
  const text = document.getElementById('autosave-text');

  if (indicator && text) {
    if (saving) {
      indicator.classList.add('saving');
      text.textContent = 'Saving...';
    } else {
      indicator.classList.remove('saving');
      text.textContent = 'Saved';
    }
  }
}

// ==========================================
// Auto-save and History
// ==========================================
async function autoSave() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  showAutoSaveStatus(true);

  // Update tab
  tab.updatedAt = Date.now();

  // Save to IndexedDB
  await saveDocument(tab);

  setTimeout(() => showAutoSaveStatus(false), 500);
}

async function saveToHistory(tab) {
  if (!tab || !tab.content.trim()) return;

  try {
    await saveHistory(tab.id, tab.content);
  } catch (err) {
    console.error('Failed to save history:', err);
  }
}

function saveTabState() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (tab) {
    saveDocument(tab);
  }
}

// ==========================================
// File Operations (PWA Browser APIs)
// ==========================================
function newFile() {
  const fileName = `Untitled-${state.newFileCounter++}.md`;
  createTab(fileName, '', true);
}

async function openFile() {
  try {
    // Use File System Access API if available (Chrome, Edge)
    if ('showOpenFilePicker' in window) {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'Markdown files',
          accept: { 'text/markdown': ['.md', '.markdown'], 'text/plain': ['.txt'] }
        }],
        multiple: false
      });
      const file = await fileHandle.getFile();
      const content = await file.text();
      createTab(file.name, content, false);
    } else {
      // Fallback to input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown,.txt,text/markdown,text/plain';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const content = await file.text();
          createTab(file.name, content, false);
        }
      };
      input.click();
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Error opening file:', err);
    }
  }
}

async function saveFile() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  await saveFileAs();
}

async function saveFileAs() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  try {
    // Use File System Access API if available
    if ('showSaveFilePicker' in window) {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: tab.fileName,
        types: [{
          description: 'Markdown file',
          accept: { 'text/markdown': ['.md'] }
        }]
      });
      const writable = await fileHandle.createWritable();
      await writable.write(tab.content);
      await writable.close();

      tab.fileName = fileHandle.name;
      tab.originalContent = tab.content;
      tab.isDirty = false;
      tab.isNew = false;
      renderTabs();
      saveDocument(tab);
    } else {
      // Fallback: use Share API or download
      await shareOrDownloadFile(tab);
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Error saving file:', err);
      // Fallback to download
      downloadFile(tab.fileName, tab.content, 'text/markdown');
    }
  }
}

async function shareOrDownloadFile(tab) {
  const file = new File([tab.content], tab.fileName, { type: 'text/markdown' });

  // Try Share API first (iOS Safari supports this)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: tab.fileName,
      });
      tab.originalContent = tab.content;
      tab.isDirty = false;
      renderTabs();
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
      // Fall through to download
    }
  }

  // Fallback to download
  downloadFile(tab.fileName, tab.content, 'text/markdown');
  tab.originalContent = tab.content;
  tab.isDirty = false;
  renderTabs();
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// Editor Input Handler
// ==========================================
function handleEditorInput() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  const editor = document.getElementById('editor');
  tab.content = editor.value;
  tab.isDirty = tab.content !== tab.originalContent;

  renderTabs();
  renderPreview();
  updateStatusBar();

  // Debounced auto-save
  clearTimeout(state.autoSaveTimer);
  state.autoSaveTimer = setTimeout(autoSave, 1000);

  // Debounced history save
  clearTimeout(state.historyTimer);
  state.historyTimer = setTimeout(() => saveToHistory(tab), 30000);
}

// ==========================================
// Formatting Toolbar
// ==========================================
function showFormattingToolbar() {
  const toolbar = document.getElementById('formatting-toolbar');
  if (toolbar) toolbar.classList.remove('hidden');
}

function hideFormattingToolbar() {
  const toolbar = document.getElementById('formatting-toolbar');
  if (toolbar) toolbar.classList.add('hidden');
}

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

  let lineStart = sel.start;
  while (lineStart > 0 && editor.value[lineStart - 1] !== '\n') {
    lineStart--;
  }

  const lineText = editor.value.substring(lineStart, sel.start);
  if (lineText.startsWith(prefix)) {
    const newContent = editor.value.substring(0, lineStart) +
                      editor.value.substring(lineStart + prefix.length);
    setEditorContent(newContent, sel.start - prefix.length, sel.end - prefix.length);
  } else {
    const newContent = editor.value.substring(0, lineStart) + prefix + editor.value.substring(lineStart);
    setEditorContent(newContent, sel.start + prefix.length, sel.end + prefix.length);
  }
}

// Formatting functions
function formatBold() { wrapSelection('**'); }
function formatItalic() { wrapSelection('*'); }
function formatStrikethrough() { wrapSelection('~~'); }
function formatInlineCode() { wrapSelection('`'); }

function formatHeading(level) {
  const prefix = '#'.repeat(level) + ' ';
  const editor = document.getElementById('editor');
  const sel = getEditorSelection();

  let lineStart = sel.start;
  while (lineStart > 0 && editor.value[lineStart - 1] !== '\n') {
    lineStart--;
  }

  let lineEnd = sel.end;
  while (lineEnd < editor.value.length && editor.value[lineEnd] !== '\n') {
    lineEnd++;
  }

  const lineText = editor.value.substring(lineStart, lineEnd);
  const headingMatch = lineText.match(/^#{1,6}\s*/);
  let newLineText = lineText;
  let adjustment = 0;

  if (headingMatch) {
    newLineText = lineText.substring(headingMatch[0].length);
    adjustment = -headingMatch[0].length;
  }

  newLineText = prefix + newLineText;
  adjustment += prefix.length;

  const newContent = editor.value.substring(0, lineStart) + newLineText + editor.value.substring(lineEnd);
  setEditorContent(newContent, sel.start + adjustment, sel.end + adjustment);

  closeHeadingMenu();
}

function formatBulletList() { insertAtLineStart('- '); }
function formatNumberedList() { insertAtLineStart('1. '); }
function formatTaskList() { insertAtLineStart('- [ ] '); }
function formatBlockquote() { insertAtLineStart('> '); }

function formatHorizontalRule() {
  const sel = getEditorSelection();
  const needsNewlineBefore = sel.start > 0 && sel.before[sel.before.length - 1] !== '\n';
  const hr = (needsNewlineBefore ? '\n' : '') + '\n---\n\n';
  insertAtCursor(hr);
}

// ==========================================
// Dialog Management
// ==========================================
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
  dialog.querySelectorAll('input').forEach(input => {
    input.value = '';
  });
}

function closeAllDialogs() {
  document.querySelectorAll('.modal-overlay').forEach(dialog => {
    dialog.classList.add('hidden');
    dialog.querySelectorAll('input').forEach(input => {
      input.value = '';
    });
  });
}

// ==========================================
// Link Dialog
// ==========================================
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

  if (!url) {
    document.getElementById('link-url').focus();
    return;
  }

  const markdown = `[${text}](${url})`;

  const sel = getEditorSelection();
  if (sel.text) {
    const newContent = sel.before + markdown + sel.after;
    setEditorContent(newContent, sel.start, sel.start + markdown.length);
  } else {
    insertAtCursor(markdown);
  }

  closeDialog('link-dialog');
}

// ==========================================
// Image Dialog
// ==========================================
function openImageDialog() {
  const sel = getEditorSelection();
  if (sel.text) {
    document.getElementById('image-alt').value = sel.text;
  }
  openDialog('image-dialog');
}

function insertImage() {
  const alt = document.getElementById('image-alt').value || 'image';
  const url = document.getElementById('image-url').value;

  if (!url) {
    document.getElementById('image-url').focus();
    return;
  }

  const markdown = `![${alt}](${url})`;
  insertAtCursor(markdown);
  closeDialog('image-dialog');
}

// ==========================================
// Code Block Dialog
// ==========================================
function openCodeDialog() {
  openDialog('code-dialog');
}

function insertCodeBlock() {
  const language = document.getElementById('code-language').value;
  const codeBlock = '\n```' + language + '\n\n```\n';

  const sel = getEditorSelection();
  const newContent = sel.before + codeBlock + sel.after;
  const cursorPos = sel.start + 4 + language.length + 1;
  setEditorContent(newContent, cursorPos, cursorPos);

  closeDialog('code-dialog');
}

// ==========================================
// Heading Menu
// ==========================================
function toggleHeadingMenu() {
  const menu = document.getElementById('heading-menu');
  menu.classList.toggle('hidden');
}

function closeHeadingMenu() {
  const menu = document.getElementById('heading-menu');
  if (menu) menu.classList.add('hidden');
}

// ==========================================
// Export Functions
// ==========================================
function toggleExportMenu() {
  const menu = document.getElementById('export-menu');
  menu.classList.toggle('hidden');
}

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
  const pageSize = document.getElementById('pdf-pagesize').value;
  const fontSize = parseInt(document.getElementById('pdf-fontsize').value) || 11;

  closeDialog('pdf-dialog');

  const pageSizes = {
    letter: [215.9, 279.4],
    a4: [210, 297]
  };
  const [pageWidth, pageHeight] = pageSizes[pageSize] || pageSizes.letter;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize === 'a4' ? 'a4' : 'letter'
  });

  const margin = 25.4;
  const maxWidth = pageWidth - (margin * 2);
  const lineSpacing = fontSize * 0.35 * 1.5;
  let y = margin;

  pdf.setFont('helvetica');
  pdf.setFontSize(fontSize);

  const lines = tab.content.split('\n');

  for (const line of lines) {
    if (y > pageHeight - margin - 10) {
      pdf.addPage();
      y = margin;
    }

    if (line.startsWith('# ')) {
      pdf.setFontSize(fontSize * 2);
      pdf.setFont('helvetica', 'bold');
      const text = line.substring(2);
      const splitText = pdf.splitTextToSize(text, maxWidth);
      pdf.text(splitText, margin, y);
      y += splitText.length * fontSize * 0.7 + lineSpacing * 2;
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');
    } else if (line.startsWith('## ')) {
      pdf.setFontSize(fontSize * 1.5);
      pdf.setFont('helvetica', 'bold');
      const text = line.substring(3);
      const splitText = pdf.splitTextToSize(text, maxWidth);
      pdf.text(splitText, margin, y);
      y += splitText.length * fontSize * 0.55 + lineSpacing * 1.5;
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');
    } else if (line.startsWith('### ')) {
      pdf.setFontSize(fontSize * 1.2);
      pdf.setFont('helvetica', 'bold');
      const text = line.substring(4);
      const splitText = pdf.splitTextToSize(text, maxWidth);
      pdf.text(splitText, margin, y);
      y += splitText.length * fontSize * 0.45 + lineSpacing;
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'normal');
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = '• ' + line.substring(2);
      const splitText = pdf.splitTextToSize(text, maxWidth - 5);
      pdf.text(splitText, margin + 5, y);
      y += splitText.length * lineSpacing;
    } else if (/^\d+\.\s/.test(line)) {
      const splitText = pdf.splitTextToSize(line, maxWidth - 5);
      pdf.text(splitText, margin + 5, y);
      y += splitText.length * lineSpacing;
    } else if (line.trim() === '') {
      y += lineSpacing * 0.5;
    } else {
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

  const defaultFileName = tab.fileName.replace(/\.(md|markdown|txt)$/, '') + '.pdf';
  pdf.save(defaultFileName);
}

// Word Export
function openDocxDialog() {
  closeExportMenu();
  openDialog('docx-dialog');
}

async function exportToDocx() {
  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  state.lastExportFormat = 'docx';
  closeDialog('docx-dialog');

  const content = tab.content;
  const lines = content.split('\n');
  const children = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      children.push(new Paragraph({ text: line.substring(2), heading: HeadingLevel.HEADING_1 }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2 }));
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({ text: line.substring(4), heading: HeadingLevel.HEADING_3 }));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      children.push(new Paragraph({ text: line.substring(2), bullet: { level: 0 } }));
    } else if (/^\d+\.\s/.test(line)) {
      children.push(new Paragraph({ text: line.replace(/^\d+\.\s/, ''), numbering: { reference: 'default-numbering', level: 0 } }));
    } else if (line.trim() === '') {
      children.push(new Paragraph({ text: '' }));
    } else {
      children.push(new Paragraph({ text: line }));
    }
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.START }],
      }],
    },
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const defaultFileName = tab.fileName.replace(/\.(md|markdown|txt)$/, '') + '.docx';
  downloadFile(defaultFileName, blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
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
  closeDialog('html-dialog');

  const renderedContent = marked.parse(tab.content);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(tab.fileName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; }
    h1, h2, h3 { margin-top: 24px; margin-bottom: 16px; }
    code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 4px; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { padding: 0; background: transparent; }
    blockquote { border-left: 4px solid #e0e0e0; padding-left: 1em; margin-left: 0; color: #666; }
  </style>
</head>
<body>
${renderedContent}
</body>
</html>`;

  const defaultFileName = tab.fileName.replace(/\.(md|markdown|txt)$/, '') + '.html';
  downloadFile(defaultFileName, html, 'text/html');
}

// ==========================================
// Documents List (Mobile)
// ==========================================
function toggleDocumentsList() {
  state.documentsListVisible = !state.documentsListVisible;
  const panel = document.getElementById('documents-panel');
  if (panel) {
    panel.classList.toggle('visible', state.documentsListVisible);
    if (state.documentsListVisible) {
      renderDocumentsList();
    }
  }
}

async function renderDocumentsList() {
  const content = document.getElementById('documents-content');
  if (!content) return;

  const docs = await getAllDocuments();

  if (docs.length === 0) {
    content.innerHTML = '<p class="no-docs">No saved documents</p>';
    return;
  }

  docs.sort((a, b) => b.updatedAt - a.updatedAt);

  content.innerHTML = docs.map(doc => `
    <div class="doc-item ${doc.id === state.activeTabId ? 'active' : ''}" data-id="${doc.id}">
      <span class="doc-name">${doc.fileName}</span>
      <span class="doc-date">${formatDate(doc.updatedAt)}</span>
    </div>
  `).join('');

  content.querySelectorAll('.doc-item').forEach(item => {
    item.addEventListener('click', () => {
      const existingTab = state.tabs.find(t => t.id === item.dataset.id);
      if (existingTab) {
        activateTab(existingTab.id);
      } else {
        loadDocumentFromDB(item.dataset.id);
      }
      toggleDocumentsList();
    });
  });
}

async function loadDocumentFromDB(id) {
  const doc = await getDocument(id);
  if (doc) {
    state.tabs.push(doc);
    renderTabs();
    activateTab(doc.id);
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

// ==========================================
// Resize Handle for Split View
// ==========================================
function initResizeHandle() {
  const handle = document.getElementById('resize-handle');
  const previewPane = document.getElementById('preview-pane');
  const container = document.getElementById('editor-container');

  if (!handle || !previewPane || !container) return;

  let isResizing = false;
  let startY = 0;
  let startHeight = 0;

  const startResize = (clientY) => {
    isResizing = true;
    startY = clientY;
    startHeight = previewPane.offsetHeight;
    handle.classList.add('dragging');
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const doResize = (clientY) => {
    if (!isResizing) return;

    const containerHeight = container.offsetHeight;
    const deltaY = clientY - startY;
    const newHeight = startHeight - deltaY;
    const minHeight = 100;
    const maxHeight = containerHeight - 150;

    previewPane.style.flex = 'none';
    previewPane.style.height = `${Math.min(Math.max(newHeight, minHeight), maxHeight)}px`;
  };

  const stopResize = () => {
    if (isResizing) {
      isResizing = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  };

  // Mouse events
  handle.addEventListener('mousedown', (e) => startResize(e.clientY));
  document.addEventListener('mousemove', (e) => doResize(e.clientY));
  document.addEventListener('mouseup', stopResize);

  // Touch events for mobile
  handle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startResize(e.touches[0].clientY);
  });
  document.addEventListener('touchmove', (e) => {
    if (isResizing) {
      e.preventDefault();
      doResize(e.touches[0].clientY);
    }
  }, { passive: false });
  document.addEventListener('touchend', stopResize);
}

// ==========================================
// Keyboard Shortcuts
// ==========================================
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
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

    // Escape - Close dialogs
    if (e.key === 'Escape') {
      closeAllDialogs();
      closeHeadingMenu();
      closeExportMenu();
    }

    // Formatting shortcuts (when editor is focused)
    if (document.activeElement === document.getElementById('editor')) {
      if (e.ctrlKey && !e.shiftKey && e.key === 'b') {
        e.preventDefault();
        formatBold();
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'i') {
        e.preventDefault();
        formatItalic();
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'k') {
        e.preventDefault();
        openLinkDialog();
      }
    }
  });
}

// ==========================================
// Event Listeners
// ==========================================
function initEventListeners() {
  // Toolbar buttons
  document.getElementById('btn-new')?.addEventListener('click', newFile);
  document.getElementById('btn-open')?.addEventListener('click', openFile);
  document.getElementById('btn-save')?.addEventListener('click', saveFile);
  document.getElementById('btn-theme')?.addEventListener('click', cycleTheme);
  document.getElementById('btn-docs')?.addEventListener('click', toggleDocumentsList);

  // Welcome buttons
  document.getElementById('btn-new-welcome')?.addEventListener('click', newFile);
  document.getElementById('btn-open-welcome')?.addEventListener('click', openFile);

  // View mode buttons
  document.getElementById('btn-mode-edit')?.addEventListener('click', () => setViewMode('edit'));
  document.getElementById('btn-mode-split')?.addEventListener('click', () => setViewMode('split'));
  document.getElementById('btn-mode-preview')?.addEventListener('click', () => setViewMode('preview'));

  // Editor input
  const editor = document.getElementById('editor');
  editor?.addEventListener('input', handleEditorInput);

  // Handle tab key in editor
  editor?.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
      handleEditorInput();
    }
  });

  // Formatting toolbar
  initFormattingToolbar();

  // Close documents panel when clicking outside
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('documents-panel');
    const btn = document.getElementById('btn-docs');
    if (panel && state.documentsListVisible &&
        !panel.contains(e.target) && !btn?.contains(e.target)) {
      toggleDocumentsList();
    }
  });
}

function initFormattingToolbar() {
  document.getElementById('fmt-bold')?.addEventListener('click', formatBold);
  document.getElementById('fmt-italic')?.addEventListener('click', formatItalic);
  document.getElementById('fmt-strikethrough')?.addEventListener('click', formatStrikethrough);
  document.getElementById('fmt-code-inline')?.addEventListener('click', formatInlineCode);

  // Heading dropdown
  document.getElementById('fmt-heading')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleHeadingMenu();
  });

  document.getElementById('heading-menu')?.querySelectorAll('[data-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      formatHeading(parseInt(btn.dataset.level));
    });
  });

  document.addEventListener('click', () => closeHeadingMenu());

  // Lists
  document.getElementById('fmt-ul')?.addEventListener('click', formatBulletList);
  document.getElementById('fmt-ol')?.addEventListener('click', formatNumberedList);
  document.getElementById('fmt-task')?.addEventListener('click', formatTaskList);

  // Block elements
  document.getElementById('fmt-quote')?.addEventListener('click', formatBlockquote);
  document.getElementById('fmt-hr')?.addEventListener('click', formatHorizontalRule);

  // Insert elements
  document.getElementById('fmt-link')?.addEventListener('click', openLinkDialog);
  document.getElementById('fmt-image')?.addEventListener('click', openImageDialog);
  document.getElementById('fmt-code-block')?.addEventListener('click', openCodeDialog);

  // Export
  document.getElementById('btn-export')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleExportMenu();
  });

  document.addEventListener('click', (e) => {
    const exportBtn = document.getElementById('btn-export');
    const exportMenu = document.getElementById('export-menu');
    if (exportBtn && exportMenu && !exportBtn.contains(e.target) && !exportMenu.contains(e.target)) {
      closeExportMenu();
    }
  });

  document.getElementById('export-pdf')?.addEventListener('click', openPdfDialog);
  document.getElementById('export-docx')?.addEventListener('click', openDocxDialog);
  document.getElementById('export-html')?.addEventListener('click', openHtmlDialog);

  // Dialog buttons
  initDialogs();
}

function initDialogs() {
  // Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) closeDialog(modal.id);
    });
  });

  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDialog(overlay.id);
    });
  });

  // Link dialog
  document.getElementById('link-insert')?.addEventListener('click', insertLink);
  document.getElementById('link-url')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') insertLink();
  });

  // Image dialog
  document.getElementById('image-insert')?.addEventListener('click', insertImage);
  document.getElementById('image-url')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') insertImage();
  });

  // Code dialog
  document.getElementById('code-insert')?.addEventListener('click', insertCodeBlock);

  // Export dialogs
  document.getElementById('pdf-export-btn')?.addEventListener('click', exportToPdf);
  document.getElementById('docx-export-btn')?.addEventListener('click', exportToDocx);
  document.getElementById('html-export-btn')?.addEventListener('click', exportToHtml);
}

// ==========================================
// PWA Installation
// ==========================================
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show install button if available
  const installBtn = document.getElementById('btn-install');
  if (installBtn) {
    installBtn.classList.remove('hidden');
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (outcome === 'accepted') {
          installBtn.classList.add('hidden');
        }
      }
    });
  }
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const installBtn = document.getElementById('btn-install');
  if (installBtn) installBtn.classList.add('hidden');
});

// ==========================================
// Service Worker Registration
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed:', err);
      });
  });
}

// ==========================================
// Initialize App
// ==========================================
async function initApp() {
  console.log('Initializing down.edit PWA...');

  // Initialize IndexedDB
  await initDB();

  // Initialize theme
  initTheme();

  // Initialize event listeners
  initEventListeners();
  initKeyboardShortcuts();
  initResizeHandle();

  // Set default view mode
  setViewMode('split');

  // Load saved state
  const savedActiveTabId = await getState('activeTabId');
  const savedDocs = await getAllDocuments();

  if (savedDocs.length > 0) {
    // Load tabs from saved documents
    state.tabs = savedDocs;
    renderTabs();

    // Activate saved tab or first tab
    const tabToActivate = savedActiveTabId && state.tabs.find(t => t.id === savedActiveTabId)
      ? savedActiveTabId
      : state.tabs[0].id;
    activateTab(tabToActivate);
  } else {
    showWelcome();
  }
}

document.addEventListener('DOMContentLoaded', initApp);
