(() => {
  const winUA = navigator.userAgent.replace(/\([^)]+\)/, "(Windows NT 10.0; Win64; x64)");
  const winAppVersion = navigator.appVersion.replace(/\([^)]+\)/, "(Windows NT 10.0; Win64; x64)");

  Object.defineProperty(Navigator.prototype, "userAgent", {
    get: () => winUA,
    configurable: true
  });

  Object.defineProperty(Navigator.prototype, "appVersion", {
    get: () => winAppVersion,
    configurable: true
  });

  Object.defineProperty(Navigator.prototype, "platform", {
    get: () => "Win32",
    configurable: true
  });
})();
