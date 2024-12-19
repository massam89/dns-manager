import { useCallback, useEffect, useState, FC, ChangeEvent } from "react";
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
import { DNSsType, NetworkType, ServiceType } from "globals.types";

const App: FC = () => {
  const [networkInterfaces, setNetworkInterfaces] = useState<NetworkType[]>([]);
  const [dnsInputs, setDnsInputs] = useState<DNSsType>(["", ""]);
  const [selectedInterface, setSelectedInterface] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [services, setServices] = useState<ServiceType[]>(setting.services);

  const changeDnsInputs = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const inputValue = event.target.value;
    const updatedDns: DNSsType = [...dnsInputs];
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
      async (networkInterface: NetworkType) => {
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
    const finalUpdatedResponse: NetworkType[] = await Promise.all(promises);
    setNetworkInterfaces(finalUpdatedResponse);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    getAndSetNetworkInterfacesAndTheirDetails();
  }, [getAndSetNetworkInterfacesAndTheirDetails]);

  const handleSelectedInterface = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    setSelectedInterface(selectedValue);
  };

  const handleChangingServices = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    const dnsOfSelectedService: any = setting.services.find(
      (service) => service.name === inputValue
    )?.dns;
    setDnsInputs(dnsOfSelectedService);
  };

  const getServicePing = useCallback(async () => {
    setIsLoading(true);

    services.map(async (service: ServiceType, index: number) => {
      const getServicePrimaryPingResult: any = await runCmd("ping", [
        "-n",
        "1",
        service?.dns?.[0],
      ]);

      const parsedServicePrimaryPingResult = parseLinesToObject(
        getServicePrimaryPingResult.stdout
      );

      const getServiceSecondaryPingResult: any = await runCmd("ping", [
        "-n",
        "1",
        service?.dns?.[1],
      ]);

      const parsedServiceSecondaryPingResult = parseLinesToObject(
        getServiceSecondaryPingResult.stdout
      );

      setServices((prevState) => {
        const preparedServices = [...prevState];
        preparedServices[index] = {
          ...service,
          ping: [
            extractPingTimeFromPingText(
              parsedServicePrimaryPingResult?.[0]?.[0]
            ),
            extractPingTimeFromPingText(
              parsedServiceSecondaryPingResult?.[0]?.[0]
            ),
          ],
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

      const primaryCommandArray: string[] = [
        "interface",
        "ip",
        "set",
        "dnsservers",
        `"${selectedInterface}"`,
        "static",
        dnsInputs[0],
        "primary",
      ];
      await runCmd("netsh", primaryCommandArray);

      const secondaryCommandArray: string[] = [
        "interface",
        "ip",
        "add",
        "dnsservers",
        `"${selectedInterface}"`,
        dnsInputs[1],
        "index=2",
      ];
      await runCmd("netsh", secondaryCommandArray);

      getAndSetNetworkInterfacesAndTheirDetails();
      setIsLoading(false);
    }
  };

  const resetInterface = async (interfaceName: string) => {
    setIsLoading(true);

    const resetCommandArray = [
      "interface",
      "ip",
      "set",
      "dnsservers",
      `"${interfaceName}"`,
      "dhcp",
    ];

    await runCmd("netsh", resetCommandArray);

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
