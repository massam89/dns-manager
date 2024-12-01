import { ChangeEvent, FC } from "react";
import styles from "./index.module.css";
import { NetworkType } from "globals.types";

type ComponentType = {
  getAndSetNetworkInterfacesAndTheirDetails: () => void;
  isLoading: boolean;
  networkInterfaces: NetworkType[];
  handleSelectedInterface: (event: ChangeEvent<HTMLInputElement>) => void;
  resetInterface: (interfaceName: string) => void;
};

const InterfaceTable: FC<ComponentType> = ({
  getAndSetNetworkInterfacesAndTheirDetails,
  isLoading,
  networkInterfaces,
  handleSelectedInterface,
  resetInterface,
}) => {
  return (
    <>
      <button
        type="button"
        className={styles.refresh_btn}
        onClick={getAndSetNetworkInterfacesAndTheirDetails}
        disabled={isLoading}
      >
        {isLoading ? "Loading" : "Refresh table"}
      </button>

      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th>#</th>
            <th>InterfaceName</th>
            <th>DNS</th>
            <th>Kind</th>
            <th>State</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {networkInterfaces.map((networkInterface: any) => (
            <tr key={networkInterface["Interface Name"]}>
              <td>
                <input
                  onChange={handleSelectedInterface}
                  type="radio"
                  id={networkInterface["Interface Name"]}
                  name="interface"
                  value={networkInterface["Interface Name"]}
                  disabled={isLoading}
                />
              </td>
              <td>
                <label
                  className={styles.label}
                  htmlFor={networkInterface["Interface Name"]}
                >
                  {networkInterface["Interface Name"] || "-"}
                </label>{" "}
              </td>
              <td>
                <label
                  className={styles.label}
                  htmlFor={networkInterface["Interface Name"]}
                >
                  {networkInterface?.DNS?.toString() || "-"}
                </label>
              </td>
              <td>
                <label
                  className={styles.label}
                  htmlFor={networkInterface["Interface Name"]}
                >
                  {networkInterface.kind || "-"}
                </label>
              </td>
              <td>
                <label
                  className={styles.label}
                  htmlFor={networkInterface["Interface Name"]}
                >
                  {networkInterface.State || "-"}
                </label>
              </td>
              <td>
                <button
                  onClick={resetInterface.bind(
                    null,
                    networkInterface["Interface Name"]
                  )}
                  disabled={isLoading}
                  type="button"
                  className={styles.reset_btn}
                >
                  Reset
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default InterfaceTable;
