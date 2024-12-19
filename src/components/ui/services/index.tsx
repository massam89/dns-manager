import { Fragment } from "react/jsx-runtime";
import styles from "./index.module.css";
import { ChangeEvent, FC } from "react";
import { ServiceType } from "globals.types";

type ComponentType = {
  services: ServiceType[];
  handleChangingServices: (event: ChangeEvent<HTMLInputElement>) => void;
  getServicePing: () => void;
  isLoading: boolean;
};

const Services: FC<ComponentType> = ({
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

      <view className={styles.services}>
        {services.map((service: any) => (
          <view className={styles.service} key={service.name}>
            <input
              type="radio"
              id={service.name}
              name="service"
              value={service.name}
              onChange={handleChangingServices}
            />
            <label htmlFor={service.name}>
              {`${service.name} - `}
              <span
                className={service.ping[0] ? styles.active : styles.inactive}
              >{`${service.ping[0] ? `${service.ping[0]}` : "Er"}`}</span>
              <span
                className={service.ping[1] ? styles.active : styles.inactive}
              >{`${service.ping[1] ? `${service.ping[1]}` : "Er"}`}</span>
            </label>
          </view>
        ))}
      </view>
    </>
  );
};

export default Services;
