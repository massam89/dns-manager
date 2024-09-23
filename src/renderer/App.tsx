import { Fragment, useCallback, useEffect, useState } from 'react';
import setting from '../../setting';
import './App.css';

function App() {
  const [networkInterfaces, setNetworkInterfaces] = useState([]);
  const [dnsInputs, setDnsInputs] = useState(['', '']);
  const [selectedInterface, setSelectedInterface] = useState();
  const [areTextInputDisable, setAreTextInputDisable] = useState(false);
  const [isDNSActive, setIsDNSActive] = useState(false);

  const getAndSetNetworkInterfacesAndTheirDetails = useCallback(() => {
    window.electron
      .getNetworkInterfaces()
      .then(async (res) => {
        const promises = res.map(async (networkInterface: any) => {
          const status = await window.electron.getNetworkInterfaceStatus(
            networkInterface['Interface Name'],
          );

          const kind = Object.keys(status.wordPresence).find(
            (key) => status.wordPresence[key],
          );

          return {
            ...networkInterface,
            DNS: status.ipAddresses,
            kind,
          };
        });

        const finalUpdatedResponse: any = await Promise.all(promises);
        setNetworkInterfaces(finalUpdatedResponse);

        return '';
      })

      .catch((err) => {
        throw new Error(`Error in getting interface list: ${err}`);
      });
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

  const handleSubmitButton = (event: any) => {
    event.preventDefault();

    if (isDNSActive) {
      window.electron
        .disableCustomDNS(selectedInterface)
        .then(() => setIsDNSActive(false))
        .catch((err) => console.log(err));

      return;
    }

    if (selectedInterface && dnsInputs[0] && dnsInputs[1]) {
      window.electron
        .setPrimaryAndSecondaryDNS(selectedInterface, dnsInputs)
        .then(() => setIsDNSActive(true))
        .catch((err) => console.log(err));
    }
  };

  const handleSelectedInterface = (event: any) => {
    const selectedValue = event.target.value;
    setSelectedInterface(selectedValue);
  };
  return (
    <div>
      <form onSubmit={handleSubmitButton}>
        {networkInterfaces.map((networkInterface: any) => (
          <div key={networkInterface['Interface Name']}>
            <input
              onChange={handleSelectedInterface}
              type="radio"
              id={networkInterface['Interface Name']}
              name="interface"
              value={networkInterface['Interface Name']}
              disabled={
                networkInterface['Admin State'] === 'Disabled' || isDNSActive
              }
            />
            <label htmlFor={networkInterface['Interface Name']}>
              {`${networkInterface['Interface Name']}`}
            </label>
          </div>
        ))}
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
        <hr />
        <button style={{ display: 'block' }} type="submit">
          {isDNSActive ? 'Reset' : 'Execute'}
        </button>
      </form>
    </div>
  );
}

export default App;
