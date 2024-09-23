import { extractIPsAndWords, parseLinesToObject, syncCmd } from './util';

export function getNetworkInterfaces() {
  const result: any = syncCmd('netsh interface show interface');
  return { ...result, data: parseLinesToObject(result.data) };
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
