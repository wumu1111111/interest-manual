/**
 * 通过阿里云百炼（DashScope）文生图，产出站点用的美术素材。
 *
 * 用法：
 *   node scripts/dsh-image.mjs --prompt "..." --out public/art/x.png [--size 1024*1024] [--model wan2.2-t2i-flash] [--n 1] [--negative "..."]
 *
 * API key 从 ~/.dsh/.credentials.yaml 的 refs.BAILIAN_API_KEY 读取，不落盘、不打印。
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { homedir } from "node:os";

const CRED = resolve(homedir(), ".dsh/.credentials.yaml");
const SUBMIT = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";
const TASK = "https://dashscope.aliyuncs.com/api/v1/tasks/";

function readKey() {
  const raw = readFileSync(CRED, "utf8");
  const match = raw.match(/BAILIAN_API_KEY:\s*["']?([^"'\s]+)["']?/);
  if (!match) throw new Error("credentials.yaml 里找不到 BAILIAN_API_KEY");
  return match[1];
}

function parseArgs(argv) {
  const out = { n: 1, size: "1024*1024", model: "wan2.2-t2i-flash" };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--prompt") out.prompt = value;
    else if (key === "--out") out.out = value;
    else if (key === "--size") out.size = value;
    else if (key === "--model") out.model = value;
    else if (key === "--n") out.n = Number(value);
    else if (key === "--negative") out.negative = value;
    else if (key === "--seed") out.seed = Number(value);
  }
  if (!out.prompt || !out.out) {
    throw new Error("需要 --prompt 和 --out");
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = readKey();

  const body = {
    model: args.model,
    input: { prompt: args.prompt },
    parameters: {
      size: args.size,
      n: args.n,
      prompt_extend: true,
      watermark: false,
    },
  };
  if (args.negative) body.input.negative_prompt = args.negative;
  if (args.seed !== undefined) body.parameters.seed = args.seed;

  const submitRes = await fetch(SUBMIT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify(body),
  });
  const submitJson = await submitRes.json();
  if (!submitJson.output?.task_id) {
    console.error("提交失败:", JSON.stringify(submitJson).slice(0, 600));
    process.exit(1);
  }

  const taskId = submitJson.output.task_id;
  let task;
  for (let i = 0; i < 90; i += 1) {
    await sleep(2500);
    const res = await fetch(TASK + taskId, {
      headers: { Authorization: `Bearer ${key}` },
    });
    task = await res.json();
    const status = task.output?.task_status;
    if (status === "SUCCEEDED") break;
    if (status === "FAILED" || status === "CANCELED") {
      console.error("任务失败:", JSON.stringify(task).slice(0, 800));
      process.exit(1);
    }
  }

  const results = task?.output?.results ?? [];
  if (!results.length) {
    console.error("没有返回图片:", JSON.stringify(task).slice(0, 800));
    process.exit(1);
  }

  for (let index = 0; index < results.length; index += 1) {
    const url = results[index].url;
    const res = await fetch(url);
    if (!res.ok) throw new Error("下载失败 " + res.status);
    const bytes = Buffer.from(await res.arrayBuffer());
    const path = args.n > 1 ? args.out.replace(/\.png$/, `-${index + 1}.png`) : args.out;
    mkdirSync(dirname(resolve(path)), { recursive: true });
    writeFileSync(path, bytes);
    console.log(`${path} (${(bytes.length / 1024).toFixed(0)} KB)`);
  }
}

main().catch((error) => {
  console.error("失败:", error.message);
  process.exit(1);
});
