import { ChangeEvent, FC } from "react";
import styles from "./index.module.css";
import { DNSs } from "globals.types";
interface ComponentInterface {
  dnsInputs: DNSs;
  changeDnsInputs: (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => void;
}

const DnsInputs: FC<ComponentInterface> = ({ dnsInputs, changeDnsInputs }) => {
  return (
    <div>
      <input
        type="text"
        value={dnsInputs[0]}
        onChange={(e) => changeDnsInputs(e, 0)}
        className={styles.input}
      />

      <input
        type="text"
        value={dnsInputs[1]}
        onChange={(e) => changeDnsInputs(e, 1)}
      />
    </div>
  );
};

export default DnsInputs;
