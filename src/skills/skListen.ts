import {
  Cell,
  CellType,
  SiCellClass,
  SiCell,
  SiInteger,
  SiIntegerClass,
  SiString,
  SiStringClass
} from "@inion/common";

namespace SkListen {
  export const CELL_TYPE = "communication-manager-rsocket-listen-skill";
  export const CELL_UUID = "9FF8DA22-9C7E-46DB-B782-1D04FC5BFD26";
}

interface SkListen extends SiCell<SkListen, void> {
  setHost(host: SiString): SkListen;
  setPort(port: SiInteger): SkListen;
}

@CellType(
  SkListen.CELL_TYPE,
  SkListen.CELL_UUID
)
class SkListenClass extends SiCellClass<SkListen, void> implements SkListen {
  @Cell(SiStringClass)
  private host?: SiString;
  @Cell(SiIntegerClass)
  private port?: SiInteger;

  run(): SkListen {
    return this.getSelf();
  }

  setHost(host: SiString): SkListen {
    return this.getSelf();
  }

  setPort(port: SiInteger): SkListen {
    return this.getSelf();
  }
}

export {SkListen};
export default SkListenClass;
