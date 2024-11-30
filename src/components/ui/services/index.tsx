import { Fragment } from "react/jsx-runtime";
import styles from "./index.module.css";

interface ComponentInterface {
  services: any;
  handleChangingServices: any;
  getServicePing: any;
  isLoading: boolean;
}

const Services = ({
  services,
  handleChangingServices,
  getServicePing,
  isLoading,
}: ComponentInterface) => {
  return (
    <>
      <button
        type="button"
        className={styles.refresh_btn}
        onClick={getServicePing}
        disabled={isLoading}
      >
        {isLoading ? "Loading" : "Get service pings"}
      </button>

      {services.map((service: any) => (
        <Fragment key={service.name}>
          <input
            type="radio"
            id={service.name}
            name="service"
            value={service.name}
            onChange={handleChangingServices}
          />
          <label
            className={service.ping ? styles.active : styles.inactive}
            htmlFor={service.name}
          >{`${service.name}=>${
            service.ping ? `${service.ping}ms` : "Timeout"
          }`}</label>
        </Fragment>
      ))}
    </>
  );
};

export default Services;
