<script>
  import { Squoll } from "squoll";
  import workerURL from "squoll/worker?url";

  let message = "";
  const squoll = new Squoll(() => new Worker(workerURL));
  squoll.test("friend").then((m) => (message = m));
</script>

<p>{message}</p>
