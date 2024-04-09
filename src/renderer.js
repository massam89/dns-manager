(async () => {
  const information = document.getElementById("info");
  const enable = document.getElementById("enable");
  const disable = document.getElementById("disable");

  enable.addEventListener("click", async () => {
    await window.dns.enableShekan();
    information.innerText = `Shekan is ON`;
    information.style.color = "green";
    enable.disabled = true;
    disable.disabled = false;
  });

  disable.addEventListener("click", async () => {
    await window.dns.disableShekan();
    information.innerText = `Shekan is OFF`;
    information.style.color = "red";
    enable.disabled = false;
    disable.disabled = true;
  });

  const response = await window.dns.isShekanDNS();
  information.innerText = `Shekan is ${response ? "ON" : "OFF"}`;
  information.style.color = `${response ? "green" : "red"}`;
  enable.disabled = response;
  disable.disabled = !response;
})();
