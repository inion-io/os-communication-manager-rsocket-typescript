import {CellType, SiCell, SiCellClass} from "@inion/common";

namespace SkRequestResponse {
  export const CELL_TYPE = "communication-manager-rsocket-request-response-skill";
  export const CELL_UUID = "9FF8DA22-9C7E-46DB-B782-1D04FC5BFD26";
}

interface SkRequestResponse extends SiCell<SkRequestResponse, void> {}

@CellType(
  SkRequestResponse.CELL_TYPE,
  SkRequestResponse.CELL_UUID
)
class SkRequestResponseClass extends SiCellClass<SkRequestResponse, void> implements SkRequestResponse {
  run(): SkRequestResponse {
    return this.getSelf();
  }
}

export {SkRequestResponse};
export default SkRequestResponseClass;
