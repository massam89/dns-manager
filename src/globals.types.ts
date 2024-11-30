export type DNSs = [string, string];

export interface NetworkInterface {
  "Interface Name": string;
  DNS: DNSs;
  kind: string;
  State: string;
  type: string;
}

export interface ServiceInterface {
  name: string;
  dns: DNSs;
  ping: number | null;
}

export interface Setting {
  services: ServiceInterface[];
}
