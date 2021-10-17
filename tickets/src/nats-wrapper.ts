import nats, { Stan } from "node-nats-streaming";

// so if u think about it, we want one nats connection in all the files, if we do it on index file with mongoose then we will be creating circular import/export which is not ideal. If u think about it, when we connect to mongoose, we use same mongoose connection all over the app without exporting it. We are gonna do same here. we are gonna use singleton pattern and instead of exporting class we are gonna initialize the class connect to nats and export the instance of the class so we will have same client in all the files

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
