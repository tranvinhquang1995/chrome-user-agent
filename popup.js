const radios = document.querySelectorAll('input[name="osMode"]');
const statusEl = document.getElementById("status");

function updateActiveStyle(mode) {
  document.getElementById("opt-windows").classList.toggle("active", mode === "windows");
  document.getElementById("opt-linux").classList.toggle("active", mode === "linux");
}

chrome.storage.local.get({ mode: "windows" }, ({ mode }) => {
  const radio = document.querySelector(`input[name="osMode"][value="${mode}"]`);
  if (radio) radio.checked = true;
  updateActiveStyle(mode);
});

radios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const mode = e.target.value;
    updateActiveStyle(mode);
    statusEl.textContent = "Đang áp dụng...";

    chrome.runtime.sendMessage({ type: "SET_MODE", mode }, (res) => {
      if (res && res.ok) {
        statusEl.textContent = `Đã chuyển sang ${mode === "windows" ? "Windows" : "Linux"}. Hãy F5 trang!`;
      }
    });
  });
});
