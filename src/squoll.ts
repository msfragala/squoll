import { Pool } from "slother";
import type { SquollWorker } from "@/worker";

export class Squoll {
  #pool: SquollWorker;

  constructor(worker: () => Promise<Worker>) {
    this.#pool = Pool.proxy<SquollWorker>(worker);
  }

  async test(name: string) {
    return this.#pool.test(name);
  }
}
