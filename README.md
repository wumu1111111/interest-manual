# 兴趣说明书

用 MBTI 式的答题方法，生成一份「怎么约你 / 送什么 / 别碰什么」的兴趣说明书，再让朋友猜你到底有多懂你。

当前进度：**M1 单人闭环 + M2 好友默契**，仍然没有后端（答案编码在链接里）。

## 部署（拿到一个能发给别人的地址）

**已部署的实例**：<http://111.230.149.210/>（腾讯云轻量 Debian 13，systemd 托管在 80 端口）

服务器上的日常操作：

```bash
bash /opt/interest-manual/deploy/update.sh   # 拉最新代码 + 重新构建 + 重启
journalctl -u interest-manual -f              # 看日志
systemctl status interest-manual              # 看状态
```

### 部署到自己的服务器

```bash
# 在服务器上（Debian / Ubuntu，root）
curl -fsSL https://raw.githubusercontent.com/wumu1111111/interest-manual/main/deploy/bootstrap.sh -o /tmp/bootstrap.sh
bash /tmp/bootstrap.sh
```

脚本会：加 2G swap（2G 内存直接 build 会 OOM）→ 装 Node 20+ 和 pnpm →
拉仓库 → 构建 → 写 systemd 单元 → 起服务。80 端口被别的站点占着时会自动退到 8080
（这时要去云厂商控制台防火墙放行该端口）。

### 或者用 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwumu1111111%2Finterest-manual)

点按钮 → 用 GitHub 登录 → Deploy，不用配环境变量。拿到 `https://xxx.vercel.app`。

可选环境变量（两种部署都适用）：

```
NEXT_PUBLIC_SITE_URL = https://你的域名
```

这样页面里的绝对地址（分享卡的 `og:image` 等）会用它，而不是部署域名。

**为什么不用 GitHub Pages**：`/result`、`/guess` 是服务端渲染，`/api/card` 是接口，
纯静态导出会把分享图和 SSR 都砍掉。

## 跑起来

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

生产构建：

```bash
pnpm build && pnpm start
```

> 已经从干净 clone 验证过：`git clone` → `pnpm install --frozen-lockfile` → `pnpm build` → `pnpm start`
> 四个路由和分享图接口都正常。

## 页面

| 路由 | 说明 |
| --- | --- |
| `/` | 落地页。移动优先，16 型可横滑查看，点开是完整的示例说明书 |
| `/quiz` | 40 题答题流，键盘 1-4 选择、← 返回 |
| `/result?d=...` | 结果页：类型、四轴、性格特点、兴趣分布、怎么约、雷区、偏好、分享 |
| `/guess?d=...` | 好友默契：朋友答 12 道二选一猜你，出默契度 + 逐题揭晓 |

## 目录

```
src/lib/quiz-data.ts        40 道题 + 标签表 + 偏好选项  ← 改题只动这里
src/lib/type-profiles.ts    16 型文案
src/lib/score.ts            计分、类型码、链接编解码、16 型示例数据
src/lib/analysis.ts         结果页的「性格特点 / 兴趣分布」分析引擎
src/lib/guess.ts            默契测试的 12 题、得分与评语
src/components/art.tsx      原创 SVG 素材（图标、涂鸦、手绘下划线、贴纸行）
src/components/share-bar.tsx  复制链接 / 复制文案（支持指定路径）
src/app/page.tsx            落地页
src/app/quiz/QuizClient.tsx 答题交互
src/app/result/ResultView.tsx  结果页
src/app/guess/GuessClient.tsx  默契测试
```

## 题目与计分

- **32 道四轴题**，每轴 8 道，两端各 4 道，选项左右位置交替——防止「总选第一个」把结果带偏。
- 四轴：场域 `I/O`（室内/户外）、社交 `S/G`（独处/结伴）、姿态 `M/T`（创造/体验）、节奏 `D/W`（深潜/广谱）。
- 每轴得分 = 该轴所有选项的均值，范围 `-1..1`；`<= 0` 取左端字母，`> 0` 取右端。
- **8 道具体题**：常玩 / 想试 / 别碰 / 邀约提前量 / 时长 / 花钱风格 / 进新群 / 心愿单。

### 加题 / 改题的三条纪律

