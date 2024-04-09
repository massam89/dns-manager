(async () => {
  const information = document.getElementById("info");
  const enable = document.getElementById("enable");
  const disable = document.getElementById("disable");
  const process = document.getElementById("process");

  enable.addEventListener("click", async () => {
    process.innerText = "Processing";
    await window.dns.enableShekan();
    process.innerText = "";
    information.innerText = `Shekan is ON`;
    information.style.color = "green";
    enable.disabled = true;
    disable.disabled = false;
  });

  disable.addEventListener("click", async () => {
    process.innerText = "Processing";
    await window.dns.disableShekan();
    process.innerText = "";
    information.innerText = `Shekan is OFF`;
    information.style.color = "red";
    enable.disabled = false;
    disable.disabled = true;
  });

  process.innerText = "Processing";
  const response = await window.dns.isShekanDNS();
  process.innerText = "";
  information.innerText = `Shekan is ${response ? "ON" : "OFF"}`;
  information.style.color = `${response ? "green" : "red"}`;
  enable.disabled = response;
  disable.disabled = !response;
})();
