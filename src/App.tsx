import React, { Fragment, useCallback, useEffect, useState } from "react";
import "./App.css";
import {
  extractIPsAndWords,
  extractTimeFromPingText,
  parseLinesToObject,
  runCmd,
} from "./utils";
import setting from "./setting";

function App() {
  const [networkInterfaces, setNetworkInterfaces] = useState([]);
  const [dnsInputs, setDnsInputs] = useState(["", ""]);
  const [selectedInterface, setSelectedInterface] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState(setting.services);

  const changeDnsInputs = (event: any, index: number) => {
    const inputValue = event.target.value;
    const updatedDns = [...dnsInputs];
    updatedDns[index] = inputValue;
    setDnsInputs(updatedDns);
  };

  const getAndSetNetworkInterfacesAndTheirDetails = useCallback(async () => {
    setIsLoading(true);

    const getNetworkInterfacesResult = await runCmd("netsh", [
      "interface",
      "show",
      "interface",
    ]);

    const parsedNetworkInterfacesResult: any = parseLinesToObject(
      getNetworkInterfacesResult.stdout
    ).map((item) => ({
      "Admin State": item[0],
      State: item[1],
      Type: item[2],
      "Interface Name": item[3],
    }));

    setNetworkInterfaces(parsedNetworkInterfacesResult);

    const promises = parsedNetworkInterfacesResult.map(
      async (networkInterface: any) => {
        const getNetworkInterfaceStatusResult = await runCmd("netsh", [
          "interface",
          "ip",
          "show",
          "dns",
          `name=${networkInterface["Interface Name"]}`,
        ]);

        const parsedNetworkInterfaceStatusResult = extractIPsAndWords(
          getNetworkInterfaceStatusResult.stdout,
          ["DHCP", "Statically"]
        );

        const kind = Object.keys(
          parsedNetworkInterfaceStatusResult.wordPresence
        ).find((key) => parsedNetworkInterfaceStatusResult.wordPresence[key]);
        return {
          ...networkInterface,
          DNS: parsedNetworkInterfaceStatusResult.ipAddresses,
          kind,
        };
      }
    );
    const finalUpdatedResponse: any = await Promise.all(promises);
    setNetworkInterfaces(finalUpdatedResponse);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    getAndSetNetworkInterfacesAndTheirDetails();
  }, [getAndSetNetworkInterfacesAndTheirDetails]);

  const handleSelectedInterface = (event: any) => {
    const selectedValue = event.target.value;
    setSelectedInterface(selectedValue);
  };

  const handleChangingServices = (event: any) => {
    const inputValue = event.target.value;

    const dnsOfSelectedService: any = setting.services.find(
      (service) => service.name === inputValue
    )?.dns;
    setDnsInputs(dnsOfSelectedService);
  };

  const getServicePing = useCallback(async () => {
    setIsLoading(true);

    const promises = services.map(async (service: any) => {
      const getServicePingResult: any = await runCmd("ping", [
        "-n",
        "1",
        service?.dns?.[0],
      ]);

      const parsedServicePingResult = parseLinesToObject(
        getServicePingResult.stdout
      );

      return {
        ...service,
        ping: extractTimeFromPingText(parsedServicePingResult?.[0]?.[0]),
      };
    });
    const finalUpdatedResponse: any = await Promise.all(promises);
    setServices(finalUpdatedResponse);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    getServicePing();
  }, [getServicePing]);

  const handleSubmitButton = async () => {
    if (selectedInterface && dnsInputs[0] && dnsInputs[1]) {
      setIsLoading(true);

      await runCmd("netsh", [
        "interface",
        "ip",
        "set",
        "dnsservers",
        `"${selectedInterface}"`,
        "static",
        dnsInputs[0],
        "primary",
      ]);
      await runCmd("netsh", [
        "interface",
        "ip",
        "add",
        "dnsservers",
        `"${selectedInterface}"`,
        dnsInputs[1],
        "index=2",
      ]);

      getAndSetNetworkInterfacesAndTheirDetails();
      setIsLoading(false);
    }
  };

  const resetInterface = async (interfaceName: any) => {
    setIsLoading(true);

    await runCmd("netsh", [
      "interface",
      "ip",
      "set",
      "dnsservers",
      `"${interfaceName}"`,
      "dhcp",
    ]);

    getAndSetNetworkInterfacesAndTheirDetails();
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitButton();
      }}
    >
      <button
        type="button"
        style={{ fontSize: "0.9rem", margin: "10px 0px" }}
        onClick={getAndSetNetworkInterfacesAndTheirDetails}
        disabled={isLoading}
      >
        {isLoading ? "Loading" : "Refresh table"}
      </button>

      <table
        style={{
          textAlign: "center",
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid white" }}>
            <th>#</th>
            <th>InterfaceName</th>
            <th>DNS</th>
            <th>Kind</th>
            <th>State</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {networkInterfaces.map((networkInterface: any) => (
            <tr key={networkInterface["Interface Name"]}>
              <td>
                <input
                  onChange={handleSelectedInterface}
                  type="radio"
                  id={networkInterface["Interface Name"]}
                  name="interface"
                  value={networkInterface["Interface Name"]}
                  disabled={isLoading}
                />
              </td>
              <td>
                <label
                  style={{ display: "block", width: "100%" }}
                  htmlFor={networkInterface["Interface Name"]}
                >
                  {networkInterface["Interface Name"] || "-"}
                </label>{" "}
              </td>
              <td>
                <label
                  style={{ display: "block", width: "100%" }}
                  htmlFor={networkInterface["Interface Name"]}
                >
                  {networkInterface?.DNS?.toString() || "-"}
                </label>
              </td>
              <td>
                <label
                  style={{ display: "block", width: "100%" }}
                  htmlFor={networkInterface["Interface Name"]}
                >
                  {networkInterface.kind || "-"}
                </label>
              </td>
              <td>
                <label
                  style={{ display: "block", width: "100%" }}
                  htmlFor={networkInterface["Interface Name"]}
                >
                  {networkInterface.State || "-"}
                </label>
              </td>
              <td>
                <button
                  onClick={resetInterface.bind(
                    null,
                    networkInterface["Interface Name"]
                  )}
                  disabled={isLoading}
                  type="button"
                  style={{
                    fontSize: "0.7rem",
                    display: "block",
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      <button
        type="button"
        style={{ fontSize: "0.9rem", margin: "10px 0px", display: "block" }}
        onClick={getServicePing}
        disabled={isLoading}
      >
        {isLoading ? "Loading" : "Get service pings"}
      </button>

      {services.map((service) => (
        <Fragment key={service.name}>
          <input
            type="radio"
            id={service.name}
            name="service"
            value={service.name}
            onChange={handleChangingServices}
          />
          <label
            style={{ backgroundColor: service.ping ? "#599159" : "#c11212" }}
            htmlFor={service.name}
          >{`${service.name}=>${
            service.ping ? `${service.ping}ms` : "Timeout"
          }`}</label>
        </Fragment>
      ))}

      <hr />

      <div>
        <input
          type="text"
          value={dnsInputs[0]}
          onChange={(e) => changeDnsInputs(e, 0)}
          style={{ marginRight: "5px" }}
        />

        <input
          type="text"
          value={dnsInputs[1]}
          onChange={(e) => changeDnsInputs(e, 1)}
        />
      </div>

      <hr />

      <button disabled={isLoading} style={{ display: "block" }} type="submit">
        Execute
      </button>
    </form>
  );
}

export default App;
