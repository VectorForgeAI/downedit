// MarkdownViewer - Main Application
import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

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
  viewMode: 'split', // 'edit', 'split', 'preview'
  isFullscreen: false,
  autoSaveTimer: null,
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
}

function showEditorView() {
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('editor-container').classList.remove('hidden');
  document.getElementById('status-bar').classList.remove('hidden');
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

  // Debounced auto-save
  clearTimeout(state.autoSaveTimer);
  state.autoSaveTimer = setTimeout(autoSave, 1000);
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
  });
}

// Event Listeners
function initEventListeners() {
  // Toolbar buttons
  document.getElementById('btn-new').addEventListener('click', newFile);
  document.getElementById('btn-open').addEventListener('click', openFile);
  document.getElementById('btn-save').addEventListener('click', saveFile);
  document.getElementById('btn-outline').addEventListener('click', toggleOutline);
  document.getElementById('btn-close-outline').addEventListener('click', toggleOutline);
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
  document.getElementById('editor').addEventListener('input', handleEditorInput);

  // Handle tab key in editor
  document.getElementById('editor').addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const editor = e.target;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
      handleEditorInput();
    }
  });
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
