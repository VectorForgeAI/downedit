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
  theme: 'system', // 'system', 'light', 'dark'
  outlineVisible: false,
};

// Configure marked with GFM
const marked = new Marked({
  gfm: true,
  breaks: true,
  pedantic: false,
});

// Custom renderer for code blocks with copy button
// Note: marked v17+ passes token objects to renderer functions
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

  // Add IDs to headings for outline navigation
  heading(token) {
    const text = token.text || '';
    const level = token.depth || 1;
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<h${level} id="${id}">${text}</h${level}>`;
  },

  // Task list items
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

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.theme === 'system') {
    applyTheme();
  }
});

// Tab Management
function createTab(filePath, fileName, content) {
  const id = generateId();
  const tab = {
    id,
    filePath,
    fileName,
    content,
    scrollPosition: 0,
  };

  state.tabs.push(tab);
  renderTabs();
  activateTab(id);

  return tab;
}

function activateTab(id) {
  state.activeTabId = id;
  renderTabs();
  renderContent();
  updateOutline();
}

function closeTab(id) {
  const index = state.tabs.findIndex(t => t.id === id);
  if (index === -1) return;

  // Save scroll position before closing
  const viewer = document.getElementById('viewer');
  const currentTab = state.tabs.find(t => t.id === state.activeTabId);
  if (currentTab && viewer) {
    currentTab.scrollPosition = viewer.scrollTop;
  }

  state.tabs.splice(index, 1);

  if (state.tabs.length === 0) {
    state.activeTabId = null;
    showWelcome();
  } else if (id === state.activeTabId) {
    // Activate adjacent tab
    const newIndex = Math.min(index, state.tabs.length - 1);
    activateTab(state.tabs[newIndex].id);
  }

  renderTabs();
}

function renderTabs() {
  const tabsContainer = document.getElementById('tabs');

  if (state.tabs.length === 0) {
    tabsContainer.innerHTML = '';
    return;
  }

  tabsContainer.innerHTML = state.tabs.map(tab => `
    <div class="tab ${tab.id === state.activeTabId ? 'active' : ''}" data-id="${tab.id}">
      <span class="tab-title" title="${tab.filePath || tab.fileName}">${tab.fileName}</span>
      <button class="tab-close" data-id="${tab.id}" title="Close">×</button>
    </div>
  `).join('');

  // Add event listeners
  tabsContainer.querySelectorAll('.tab').forEach(tabEl => {
    tabEl.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close')) {
        // Save current scroll position
        const viewer = document.getElementById('viewer');
        const currentTab = state.tabs.find(t => t.id === state.activeTabId);
        if (currentTab && viewer) {
          currentTab.scrollPosition = viewer.scrollTop;
        }
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
function renderContent() {
  const welcome = document.getElementById('welcome');
  const viewer = document.getElementById('viewer');

  if (!state.activeTabId) {
    showWelcome();
    return;
  }

  const tab = state.tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;

  welcome.classList.add('hidden');
  viewer.classList.remove('hidden');

  // Render markdown
  viewer.innerHTML = marked.parse(tab.content);

  // Restore scroll position
  viewer.scrollTop = tab.scrollPosition || 0;

  // Add copy button functionality
  viewer.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copyCode(btn));
  });
}

function showWelcome() {
  document.getElementById('welcome').classList.remove('hidden');
  document.getElementById('viewer').classList.add('hidden');
  document.getElementById('outline-content').innerHTML = '';
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

  // Add click handlers
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

// File Operations - Use Rust command for file dialog
async function openFile() {
  console.log('openFile called');
  try {
    // Call Rust command to open file dialog
    const selected = await invoke('open_file_dialog');
    console.log('Dialog returned:', selected);

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
  console.log('loadFile called with:', filePath);
  // Check if file is already open
  const existingTab = state.tabs.find(t => t.filePath === filePath);
  if (existingTab) {
    activateTab(existingTab.id);
    return;
  }

  try {
    const content = await invoke('read_file', { path: filePath });
    const fileName = await invoke('get_file_name', { path: filePath });
    console.log('File loaded:', fileName);
    createTab(filePath, fileName, content);
  } catch (err) {
    console.error('Error loading file:', err);
    alert(`Failed to open file: ${err}`);
  }
}

// Drag and Drop - Using Tauri event system
async function initDragDrop() {
  // Create overlay
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

  // Listen for Tauri drag-drop events
  try {
    await listen('tauri://drag-over', () => {
      overlay.classList.add('active');
    });

    await listen('tauri://drag-leave', () => {
      overlay.classList.remove('active');
    });

    await listen('tauri://drag-drop', async (event) => {
      overlay.classList.remove('active');
      console.log('Drop event:', event);
      const paths = event.payload.paths || event.payload;
      if (Array.isArray(paths)) {
        for (const filePath of paths) {
          if (filePath.endsWith('.md') || filePath.endsWith('.markdown') || filePath.endsWith('.txt')) {
            await loadFile(filePath);
          }
        }
      }
    });

    console.log('Drag-drop listeners registered');
  } catch (err) {
    console.error('Error setting up drag-drop:', err);
  }
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+O - Open file
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      openFile();
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
  });
}

// Event Listeners
function initEventListeners() {
  // Toolbar buttons
  document.getElementById('btn-open').addEventListener('click', openFile);
  document.getElementById('btn-open-welcome').addEventListener('click', openFile);
  document.getElementById('btn-outline').addEventListener('click', toggleOutline);
  document.getElementById('btn-close-outline').addEventListener('click', toggleOutline);
  document.getElementById('btn-theme').addEventListener('click', cycleTheme);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  initTheme();
  initEventListeners();
  initDragDrop();
  initKeyboardShortcuts();
});
