import { Fragment } from "react/jsx-runtime";
import styles from "./index.module.css";
import { ChangeEvent, FC } from "react";

interface ServiceInterface {
  name: string;
  dns: string[];
  ping: number | null;
}

interface ComponentInterface {
  services: ServiceInterface[];
  handleChangingServices: (event: ChangeEvent<HTMLInputElement>) => void;
  getServicePing: () => void;
  isLoading: boolean;
}

const Services: FC<ComponentInterface> = ({
  services,
  handleChangingServices,
  getServicePing,
  isLoading,
}) => {
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
