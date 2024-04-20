(async () => {
  const information = document.getElementById("info");
  const enable = document.getElementById("enable");
  const disable = document.getElementById("disable");
  const process = document.getElementById("process");
  const DNSsElement = document.getElementById("DNSs");

  const DNSs = await window.dns.DNSs();
  DNSs.forEach((DNS) => {
    const liElement = document.createElement("li");
    liElement.innerText = DNS;
    DNSsElement.appendChild(liElement);
  });

  enable.addEventListener("click", async () => {
    process.innerText = "Processing";
    await window.dns.enable();
    process.innerText = "";
    information.innerText = `ON`;
    information.style.color = "green";
    enable.disabled = true;
    disable.disabled = false;
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

  process.innerText = "Processing";
  const response = await window.dns.isDNS();
  process.innerText = "";
  information.innerText = `${response ? "ON" : "OFF"}`;
  information.style.color = `${response ? "green" : "red"}`;
  enable.disabled = response;
  disable.disabled = !response;
})();
