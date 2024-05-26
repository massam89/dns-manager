(async () => {
  const information = document.getElementById("info");
  const enable = document.getElementById("enable");
  const disable = document.getElementById("disable");
  const process = document.getElementById("process");
  const currentDNS = document.getElementById("currentDNS");

  const currentDNSHandler = async (isFromListener = false) => {
    process.innerText = "Processing";
    const response = await window.dns.isDNS();

    if (response.currentDNS.startsWith("10.") && isFromListener) {
      alert(`Please fix the issue:
1- Disable any VPN 
2- Run app as administrator`);
    }

    process.innerText = "";
    information.innerText = `${
      response.isCurrentDNSInTheSettingFile ? "ON" : "OFF"
    }`;
    information.style.color = `${
      response.isCurrentDNSInTheSettingFile ? "green" : "red"
    }`;
    currentDNS.innerText = response.currentDNS || "";
    enable.disabled = response.isCurrentDNSInTheSettingFile;
    disable.disabled = !response.isCurrentDNSInTheSettingFile;
  };

  currentDNSHandler();

  enable.addEventListener("click", async () => {
    process.innerText = "Processing";
    await window.dns.enable();
    process.innerText = "";
    information.innerText = `ON`;
    information.style.color = "green";
    enable.disabled = true;
    disable.disabled = false;
    currentDNSHandler(true);
  });

  disable.addEventListener("click", async () => {
    process.innerText = "Processing";
    await window.dns.disable();
    process.innerText = "";
    information.innerText = `OFF`;
    information.style.color = "red";
    enable.disabled = false;
    disable.disabled = true;
  });
})();
