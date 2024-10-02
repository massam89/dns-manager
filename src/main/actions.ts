import { extractIPsAndWords, parseLinesToObject, syncCmd } from './util';

export function getNetworkInterfaces() {
  const result: any = syncCmd('netsh interface show interface');
  const parsedResult = parseLinesToObject(result.data);

  const data = parsedResult.map((item: any) => ({
    'Admin State': item[0],
    State: item[1],
    Type: item[2],
    'Interface Name': item[3],
  }));

  return { ...result, data };
}

export function getNetworkInterfaceStatus(_: any, interfaceName: any) {
  const result: any = syncCmd(
    `netsh interface ip show dns name="${interfaceName}"`,
  );

  return {
    ...result,
    data: extractIPsAndWords(result.data, ['DHCP', 'Statically']),
  };
}

export function setPrimaryAndSecondaryDNS(
  _: any,
  interfaceName: any,
  dns: string[],
) {
  return syncCmd(
    `netsh interface ip set dnsservers "${interfaceName}" static ${dns[0]} primary & netsh interface ip add dnsservers "${interfaceName}" ${dns[1]} index=2`,
  );
}

export function disableCustomDNS(_: any, interfaceName: any) {
  return syncCmd(`netsh interface ip set dnsservers "${interfaceName}" dhcp`);
}

export function getServicePing(_: any, service: any) {
  return parseLinesToObject(syncCmd(`ping -n 1 ${service?.dns?.[0]}`).data);
}