1. 一题只测一个轴，别在一道题里同时问两件事。
2. 两个选项的社会赞许度要对等，别让人一眼看出哪个是「好答案」。
3. 加题要**成对加**（左端一道、右端一道），否则类型分布会整体偏移。

## 分析引擎（`src/lib/analysis.ts`）

结果页的性格特点不是模板堆砌，是从四轴得分里挑出来的：

- 取**偏差绝对值最大**的三个维度，各自映射一条特征文案（每轴左/右/居中三套）。
- 兴趣分布把标签归到五类（户外与身体 / 动手与创造 / 内容与文化 / 热闹与社交 / 生活与陪伴），按占比排序，并给一句「你最集中在哪里」和一条针对性建议。
- 顶部「一句话画像」由四轴各取半句拼成。

## 好友默契（`src/lib/guess.ts`）

- 从题库里挑 12 道二选一（每轴 3 道），分享链接里用 `g` 字段存下本人当时选的是第几个选项。
- 朋友打开 `/guess?d=...`，逐题猜，猜完出默契度、评语和 12 题逐条揭晓（猜错会显示本人真实选择）。
- 老链接没有 `g` 字段时按四轴推一个合理答案，所以 16 型的示例页面也能直接玩。
- 猜完可以「看 TA 的说明书」，也可以把链接转给别的朋友比默契度。

## 链接即数据

答案打包成紧凑 JSON，base64url 编码后放进 `?d=`：

```
v   版本          n   称呼          a   四轴得分 [-1..1] × 4
p   常玩标签      w   想试标签      x   别碰标签
pr  偏好 { invite, duration, spend, group }
wl  心愿单        g   默契测试的 12 位答案（0/1）
```

好处是零后端、换设备也能打开；代价是**拿到链接就能解码看答案**。正式版要换短链 + 服务端存储。

## 美术素材

分两层：**矢量图标**（代码里）+ **生成插画**（`public/art/`）。

### 1. 矢量图标：`src/components/art.tsx`

- 16 个线性图标（台灯、山、人像、画笔、书、音符、植物……），配 `currentColor`，跟着主题色走。
- 手绘下划线、角落的太阳涂鸦、首屏的「贴纸行」。
- 全部手写 SVG，手机高分屏不糊，也没有版权问题。

### 2. 生成插画：`public/art/`

由阿里云百炼（DashScope）文生图产出，模型 `wan2.2-t2i-flash`，风格规范见 `art-brief.md`。
三个智能体分工生成，最终各留一张：

| 文件 | 用途 | 原始 | 压缩后 |
| --- | --- | --- | --- |
| `hero.webp` | 首屏下方的静物长卷（六件物品沿下缘排开） | 393 KB | 28 KB |
| `og-cover.webp` | 分享卡片封面（物体压在右 1/3，左侧留白） | 768 KB | 30 KB |
| `paper-grain.webp` | 全站纸纹（`body::before`，平铺 512px，0.2 透明度） | 1274 KB | 5 KB |
| `glow.webp` | 备用的光晕底纹 | 1184 KB | 53 KB |
| `sprig.webp` | 结果页卡片右下角的植物水印 | 1161 KB | 69 KB |
| `pair.webp` | 默契页「两个并排坐着的人」 | 1063 KB | 47 KB |

出图命令：

```bash
node scripts/dsh-image.mjs --prompt "<房子风格 + 画面>" --out public/art/hero.png --size 1280*720
```

API key 从 `~/.dsh/.credentials.yaml` 的 `refs.BAILIAN_API_KEY` 读取，不落盘、不打印。

### 3. 后处理：`scripts/optimize-art.mjs`

生成的图不能直接上页面，脚本里做了三件事：

1. **纸底对齐**（`matchPaper`）：生成图的米色往往比页面纸色更黄（实测 248,232,216 vs 250,246,239），
   用 most-dominant 颜色做 per-channel 线性映射，把两个锚点（纸底 / 墨色）拉到页面的值，
   插画带才不会有可见的方框。
2. **抠底**（`key`）：对 `sprig` / `pair` 这类要贴在白卡片上的元素，按背景色距离做软阈值抠图，
   输出带 alpha 的 WebP。
3. **压缩**：统一转 WebP（`hero` 1600px / `q82`，图标类 640px / `q86`），总体积从 ~6 MB 降到 ~230 KB。

## 视觉层（"高级感"从哪来）

