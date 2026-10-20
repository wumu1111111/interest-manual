import { writeFileSync } from "node:fs";

const PORT = 9222;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = process.argv.slice(2);

async function main() {
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
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return result.result?.result?.value;
  };

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  for (const path of pages) {
    await send("Page.navigate", { url: `http://127.0.0.1:3000${path}` });
    await sleep(2200);
    const report = await evaluate(`(() => {
      const width = window.innerWidth;
      const bad = [];
      for (const el of document.querySelectorAll('body *')) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) continue;
        if (rect.right > width + 1 || rect.left < -1) {
          bad.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || '').toString().slice(0, 70),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            text: (el.textContent || '').trim().slice(0, 24),
          });
        }
      }
      return {
        innerWidth: width,
        scrollWidth: document.documentElement.scrollWidth,
        bodyHeight: document.body.scrollHeight,
        bad: bad.slice(0, 8),
      };
    })()`);
    console.log("=== " + path);
    console.log(
      "innerWidth:", report.innerWidth,
      "scrollWidth:", report.scrollWidth,
      "height:", report.bodyHeight,
    );
    for (const item of report.bad) {
      console.log(
        `  [${item.tag}] ${item.cls} | ${item.left}..${item.right} | ${item.text}`,
      );
    }
    if (report.scrollWidth > report.innerWidth + 1) {
      const shot = await send("Page.captureScreenshot", { format: "png" });
      const name = "shots/audit-" + path.replace(/[^a-z0-9]/gi, "_") + ".png";
      writeFileSync(name, Buffer.from(shot.result.data, "base64"));
      console.log("  screenshot:", name);
    }
  }

  socket.close();
}

main().catch((error) => {
  console.error("审计失败:", error.message);
  process.exit(1);
});
