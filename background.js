function applyWindowsUA() {
  const winUA = navigator.userAgent.replace(/\([^)]+\)/, "(Windows NT 10.0; Win64; x64)");

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            { header: "User-Agent", operation: "set", value: winUA }
          ]
        },
        condition: {
          urlFilter: "*",
          resourceTypes: [
            "main_frame", "sub_frame", "stylesheet", "script",
            "image", "font", "object", "xmlhttprequest", "ping",
            "media", "websocket", "other"
          ]
        }
      }
    ]
  });
}

chrome.runtime.onInstalled.addListener(applyWindowsUA);
chrome.runtime.onStartup.addListener(applyWindowsUA);
