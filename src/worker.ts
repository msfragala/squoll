import { expose } from "slother";

export type SquollWorker = {
  test: (name: string) => Promise<string>;
};

const worker: SquollWorker = {
  async test(name: string) {
    return `Hello, ${name}`;
  },
};

expose(worker);
