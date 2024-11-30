import styles from "./index.module.css";

interface ComponentInterface {
  dnsInputs: any;
  changeDnsInputs: any;
}

const DnsInputs = ({ dnsInputs, changeDnsInputs }: ComponentInterface) => {
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
