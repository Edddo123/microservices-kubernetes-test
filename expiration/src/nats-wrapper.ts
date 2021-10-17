import nats, { Stan } from "node-nats-streaming";



class NatsWrapper {
  private _client?: Stan;

  get client() { // _client is private field but we need access of it to connect to nats and publish so we encapsulate it and give access to it through getter
    if(!this._client) {
      throw new Error('Cannot access NATS before connecting')
    }
    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url });
    return new Promise((resolve, reject) => {
      this.client.on("connect", () => { // here we can directly use getter to avoid possibility of getting undefined behaviour since it would throw error in getter
        console.log("connected to NATS");
        resolve();
      });

      this.client.on("error", (err) => {
        console.log('some error here')
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
