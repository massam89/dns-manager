import { Fragment, useCallback, useEffect, useState } from 'react';
import setting from '../../setting';
import './App.css';
import { extractTimeFromPingText } from './utils';

function App() {
  const [networkInterfaces, setNetworkInterfaces] = useState([]);
  const [dnsInputs, setDnsInputs] = useState(['', '']);
  const [selectedInterface, setSelectedInterface] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState(setting.services);

  const getAndSetNetworkInterfacesAndTheirDetails = useCallback(async () => {
    setIsLoading(true);

    const getNetworkInterfacesResult =
      await window.electron.getNetworkInterfaces();

    if (getNetworkInterfacesResult.error) {
      setIsLoading(false);
      setError(getNetworkInterfacesResult.data);
      return null;
    }

    const promises = getNetworkInterfacesResult.data.map(
      async (networkInterface: any) => {
        const getNetworkInterfaceStatusResult =
          await window.electron.getNetworkInterfaceStatus(
            networkInterface['Interface Name'],
          );

        if (getNetworkInterfaceStatusResult.error) {
          setError(getNetworkInterfaceStatusResult.data);
          return null;
        }
        const kind = Object.keys(
          getNetworkInterfaceStatusResult.data.wordPresence,
        ).find((key) => getNetworkInterfaceStatusResult.data.wordPresence[key]);
        return {
          ...networkInterface,
          DNS: getNetworkInterfaceStatusResult.data.ipAddresses,
          kind,
        };
      },
    );
    const finalUpdatedResponse: any = await Promise.all(promises);
    setNetworkInterfaces(finalUpdatedResponse);
    setIsLoading(false);
    return null;
  }, []);

  const getAndSetNetworkInterfaceAndItsDetails = useCallback(
    async (networkInterfaceName: string) => {
      setIsLoading(true);

      const getNetworkInterfaceStatusResult =
        await window.electron.getNetworkInterfaceStatus(networkInterfaceName);

      if (getNetworkInterfaceStatusResult.error) {
        setIsLoading(false);
        setError(getNetworkInterfaceStatusResult.data);
        return null;
      }

      const updatedNetworkInterfaces: any = networkInterfaces.map(
        (networkInterface: any) => {
          if (networkInterface['Interface Name'] === networkInterfaceName) {
            const kind = Object.keys(
              getNetworkInterfaceStatusResult.data.wordPresence,
            ).find(
              (key) => getNetworkInterfaceStatusResult.data.wordPresence[key],
            );

            return {
              ...networkInterface,
              DNS: getNetworkInterfaceStatusResult.data.ipAddresses,
              kind,
            };
          }

          return networkInterface;
        },
      );

      setNetworkInterfaces(updatedNetworkInterfaces);
      setIsLoading(false);
      return null;
    },
    [networkInterfaces],
  );

  const getServicePing = useCallback(async () => {
    setIsLoading(true);
    const promises = services.map(async (service: any) => {
      const getServicePingResult =
        await window.electron.getServicePing(service);

      return {
        ...service,
        ping: extractTimeFromPingText(getServicePingResult?.[0]?.[0]),
      };
    });
    const finalUpdatedResponse: any = await Promise.all(promises);
    setServices(finalUpdatedResponse);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getServicePing();
  }, [getServicePing]);

  useEffect(() => {
    getAndSetNetworkInterfacesAndTheirDetails();
  }, [getAndSetNetworkInterfacesAndTheirDetails]);

  const handleChangingServices = (event: any) => {
    const inputValue = event.target.value;

    const dnsOfSelectedService: any = setting.services.find(
      (service) => service.name === inputValue,
    )?.dns;
    setDnsInputs(dnsOfSelectedService);
  };

  const changeDnsInputs = (event: any, index: number) => {
    const inputValue = event.target.value;
    const updatedDns = [...dnsInputs];
    updatedDns[index] = inputValue;
    setDnsInputs(updatedDns);
  };

  const handleSubmitButton = async () => {
    setError('');

    if (selectedInterface && dnsInputs[0] && dnsInputs[1]) {
      setIsLoading(true);

      const setPrimaryAndSecondaryDNSResult =
        await window.electron.setPrimaryAndSecondaryDNS(
          selectedInterface,
          dnsInputs,
        );

      if (setPrimaryAndSecondaryDNSResult.error) {
        setIsLoading(false);
        setError(setPrimaryAndSecondaryDNSResult.data);
        return;
      }

      getAndSetNetworkInterfaceAndItsDetails(selectedInterface);
      setIsLoading(false);
    }
  };

  const handleSelectedInterface = (event: any) => {
    const selectedValue = event.target.value;
    setSelectedInterface(selectedValue);
  };

  const resetInterface = async (interfaceName: any) => {
    setIsLoading(true);

    const disableCustomDNSResult =
      await window.electron.disableCustomDNS(interfaceName);
    if (disableCustomDNSResult.error) {
      setIsLoading(false);
      setError(disableCustomDNSResult.data);
      return;
    }

    setIsLoading(false);
    getAndSetNetworkInterfaceAndItsDetails(interfaceName);
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
        style={{ fontSize: '0.9rem', margin: '10px 0px' }}
        onClick={getAndSetNetworkInterfacesAndTheirDetails}
        disabled={isLoading}
      >
        {isLoading ? 'Loading' : 'Refresh table'}
      </button>

      <table
        style={{
          textAlign: 'center',
          borderCollapse: 'collapse',
          width: '100%',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid white' }}>
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
            <tr key={networkInterface['Interface Name']}>
              <td>
                <input
                  onChange={handleSelectedInterface}
                  type="radio"
                  id={networkInterface['Interface Name']}
                  name="interface"
                  value={networkInterface['Interface Name']}
                  disabled={isLoading}
                />
              </td>
              <td>
                <label
                  style={{ display: 'block', width: '100%' }}
                  htmlFor={networkInterface['Interface Name']}
                >
                  {networkInterface['Interface Name'] || '-'}
                </label>{' '}
              </td>
              <td>
                <label
                  style={{ display: 'block', width: '100%' }}
                  htmlFor={networkInterface['Interface Name']}
                >
                  {networkInterface.DNS.toString() || '-'}
                </label>
              </td>
              <td>
                <label
                  style={{ display: 'block', width: '100%' }}
                  htmlFor={networkInterface['Interface Name']}
                >
                  {networkInterface.kind || '-'}
                </label>
              </td>
              <td>
                <label
                  style={{ display: 'block', width: '100%' }}
                  htmlFor={networkInterface['Interface Name']}
                >
                  {networkInterface.State || '-'}
                </label>
              </td>
              <td>
                <button
                  onClick={resetInterface.bind(
                    null,
                    networkInterface['Interface Name'],
                  )}
                  disabled={isLoading}
                  type="button"
                  style={{
                    fontSize: '0.7rem',
                    display: 'block',
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
        style={{ fontSize: '0.9rem', margin: '10px 0px', display: 'block' }}
        onClick={getServicePing}
        disabled={isLoading}
      >
        {isLoading ? 'Loading' : 'Get service pings'}
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
            style={{ backgroundColor: service.ping ? '#599159' : '#c11212' }}
            htmlFor={service.name}
          >{`${service.name}=>${service.ping ? `${service.ping}ms` : 'Timeout'}`}</label>
        </Fragment>
      ))}

      <hr />

      <div>
        <input
          type="text"
          value={dnsInputs[0]}
          onChange={(e) => changeDnsInputs(e, 0)}
          style={{ marginRight: '5px' }}
        />

        <input
          type="text"
          value={dnsInputs[1]}
          onChange={(e) => changeDnsInputs(e, 1)}
        />
      </div>

      <hr />

      <button disabled={isLoading} style={{ display: 'block' }} type="submit">
        Execute
      </button>

      <p style={{ width: '600px' }}>{error}</p>
    </form>
  );
}
export default App;
