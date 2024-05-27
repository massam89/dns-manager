(async () => {
  const information = document.getElementById("info");
  const enable = document.getElementById("enable");
  const disable = document.getElementById("disable");
  const process = document.getElementById("process");
  const currentDNS = document.getElementById("currentDNS");

  const getCurrentDNS = async () => {
    process.innerText = "Processing";
    const response = await window.dns.isDNS();
    process.innerText = "";

    information.innerText = `${
      response.isCurrentDNSInTheSettingFile ? "ON" : "OFF"
    }`;
    information.style.color = `${
      response.isCurrentDNSInTheSettingFile ? "green" : "red"
    }`;

    currentDNS.innerText = response.currentDNS;
  };

  await getCurrentDNS();

  enable.addEventListener("click", async () => {
    process.innerText = "Processing";
    await window.dns.enable();
    process.innerText = "";

    information.innerText = `ON`;
    information.style.color = "green";

    await getCurrentDNS();
  });

  disable.addEventListener("click", async () => {
    process.innerText = "Processing";
    await window.dns.disable();
    process.innerText = "";

    information.innerText = `OFF`;
    information.style.color = "red";

    await getCurrentDNS();
  });
})();
