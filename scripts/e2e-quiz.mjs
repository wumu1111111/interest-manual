/**
 * 用 CDP 驱动 headless Edge 走一遍完整答题流程，验证：
 * 逐题推进、多选确认、完成页、生成结果链接、无运行时报错。
 *
 * 用法：先启动带 --remote-debugging-port=9222 的 Edge，再 node scripts/e2e-quiz.mjs
 */
const PORT = 9222;
const START_URL = process.env.START_URL ?? "http://127.0.0.1:3000/quiz";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getTarget() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((item) => item.type === "page");
      if (page) return page;
    } catch {
      // Edge 还没起来
    }
    await sleep(250);
  }
  throw new Error("找不到可调试的页面");
}

async function main() {
  const target = await getTarget();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  let nextId = 0;
  const pending = new Map();
  const errors = [];

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") {
      errors.push(message.params.exceptionDetails?.text ?? "unknown exception");
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      errors.push(message.params.entry.text);
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

  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: START_URL });
  await sleep(1500);
  // 进度会存在 localStorage，先清掉，保证从选题量开始
  await evaluate("localStorage.clear()");
  await send("Page.reload");
  await sleep(1800);

  // 选题量：默认走标准版
  const picked = await evaluate(`(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('标准版'));
    if (!btn) return 'not-found';
    btn.click();
    return 'ok';
  })()`);
  console.log("选择标准版:", picked);
  await sleep(600);

  const stepScript = `(() => {
    const buttons = [...document.querySelectorAll('button')];
    const go = buttons.find((b) => !b.disabled && /^(继续|跳过)/.test(b.textContent.trim()));
    if (go) { go.click(); return 'go'; }
    const option = document.querySelector('button.option[data-selected="false"]')
      || document.querySelector('button.option');
    if (option) { option.click(); return 'option'; }
    const generate = buttons.find((b) => b.textContent.includes('生成我的说明书'));
    if (generate) { generate.click(); return 'generate'; }
    return 'none';
  })()`;

  let steps = 0;
  let outcome = "none";
  for (let index = 0; index < 70; index += 1) {
    outcome = await evaluate(stepScript);
    steps += 1;
    if (outcome === "generate") break;
    await sleep(outcome === "option" ? 320 : 220);
  }

  await sleep(2200);
  const finalUrl = await evaluate("location.href");
  const pageText = await evaluate("document.body.innerText.slice(0, 400)");

  console.log("steps:", steps, "last action:", outcome);
  console.log("final url:", finalUrl);
  console.log("errors:", errors.length ? errors : "none");
  console.log("---- 结果页开头 ----");
  console.log(pageText);

  socket.close();
}

main().catch((error) => {
  console.error("E2E 失败:", error.message);
  process.exit(1);
});
