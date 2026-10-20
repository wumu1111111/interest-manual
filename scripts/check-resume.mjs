const PORT = 9222;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
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

  await send("Page.enable");
  await send("Page.navigate", { url: "http://127.0.0.1:3000/quiz" });
  await sleep(2000);
  await evalJs("localStorage.clear()");
  await send("Page.reload");
  await sleep(1800);

  console.log("初始:", await evalJs("document.body.innerText.match(/\\d+ \\/ 40/)?.[0]"));

  for (let i = 0; i < 3; i += 1) {
    await evalJs("document.querySelector('button.option')?.click()");
    await sleep(320);
  }
  console.log("答完 3 题:", await evalJs("document.body.innerText.match(/\\d+ \\/ 40/)?.[0]"));
  console.log("本地存档:", (await evalJs("localStorage.getItem('interest-manual:quiz:v1')"))?.slice(0, 60));

  await send("Page.reload");
  await sleep(2000);
  console.log("刷新后:", await evalJs("document.body.innerText.match(/\\d+ \\/ 40/)?.[0]"));

  socket.close();
}

main().catch((e) => console.error(e.message));
