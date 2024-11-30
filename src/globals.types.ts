export type DNSs = [string, string];

export type NetworkInterface = {
  "Interface Name": string;
  DNS: DNSs;
  kind: string;
  State: string;
  type: string;
};

export type ServiceInterface = {
  name: string;
  dns: DNSs;
  ping: number | null;
};

export type Setting = {
  services: ServiceInterface[];
};
