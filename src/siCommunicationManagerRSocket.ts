import {
  OnExtensionSubscriber,
  OnNextSubscriber,
  OnTerminalSubscriber,
  Payload,
  RSocket,
  RSocketConnector,
  RSocketServer,
} from "rsocket-core";
import {TcpServerTransport} from "rsocket-tcp-server";
import {WebsocketServerTransport} from "rsocket-websocket-server";
import {WebSocketServer} from 'ws';
import {WebsocketClientTransport} from "rsocket-websocket-client";
import {TcpClientTransport} from "rsocket-tcp-client";
import SiCommunicationManagerClass, {SiCommunicationManager} from "@inion/common/dist/communication/siCommunicationManager";
import {Cell, CellType, SiInteger, SiString} from "@inion/common";
import SkListenClass, {SkListen} from "./skills/skListen";
import SiCommunicationMessageClass, {SiCommunicationMessage} from "@inion/common/dist/communication/siCommunicationMessage";

interface SiCommunicationManagerRSocket extends SiCommunicationManager<SiCommunicationManagerRSocket> {
}

@CellType(
  SiCommunicationManager.CELL_TYPE,
  SiCommunicationManager.CELL_UUID
)
class SiCommunicationManagerRSocketClass extends SiCommunicationManagerClass<SiCommunicationManagerRSocket>
  implements SiCommunicationManagerRSocket {

  @Cell(SkListenClass)
  private skListen?: SkListen;
  private tcpServer?: RSocketServer;
  private wsConnector?: RSocket;
  private wsServer?: RSocketServer;

  connectWebSocket(host: SiString, port: SiInteger): SiCommunicationManagerRSocket {
    this.createWebsocketClient(host, port);

    return this.getSelf();
  }

  async createWebsocketClient(host: SiString, port: SiInteger) {
    const connector = new RSocketConnector({
      transport: new WebsocketClientTransport({
        url: 'ws://localhost:8080',
        wsCreator: (url) => new WebSocket(url) as any,
      }),
    });

    this.wsConnector = await connector.connect();
  }

  listenTCP(host: SiString, port: SiInteger): SiCommunicationManagerRSocket {
    // TODO: Assertions for host and port values

    this.createTcpServer(host, port);
    this.tcpServer?.bind();

    return this.getSelf();
  }

  listenWebSocket(host: SiString, port: SiInteger): SiCommunicationManagerRSocket {
    // TODO: Assertions for host and port values

    this.createWebsocketServer(host, port);
    this.wsServer?.bind();

    return this.getSelf();
  }

  async requestResponseTCP(host: SiString, port: SiInteger, message: SiCommunicationMessage): Promise<SiCommunicationMessage> {
    let connector = new RSocketConnector({
      transport: new TcpClientTransport({
        connectionOptions: {
          host: host.getCellValue(),
          port: port.getCellValue() as number,
        },
      }),
    });

    let rsocket = await connector.connect();
    let payload = await this.requestResponse(rsocket, message);
    let response = this.createTransientCell(SiCommunicationMessageClass);
    response.restore(payload.data!.toString());

    return await this.processResponse(response);
    /*
    console.log("SiCommunicationManagerRSocket: " + rsocket)

    let response = this.createTransientCell(SiCommunicationMessageClass);
    response.setCommand(message.getCommand());
    response.setPayload(this.createTransientCell(SiObjectClass));

    console.log("SiCommunicationManagerRSocket: " + response)

    return response;*/

  }

  async requestResponseWebSocket(host: SiString, port: SiInteger, message: SiCommunicationMessage):
    Promise<SiCommunicationMessage> {
    /*
      rsocket.requestResponse(
      {
        data: Buffer.from('Hello World'),
      },
      {
        onError: (e) => throwError(e),
        onNext: (payload, isComplete) => {
          console.log(
            `payload[data: ${payload.data}; metadata: ${payload.metadata}]|${isComplete}`,
          );
        },
        onComplete: () => {},
        onExtension: () => {},
      },
    );
    */
    return message;
  }

  private createTcpServer(host: SiString, port: SiInteger): void {
    this.tcpServer = new RSocketServer({
      transport: new TcpServerTransport({
        listenOptions: {
          port: port.getCellValue(),
          host: host.getCellValue(),
        },
      }),
      acceptor: {
        accept: async () => ({
          requestResponse: (
            payload: Payload,
            responderStream: OnTerminalSubscriber &
              OnNextSubscriber &
              OnExtensionSubscriber
          ) => {
            let request = this.createTransientCell(SiCommunicationMessageClass);
            request.restore(payload.data!.toString());

            this.processRequest(request!).then((response) => {
              responderStream.onNext(
                {
                  data: Buffer.from(response?.toJsonString()!),
                },
                true
              );
            });

            return {
              cancel: () => {
                console.log("cancelled");
              },
              onExtension: () => {
                console.log("Received Extension request");
              },
            };
          },
        }),
      },
    });
  }

  private createWebsocketServer(host: SiString, port: SiInteger): void {
    this.wsServer = new RSocketServer({
      transport: new WebsocketServerTransport({
        wsCreator: (options) => {
          return new WebSocketServer({
            port: 8000,
          });
        },
      }),
      acceptor: {
        accept: async () => ({
          requestResponse: (
            payload: Payload,
            responderStream: OnTerminalSubscriber &
              OnNextSubscriber &
              OnExtensionSubscriber
          ) => {
            console.log("!!SiCommunicationManagerRSocket!!");
            console.log(payload.data?.toString());
            console.log("!!SiCommunicationManagerRSocket!!");
            /*const timeout = setTimeout(
              () =>
                responderStream.onNext(
                  {
                    data: Buffer.concat([Buffer.from("Echo: "), payload.data]),
                  },
                  true
                ),
              1000
            );*/
            return {
              cancel: () => {
                //clearTimeout(timeout);
                console.log("cancelled");
              },
              onExtension: () => {
                console.log("Received Extension request");
              },
            };
          },
        }),
      },
    });
  }

  private async requestResponse(rsocket: RSocket, message: SiCommunicationMessage): Promise<Payload> {
    return new Promise((resolve, reject) => {
      return rsocket.requestResponse(
        {
          data: Buffer.from(message.toJsonString()),
        },
        {
          onError: (e) => {
            reject(e);
          },
          onNext: (payload, isComplete) => {
            resolve(payload);
          },
          onComplete: () => {
          },
          onExtension: () => {
          },
        }
      );
    });
  }
}


export {SiCommunicationManagerRSocket};
export default SiCommunicationManagerRSocketClass;
