import { BridgeProvider } from "../../provider/BridgeProvider";
import { Widget } from "./Widget";

export const BridgeWidget = () => {
  return (
    <BridgeProvider>
      <Widget />
    </BridgeProvider>
  );
};
