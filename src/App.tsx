import { useCallback, useEffect, useState } from "react";
import {
  extractIPsAndWords,
  extractPingTimeFromPingText,
  parseLinesToObject,
  runCmd,
} from "utils";
import setting from "setting";
import InterfaceTable from "components/ui/interfaceTable";
import Services from "components/ui/services";
import DnsInputs from "components/ui/dnsInputs";

const App = () => {
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

    services.map(async (service: any, index: number) => {
      const getServicePingResult: any = await runCmd("ping", [
        "-n",
        "1",
        service?.dns?.[0],
      ]);

      const parsedServicePingResult = parseLinesToObject(
        getServicePingResult.stdout
      );

      setServices((prevState) => {
        const preparedServices = [...prevState];
        preparedServices[index] = {
          ...service,
          ping: extractPingTimeFromPingText(parsedServicePingResult?.[0]?.[0]),
        };
        return preparedServices;
      });
    });
    setIsLoading(false);
    // eslint-disable-next-line
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
      <InterfaceTable
        getAndSetNetworkInterfacesAndTheirDetails={
          getAndSetNetworkInterfacesAndTheirDetails
        }
        isLoading={isLoading}
        networkInterfaces={networkInterfaces}
        handleSelectedInterface={handleSelectedInterface}
        resetInterface={resetInterface}
      />
      <hr />
      <Services
        services={services}
        handleChangingServices={handleChangingServices}
        getServicePing={getServicePing}
        isLoading={isLoading}
      />
      <hr />
      <DnsInputs dnsInputs={dnsInputs} changeDnsInputs={changeDnsInputs} />
      <hr />
      <button disabled={isLoading} type="submit">
        Execute
      </button>
    </form>
  );
};

export default App;
