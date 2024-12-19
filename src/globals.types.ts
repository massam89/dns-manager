export type DNSsType = [string, string];

export type NetworkType = {
  "Interface Name": string;
  DNS: DNSsType;
  kind: string;
  State: string;
  type: string;
};

export type ServiceType = {
  name: string;
  dns: DNSsType;
  ping: [number | null, number | null];
};

export type SettingType = {
  services: ServiceType[];
};
