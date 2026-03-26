import { Message } from './lib/types';

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'fill-form') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { type: 'FILL_WITH_SHORTCUT' } satisfies Message);
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
    chrome.tabs.sendMessage(tab.id, { type: 'FILL_WITH_SHORTCUT' } satisfies Message);
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
