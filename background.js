const SCRIPT_ID = "win-navigator-spoof";
const ALL_RESOURCE_TYPES = [
  "main_frame", "sub_frame", "stylesheet", "script",
  "image", "font", "object", "xmlhttprequest", "ping",
  "media", "websocket", "other"
];

function getChromeMajorVersion() {
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  return match ? match[1] : "131";
}

async function applyMode(mode) {
  const realUA = navigator.userAgent;
  const majorVer = getChromeMajorVersion();

  await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] }).catch(() => {});

  let requestHeaders = [];

  if (mode === "windows") {
    const winUA = realUA.replace(/\([^)]+\)/, "(Windows NT 10.0; Win64; x64)");
    requestHeaders = [
      { header: "User-Agent", operation: "set", value: winUA },
      { header: "Sec-CH-UA-Platform", operation: "set", value: "\"Windows\"" }
    ];

    await chrome.scripting.registerContentScripts([
      {
        id: SCRIPT_ID,
        matches: ["<all_urls>"],
        js: ["content.js"],
        runAt: "document_start",
        allFrames: true,
        world: "MAIN"
      }
    ]);
  } else {
    // Chế độ Linux: bổ sung custom header Os bị thiếu
    requestHeaders = [
      { header: "User-Agent", operation: "set", value: realUA },
      { header: "Os", operation: "set", value: "linux" },
      { header: "Sec-CH-UA", operation: "set", value: `"Chromium";v="${majorVer}", "Google Chrome";v="${majorVer}", "Not-A.Brand";v="99"` },
      { header: "Sec-CH-UA-Platform", operation: "set", value: "\"Linux\"" },
      { header: "Sec-CH-UA-Mobile", operation: "set", value: "?0" },
      { header: "Sec-CH-UA-Arch", operation: "set", value: "\"x86\"" },
      { header: "Sec-CH-UA-Bitness", operation: "set", value: "\"64\"" },
      { header: "Sec-CH-UA-Model", operation: "set", value: "\"\"" }
    ];
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders
        },
        condition: {
          urlFilter: "*",
          excludedRequestDomains: [
            "challenges.cloudflare.com",
            "cloudflarecaptcha.com",
            "cloudflare.com"
          ],
          resourceTypes: ALL_RESOURCE_TYPES
        }
      }
    ]
  });

  chrome.action.setBadgeText({ text: mode === "windows" ? "WIN" : "LNX" });
  chrome.action.setBadgeBackgroundColor({
    color: mode === "windows" ? "#0078D4" : "#E95420"
  });
}

async function initMode() {
  const { mode = "windows" } = await chrome.storage.local.get("mode");
  await applyMode(mode);
}

chrome.runtime.onInstalled.addListener(initMode);
chrome.runtime.onStartup.addListener(initMode);

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "SET_MODE") {
    chrome.storage.local.set({ mode: msg.mode }).then(async () => {
      await applyMode(msg.mode);
      sendResponse({ ok: true, mode: msg.mode });
    });
    return true;
  }
});
