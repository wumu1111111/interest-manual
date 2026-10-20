import { writeFileSync } from "node:fs";

const PORT = 9222;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const args = process.argv.slice(2);
const width = Number(args[0]) || 390;
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";

/**
 * 用法: node scripts/mobile-shots.mjs 390 "/" "/quiz"
 *       BASE=http://1.2.3.4 node scripts/mobile-shots.mjs 390 "/quiz"
 *
 * 两个坑：
 * 1. Edge 在这个版本里，Page.navigate 会重置 mobile 模拟，所以先导航再设视口；
 * 2. 整页截图前要先滚一遍，否则滚动进场的元素不会触发，截出来是空白。
 */
async function main() {
  const paths = args.slice(1);
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === "page");
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  let nextId = 0;
  const pending = new Map();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      nextId += 1;
      pending.set(nextId, resolve);
      socket.send(JSON.stringify({ id: nextId, method, params }));
    });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return r.result?.result?.value;
  };

  await send("Page.enable");

  for (const path of paths) {
    await send("Page.navigate", { url: BASE + path });
    await sleep(1500);
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await sleep(900);

    // 滚一遍触发进场动画，再回到顶部
    await evaluate(`(async () => {
      const step = 400;
      const height = document.body.scrollHeight;
      for (let y = 0; y < height; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 70));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 500));
    })()`);

    // 把视口撑到整页高度再截图，避免 captureBeyondViewport 触发动画重播
    const fullHeight = await evaluate("document.body.scrollHeight");
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: Math.min(fullHeight + 20, 6000),
      deviceScaleFactor: 2,
      mobile: false,
    });
    await sleep(900);

    const shot = await send("Page.captureScreenshot", { format: "png" });
    const name =
      "shots/m" +
      width +
      "-" +
      (path === "/" ? "home" : path.replace(/[^a-z0-9]/gi, "_").slice(0, 24)) +
      ".png";
    writeFileSync(name, Buffer.from(shot.result.data, "base64"));
    const check = await evaluate(
      "[innerWidth, document.documentElement.scrollWidth].join('/')",
    );
    console.log("shot:", name, "viewport/scrollWidth:", check);
  }

  socket.close();
}

main().catch((error) => {
  console.error("截图失败:", error.message);
  process.exit(1);
});
