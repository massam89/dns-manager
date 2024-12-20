import { SettingType } from "globals.types";

/**
 * Defines the configuration settings for various DNS services.
 *
 * The `setting` object contains an array of DNS service configurations, each with the following properties:
 * - `name`: The name of the DNS service.
 * - `dns`: An array of DNS server IP addresses for the service.
 * - `ping`: The current ping value for the service (initially set to 0).
 *
 * This configuration is used to provide users with a list of DNS service options to choose from.
 */
const setting: SettingType = {
  services: [
    {
      name: "Shecan",
      dns: ["178.22.122.100", "185.51.200.2"],
      ping: [null, null],
    },
    {
      name: "403",
      dns: ["10.202.10.202", "10.202.10.102"],
      ping: [null, null],
    },
    {
      name: "Host Iran",
      dns: ["172.29.0.100", "179.29.2.100"],
      ping: [null, null],
    },
    {
      name: "Electro",
      dns: ["78.157.42.101", "78.157.42.100"],
      ping: [null, null],
    },
    {
      name: "Radar",
      dns: ["10.202.10.10", "10.202.10.11"],
      ping: [null, null],
    },
    {
      name: "Pishgaman",
      dns: ["5.202.100.100", "5.202.100.101"],
      ping: [null, null],
    },
    {
      name: "Begzar",
      dns: ["185.55.225.25", "185.55.226.26"],
      ping: [null, null],
    },
    { name: "Shatel", dns: ["85.15.1.14", "85.15.1.15"], ping: [null, null] },
  ],
};

export default setting;