- **纸纹 + 暗角**：`body::before` 平铺纸纹（multiply 0.2），`body::after` 一层顶部径向渐变暗角，整页像被灯照着的纸。
- **滚动进场**：`<Reveal>` 用 IntersectionObserver 做 16px 上移 + 淡入，带 stagger；首屏不依赖它
  （用纯 CSS `rise` 动画），JS 没加载也不会白屏。
- **吸附头部**：向下滚动后头部变成半透明毛玻璃（`backdrop-blur` + `bg-paper/75`）并出现分隔线。
- **微交互**：按钮有内高光 + 悬停上抬 + 按下回弹（`.btn-primary`）；卡片悬停抬 3px 并带暖色投影（`.lift`）。
- **排版细节**：标题 `text-wrap: balance`，百分比与分数用 `tabular-nums`，`prefers-reduced-motion` 下全部降级为静止。

## 角色与装饰（"萌萌的"那层）

页面里到处会出现一个**纸团小人**，全是手写 SVG（`src/components/mascot.tsx`），不依赖图片：

| 位置 | 姿态 | 作用 |
| --- | --- | --- |
| 首屏 | `wave` + 气泡「40 道题，我陪你做完」 | 陪跑感，降低 40 题的压迫 |
| 答题进度条 | 只有脑袋（`MascotHead`），跟着进度滑 | 让"还剩多少"变成能看见的小人 |
| 答题完成页 | `cheer` | 完成时的正反馈 |
| 结果页卡片上缘 | `peek`，从卡片后面探头 | 说明书像"有人住着" |
| 结果页空状态 | `sleep` | 没填爱好时不是干巴巴一句话 |
| 默契结果 | `think`（默契度 < 60）/ `cheer` | 评语配表情 |
| 404 | `sleep` | "做到一半睡着了" |

六种姿态（sit / wave / sleep / cheer / peek / think）共用一套身体路径，只换眼睛、嘴和手；
呼吸感来自 CSS `bob`，眨眼是 `transform: scaleY` 的 `blink`，`prefers-reduced-motion` 下全关。

装饰层（`src/components/doodles.tsx`）：星星、心、螺旋、十字，固定坐标撒在区块里，
`twinkle` 呼吸闪动；结果页每个小节标题前有一颗小星。

16 张类型卡各自有一个专属线性图标（`TYPE_ART`：台灯/山/书/杯子/人/画笔/靶心/音符……），
结果页四根轴的两端也配了对图标（室内=台灯、户外=山、独处=单人、结伴=双人、创造=画笔、体验=眼睛…）。


## 分享图（每份说明书一张）

`GET /api/card?d=<payload>` 现场生成一张 1080×1440 的海报（PNG，约 220 KB）：

- 顶部编号（由 payload 哈希出 `NO. 19`，同一份说明书永远同一个号）
- 类型名、四码、slogan
- 四根轴（改成左右两段，谁占优谁加深）
- 能约我 / 别约我
- 一句最实用的建议（`type.how[0]`）
- **这一型专属的纸团**：16 型各有一套姿态和道具（铅笔 / 帽子 / 耳机 / 杯子 / 花 / 围巾 / 叶子 / 眼镜），
  用 div 画的（satori 里用不了内联 SVG，`react-dom/server` 在 route 里也被 Next 禁了）
- **二维码**：扫开就是这份说明书的完整页面（`qrcode` 生成 SVG，透明底，跟纸色贴合）
- **底部静物条**：从那张 AI 插画里裁一条，顶上加纸色渐变把接缝化开

结果页「发给朋友」里有个下载链接，链接预览（`og:image`）也指向这张图，所以发到群里时预览就是本人那张卡片。

**字体**是这里最麻烦的一环：satori 不认系统字体，必须内嵌。做法是
`scripts/build-card-font.mjs` 从 Windows 的 Noto Sans SC 可变字体（OFL 协议）里
实例化 500 / 700 两个字重，再按项目里实际用到的字符集（约 950 字）做子集，
产出两个 240 KB 的 ttf 放在 `src/assets/fonts/`，运行时读进内存缓存。

