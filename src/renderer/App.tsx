import { Fragment, useCallback, useEffect, useState } from 'react';
import setting from '../../setting';
import { throttle } from './utils';
import './App.css';

function App() {
  const [networkInterfaces, setNetworkInterfaces] = useState([]);
  const [dnsInputs, setDnsInputs] = useState(['', '']);
  const [selectedInterface, setSelectedInterface] = useState();
  const [areTextInputDisable, setAreTextInputDisable] = useState(false);
  const [isDNSActive, setIsDNSActive] = useState(false);
  const [error, setError] = useState('');

  const getAndSetNetworkInterfacesAndTheirDetails = useCallback(async () => {
    const getNetworkInterfacesResult =
      await window.electron.getNetworkInterfaces();
    if (getNetworkInterfacesResult.error) {
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
    return null;
  }, []);

  useEffect(() => {
    getAndSetNetworkInterfacesAndTheirDetails();
  }, [getAndSetNetworkInterfacesAndTheirDetails]);

  const handleChangingServices = (event: any) => {
    const inputValue = event.target.value;

    if (inputValue === 'custom') {
      setAreTextInputDisable(false);
      return;
    }

    setAreTextInputDisable(true);

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

  const handleSubmitButton = throttle(async () => {
    setError('');

    if (isDNSActive) {
      const disableCustomDNSResult =
        await window.electron.disableCustomDNS(selectedInterface);
      if (disableCustomDNSResult.error) {
        setError(disableCustomDNSResult.data);
        return;
      }

      setIsDNSActive(false);
      getAndSetNetworkInterfacesAndTheirDetails();
      return;
    }

    if (selectedInterface && dnsInputs[0] && dnsInputs[1]) {
      const setPrimaryAndSecondaryDNSResult =
        await window.electron.setPrimaryAndSecondaryDNS(
          selectedInterface,
          dnsInputs,
        );

      if (setPrimaryAndSecondaryDNSResult.error) {
        setError(setPrimaryAndSecondaryDNSResult.data);
        return;
      }

      getAndSetNetworkInterfacesAndTheirDetails();
      setIsDNSActive(true);
    }
  }, 10000);

  const handleSelectedInterface = (event: any) => {
    const selectedValue = event.target.value;
    setSelectedInterface(selectedValue);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitButton();
        }}
      >
        <table
          style={{
            textAlign: 'center',
            borderCollapse: 'collapse',
            width: '100%',
          }}
        >
          <thead>
            <tr>
              <th>Select</th>
              <th>InterfaceName</th>
              <th>DNS</th>
              <th>Kind</th>
              <th>State</th>
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
                    disabled={
                      networkInterface['Admin State'] === 'Disabled' ||
                      isDNSActive
                    }
                  />
                </td>
                <td>{networkInterface['Interface Name']}</td>
                <td>{networkInterface.DNS.toString()}</td>
                <td>{networkInterface.kind}</td>
                <td>{networkInterface.State}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />
        {setting.services.map((service) => (
          <Fragment key={service.name}>
            <input
              type="radio"
              id={service.name}
              name="service"
              value={service.name}
              onChange={handleChangingServices}
              disabled={isDNSActive}
            />
            <label htmlFor={service.name}>{service.name}</label>
          </Fragment>
        ))}

        <label htmlFor="custom">
          <input
            type="radio"
            id="custom"
            name="service"
            value="custom"
            onChange={handleChangingServices}
            disabled={isDNSActive}
          />
          Custom
        </label>

        <hr />

        <div>
          <input
            type="text"
            value={dnsInputs[0]}
            onChange={(e) => changeDnsInputs(e, 0)}
            disabled={areTextInputDisable || isDNSActive}
          />
          <input
            type="text"
            value={dnsInputs[1]}
            onChange={(e) => changeDnsInputs(e, 1)}
            disabled={areTextInputDisable || isDNSActive}
          />
        </div>

        <hr />

        <button
          disabled={!selectedInterface}
          style={{ display: 'block' }}
          type="submit"
        >
          {isDNSActive ? 'Reset' : 'Execute'}
        </button>

        <p>{error}</p>
      </form>
    </div>
  );
}

export default App;
