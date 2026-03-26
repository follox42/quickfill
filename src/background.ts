import { Message } from './lib/types';

async function injectAndSend(tabId: number, msg: Message) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch {} // Already injected or restricted page (chrome://, etc.)
  try {
    chrome.tabs.sendMessage(tabId, msg);
  } catch {}
}

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'fill-form') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    injectAndSend(tab.id, { type: 'FILL_WITH_SHORTCUT' });
  }
});

// Context menu for right-click fill
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'quickfill-fill',
    title: 'QuickFill — Fill this form',
    contexts: ['page', 'editable'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'quickfill-fill' && tab?.id) {
    injectAndSend(tab.id, { type: 'FILL_WITH_SHORTCUT' });
  }
});

// Open options page on extension icon action (when no popup needed)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
  }
  return false;
});
