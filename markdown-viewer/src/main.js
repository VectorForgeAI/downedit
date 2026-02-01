// Downedit - Main Application
import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
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

// Application State
const state = {
  tabs: [],
  activeTabId: null,
  theme: 'system',
  outlineVisible: false,
  historyVisible: false,
  viewMode: 'split', // 'edit', 'split', 'preview'
  isFullscreen: false,
  autoSaveTimer: null,
  historyTimer: null,
  newFileCounter: 1,
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

// Fullscreen Management
function toggleFullscreen() {
  state.isFullscreen = !state.isFullscreen;
  document.body.classList.toggle('fullscreen', state.isFullscreen);
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
  const title = document.getElementById('image-title').value;

  if (!url) {
    document.getElementById('image-url').focus();
    return;
  }

  let markdown = `![${alt}](${url}`;
  if (title) {
    markdown += ` "${title}"`;
  }
  markdown += ')';

  insertAtCursor(markdown);
  closeDialog('image-dialog');
}

// Table dialog
let tableAlignments = [];

function openTableDialog() {
  updateTablePreview();
  openDialog('table-dialog');
}

function updateTablePreview() {
  const rows = parseInt(document.getElementById('table-rows').value) || 3;
  const cols = parseInt(document.getElementById('table-cols').value) || 3;

  // Update alignment controls
  const alignmentContainer = document.getElementById('table-alignment');
  alignmentContainer.innerHTML = '';
  tableAlignments = tableAlignments.slice(0, cols);
  while (tableAlignments.length < cols) {
    tableAlignments.push('left');
  }

  for (let i = 0; i < cols; i++) {
    const group = document.createElement('div');
    group.className = 'alignment-group';
    group.innerHTML = `
      <span>Col ${i + 1}</span>
      <button class="alignment-btn ${tableAlignments[i] === 'left' ? 'active' : ''}" data-col="${i}" data-align="left">L</button>
      <button class="alignment-btn ${tableAlignments[i] === 'center' ? 'active' : ''}" data-col="${i}" data-align="center">C</button>
      <button class="alignment-btn ${tableAlignments[i] === 'right' ? 'active' : ''}" data-col="${i}" data-align="right">R</button>
    `;
    alignmentContainer.appendChild(group);
  }

  // Add alignment button listeners
  alignmentContainer.querySelectorAll('.alignment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const col = parseInt(btn.dataset.col);
      tableAlignments[col] = btn.dataset.align;
      updateTablePreview();
    });
  });

  // Generate preview
  const preview = document.getElementById('table-preview');
  preview.textContent = generateTableMarkdown(rows, cols, tableAlignments);
}

function generateTableMarkdown(rows, cols, alignments) {
  const lines = [];

  // Header row
  const headerCells = [];
  for (let c = 0; c < cols; c++) {
    headerCells.push(`Header ${c + 1}`);
  }
  lines.push('| ' + headerCells.join(' | ') + ' |');

  // Separator row with alignment
  const separatorCells = [];
  for (let c = 0; c < cols; c++) {
    const align = alignments[c] || 'left';
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
  for (let r = 0; r < rows - 1; r++) {
    const dataCells = [];
    for (let c = 0; c < cols; c++) {
      dataCells.push(`Cell ${r + 1},${c + 1}`);
    }
    lines.push('| ' + dataCells.join(' | ') + ' |');
  }

  return lines.join('\n');
}

function insertTable() {
  const rows = parseInt(document.getElementById('table-rows').value) || 3;
  const cols = parseInt(document.getElementById('table-cols').value) || 3;

  const markdown = '\n' + generateTableMarkdown(rows, cols, tableAlignments) + '\n';
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

  const theme = document.getElementById('pdf-theme').value;
  const pageSize = document.getElementById('pdf-pagesize').value;
  const margin = parseInt(document.getElementById('pdf-margin').value) || 20;
  const fontSize = parseInt(document.getElementById('pdf-fontsize').value) || 11;
  const lineHeight = parseFloat(document.getElementById('pdf-lineheight').value) || 1.5;

  closeDialog('pdf-dialog');

  // Get page dimensions
  const pageSizes = {
    a4: [210, 297],
    letter: [216, 279],
    legal: [216, 356]
  };
  const [pageWidth, pageHeight] = pageSizes[pageSize] || pageSizes.a4;

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

  // Save PDF
  const fileName = tab.fileName.replace(/\.(md|markdown|txt)$/, '') + '.pdf';
  pdf.save(fileName);
}

// DOCX Export
async function exportToDocx() {
  closeExportMenu();

  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

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
      children: children,
    }],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const fileName = tab.fileName.replace(/\.(md|markdown|txt)$/, '') + '.docx';

  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
async function exportToHtml() {
  closeExportMenu();

  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  // Generate HTML with styling
  const renderedContent = marked.parse(tab.content);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(tab.fileName)}</title>
  <style>
    :root {
      --bg-primary: #ffffff;
      --text-primary: #1a1a1a;
      --text-secondary: #666666;
      --accent: #0066cc;
      --border: #e0e0e0;
      --code-bg: #f6f8fa;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #1e1e1e;
        --text-primary: #e0e0e0;
        --text-secondary: #a0a0a0;
        --accent: #4da6ff;
        --border: #404040;
        --code-bg: #2d2d2d;
      }
    }

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

    img { max-width: 100%; height: auto; border-radius: 6px; }
  </style>
</head>
<body>
${renderedContent}
</body>
</html>`;

  // Create download
  const blob = new Blob([html], { type: 'text/html' });
  const fileName = tab.fileName.replace(/\.(md|markdown|txt)$/, '') + '.html';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
    const content = await invoke('read_file', { path: filePath });
    const fileName = await invoke('get_file_name', { path: filePath });
    createTab(filePath, fileName, content, false);
  } catch (err) {
    console.error('Error loading file:', err);
    alert(`Failed to open file: ${err}`);
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

    // F11 - Fullscreen
    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullscreen();
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

      // Ctrl+Shift+S - Strikethrough (but not Ctrl+S which is save)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        formatStrikethrough();
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
  document.getElementById('btn-theme').addEventListener('click', cycleTheme);
  document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);

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

  // Table dialog
  document.getElementById('table-insert').addEventListener('click', insertTable);
  document.getElementById('table-rows').addEventListener('input', updateTablePreview);
  document.getElementById('table-cols').addEventListener('input', updateTablePreview);

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

  // Export options
  document.getElementById('export-pdf').addEventListener('click', openPdfDialog);
  document.getElementById('export-docx').addEventListener('click', exportToDocx);
  document.getElementById('export-html').addEventListener('click', exportToHtml);

  // PDF export button in dialog
  document.getElementById('pdf-export-btn').addEventListener('click', exportToPdf);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  initTheme();
  initEventListeners();
  initDragDrop();
  initKeyboardShortcuts();
  initResizeHandle();
  setViewMode('split');

  // Try to restore auto-saved content
  if (!loadAutoSave()) {
    showWelcome();
  }
});
