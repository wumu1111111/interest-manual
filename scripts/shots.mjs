import { writeFileSync } from "node:fs";

const PORT = 9222;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const shoot = async (name) => {
    const result = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`shots/${name}.png`, Buffer.from(result.result.data, "base64"));
    console.log("shot:", name);
  };

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 860,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: "http://127.0.0.1:3000/quiz" });
  await sleep(2500);
  await shoot("quiz-q1");

  // 答完 32 道四轴题，停在第一个多选题
  for (let i = 0; i < 32; i += 1) {
    await evaluate(
      `(document.querySelector('button.option[data-selected="false"]') || document.querySelector('button.option')).click()`,
    );
    await sleep(260);
  }
  await sleep(500);
  await shoot("quiz-multi");

  // 继续走到完成页
  for (let i = 0; i < 16; i += 1) {
    const acted = await evaluate(`(() => {
      const buttons = [...document.querySelectorAll('button')];
      const generate = buttons.find((b) => b.textContent.includes('生成我的说明书'));
      if (generate) return 'generate';
      const go = buttons.find((b) => !b.disabled && /^(继续|跳过)/.test(b.textContent.trim()));
      if (go) { go.click(); return 'go'; }
      const option = document.querySelector('button.option[data-selected="false"]') || document.querySelector('button.option');
      if (option) { option.click(); return 'option'; }
      return 'none';
    })()`);
    if (acted === "none" || acted === "generate") break;
    await sleep(340);
  }
  await sleep(600);
  await shoot("quiz-done");

  socket.close();
}

main().catch((error) => {
  console.error("截图失败:", error.message);
  process.exit(1);
});
