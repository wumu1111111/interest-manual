# 美术规范（给生成素材的智能体）

站点叫「兴趣说明书」，气质是**一张印在米色纸上的说明书**：安静、克制、有点复古印刷感。
所有素材都用阿里云百炼文生图，**不要引入照片或 3D**。

## 房子风格（每条 prompt 都要带上）

```
risograph screen-print editorial illustration, warm cream paper background (#FAF6EF),
strictly limited palette: deep forest green #2E5A4E, brick red #BD4327, ink black #1F1B16,
soft beige #E5DBCB; flat shapes, thin hand-drawn line work, subtle paper grain,
slight print misregistration, generous negative space, calm and quiet mood,
no text, no letters, no numbers, no watermark, no signature, no border frame,
no 3D, no glossy gradients, no neon, no photo, no realistic faces, no hands
```

negative prompt 统一用：

```
text, letters, typography, watermark, signature, border, frame, photo, 3d render,
glossy, neon, saturated colors, clutter, detailed faces, hands, logo
```

## 配色（必须贴近，否则和网页接不上）

| 角色 | 色值 |
| --- | --- |
| 纸底 | `#FAF6EF` |
| 深绿 | `#2E5A4E` |
| 砖红 | `#BD4327` |
| 墨黑 | `#1F1B16` |
| 浅米 | `#E5DBCB` |

## 出图工具

```bash
node scripts/dsh-image.mjs --prompt "<house style + 具体画面>" --out public/art/<名字>-a.png --size 1280*720
```

- 模型默认 `wan2.2-t2i-flash`，够用；想要更细可以试 `--model wan2.2-t2i-plus`。
- 尺寸只试这几种：`1024*1024`、`1280*720`、`720*1280`。报「size 不支持」就换一个。
- 每个素材**至少出 2 张候选**（改 prompt 或换 seed），用 `read_image` 看过再挑。

## 验收标准（不合格就重出，不要凑合）

1. **画面里不能有任何文字/字母**，出现了就重出。
2. 主色必须落在上面的配色里，别出现荧光色、紫色渐变、天蓝。
3. 背景要是干净的米色纸面，四周不要有画框或阴影边。
4. 主体不要太满，留白要多——它要垫在网页内容后面，不能抢字。
5. 线条要细、要平，不要厚涂、不要写实光影。

## 16 型名片（`art-source/types/`）

结果页的「名片」和分享图右侧都要用，所以构图比一般素材更死：

- **竖版 9:16**（`--size 720*1280`），主体压在下三分之二，**顶部三分之一必须是空的米色纸**
  （网页会把类型名、slogan 叠在上面）。
- 主角统一是纸团角色：白色皱纸团 + 墨点眼睛 + 砖红腮红，不要长出手脚或写实五官。
- 群像场景用「同款小纸团」表示伙伴，不要把伙伴画成别的角色。
- 场景要一眼能读出这一型的味道（深夜台灯 / 山脊独行 / 篝火 / 一日游的行李箱…）。

流程：

```bash
node scripts/gen-type-cards.mjs --n 2                # 16 型各 2 张候选
node scripts/review-type-cards.mjs                    # 视觉验收，写 selection.json
node scripts/optimize-art.mjs                         # 出 WebP（页面）+ PNG（分享图）
```

重出个别型号：`node scripts/gen-type-cards.mjs --only ismd,igtd --strict --n 3`。
`--strict` 会追加「整幅必须是米色纸、不许糊深色背景」的硬约束，并换成压低了构图的 `strictScene`。

## 产出位置

只写 `public/art/` 目录，**不要改 `src/` 下任何文件，不要重启 dev server**。
文件名按下发的名字来，最终每样只保留挑好的那一张（候选可以留在同目录）。
