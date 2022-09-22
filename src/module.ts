import SiCommunicationManagerRSocketClass from "./siCommunicationManagerRSocket";
import {DiscoveryModule} from "@inion/common";

export const CommunicationManagerRSocket: DiscoveryModule = {
  path: "@inion/communication-manager-rsocket",
  key: "CommunicationManagerRSocket",
  classes: [
    SiCommunicationManagerRSocketClass
  ]
}
