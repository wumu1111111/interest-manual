import { writeFileSync } from "node:fs";

const PORT = 9222;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const [file, target] = process.argv.slice(2);
  const width = Number(process.env.WIDTH) || 390;
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === "page");
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  let id = 0;
  const pending = new Map();
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      id += 1;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evalJs = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true });
    return r.result?.result?.value;
  };
  const shoot = async (name, full = true) => {
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: full,
    });
    writeFileSync(`shots/${name}.png`, Buffer.from(shot.result.data, "base64"));
    console.log("shot:", name);
  };

  await send("Page.enable");
  await send("Page.navigate", { url: target });
  await sleep(1600);
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 844,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await sleep(1000);
  await shoot(file + "-q", false);

  // 12 道全选第一个选项
  for (let i = 0; i < 12; i += 1) {
    await evalJs("document.querySelector('button.option')?.click()");
    await sleep(260);
  }
  await sleep(700);
  await shoot(file + "-result", true);
  console.log("viewport:", await evalJs("[innerWidth, document.documentElement.scrollWidth].join('/')"));

  socket.close();
}

main().catch((e) => console.error(e.message));