四个坑记一下：
1. 子集里不能留可变字体的 `fvar/gvar/HVAR` 表，否则 satori 解析时崩（`Cannot read properties of undefined`）。
2. `fontTools.varLib.instancer.instantiateVariableFont` 默认不修改原对象，必须接返回值，否则两个字重其实是同一份。
3. satori 解不了 WebP 的 data URI，静物条得用 PNG。
4. 静物条的纸色要**在裁切之后**再对齐，不然连同补边一起被映射，边缘会发紫。

## 默契题按类型挑

`src/lib/guess.ts` 的 `guessQuestionsFor(payload)`：

- 新链接里带 `ga`（32 道四轴题的答案，0/1 字符串），老链接只有 `g`（固定 12 题）时走兜底。
- 每轴 3 道，候选按两个权重排序：**和类型相反的答案**（最出乎意料）+ **轴分数接近中线**（最难猜）。
- 四轴交错排列，避免连续三道都在同一维度。
- 猜的人会看到一行提示：「这 12 题按 TA 的类型挑的，专挑最容易猜错的」。


## 已验证

- 40 题全流程跑通（CDP 驱动 headless Edge）：44 步到结果页，无运行时报错。
- 默契测试 12 题跑通；用带 `g` 的链接故意全选第一项，得分正好 12/12 = 100%，说明答案编码往返正确。
- 中文昵称 + 中文心愿单的编码/解码往返正常。
- 390px 视口下 `scrollWidth == 390`，没有横向溢出。
- 插画带上下的纸色实测差 ≤ 6 个色阶（244,239,229 vs 245,240,222），看不出接缝。
- 分享图接口在开发和生产两种模式下都能出图（`/api/card` 返回 1080×1440 PNG，约 220 KB），非法参数返回 400。
- 答题进度可续：答 3 题刷新后仍停在第 4 题（`localStorage`）。
- 默契题按类型挑：新链接的猜题集合与固定集合不同（第 1 题从「突然多出一个没安排的周六」变成「天气特别好的下午」）。
- `pnpm build`、`tsc --noEmit`、`eslint` 全部通过。

## 已知限制

- 没有登录、没有数据库；链接里是明文答案。
- 分享图里的字只覆盖项目用到的约 950 个汉字（子集字体），所以**海报上不印昵称**——
  昵称是用户随便填的，可能超出子集。链接预览里的标题仍是完整昵称。
- 字体文件放在 `src/assets/fonts/`，靠 `process.cwd()` 读取，`next start` 在仓库根目录跑没问题；
  如果之后要上 Vercel 之类的打包部署，需要把它们挪到会被 bundle 的位置（或改用 `outputFileTracingIncludes`）。
- 海报里的纸团是用 div 画的（不是 SVG 组件），两边各自维护一份几何，改了要同步。
- 老链接（只有 `g` 没有 `ga`）仍然用固定 12 题，看不到「按类型挑」的效果。
- `glow.webp` 还没接到页面上（试过放在首屏，会和静物长卷抢戏，暂时留作备用）。

## 下一步

- **M3 账号 + 多题库**：长辈版（16 题、大字号、可代填）、亲子版代沟地图。
- **M4 心愿单认领 + 家庭空间**：好友认领心愿单里的礼物，家庭页聚合「我们家谁爱干嘛」。

## 工具脚本

Edge 在这个版本里 `Page.navigate` 会重置 mobile 模拟，所以脚本都是「先导航、再设视口」，
并且用 `mobile:false` 才稳定；整页截图前要先滚一遍，否则滚动进场的元素截出来是空白。

```bash
# 先起一个带调试端口的 Edge
msedge --headless=new --remote-debugging-port=9222 --user-data-dir=%TEMP%\edge-test about:blank

node scripts/dsh-image.mjs --prompt "..." --out public/art/x.png   # 百炼文生图
node scripts/optimize-art.mjs              # 纸底对齐 + 抠底 + 转 WebP
node scripts/e2e-quiz.mjs                  # 走完 40 题，打印最终链接和报错
node scripts/audit.mjs "/" "/quiz"         # 找出撑破 390px 视口的元素
node scripts/mobile-shots.mjs 390 "/" "/quiz"   # 指定宽度的整页截图
node scripts/guess-shots.mjs m390-guess "http://127.0.0.1:3000/guess?d=..."  # 默契流程截图
```

## 声明

答题形式参考 MBTI，与 MBTI 无任何关联或授权关系；本产品是兴趣偏好参考，不是心理测评。
