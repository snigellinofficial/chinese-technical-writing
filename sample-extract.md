# 违规样例提取

语料：172 个会话。

说明：下表按类别列出命中规则的原始语句，用于说明页的规则实例。

## 无效否定与无效对比

判定说明：被否定之物未必出现过

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| slogan 把选择权交还给个人——营销动作要做的不是"告诉你是谁"，而是"给你一个表达自己的出口" | 1 | claude |
| 先说一个关键优化：**不是每5秒都存，而是每5秒检测一次，只在画面有实质变化时才保存**（关键帧提取），一场2小时直播实际有效帧大概只有50-200张，这是让分析质量最优的核心设计 | 1 | claude |
| 这让诊断更明确了——这不是偶发抖动，而是远程账户连接通道当前不可用 | 1 | claude |

## 评断性恭维

判定说明：评价用户意见的价值

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| \| 常用短语 \| 斯瓦希里语 \| 中文 \| 3 \| `sawa kabisa \| 非常好 / 完全正确` | 1 | claude |

## 修辞色彩词

判定说明：词素带比喻形象

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| > **路径注意（已写入CHANGELOG）**：paper-search 下载时须用 Windows 路径 `C:\Users\87878\...`，Unix路径 `/c/...` 会导致文件落入 `C:\c\...` 旁路目录 | 1 | claude |

## 空洞大词

判定说明：含义模糊而语气强烈

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| 现在并行发起8组不同关键词搜索，覆盖政治表演、建构主义、面子/印象管理、东非/卢旺达等多个维度 | 1 | claude |
| 现在换用更聚焦的关键词并行搜索 | 1 | claude |
| 本轮聚焦三大主题：imihigo 制度、政治表演性、卢旺达对外关系/援助 | 1 | claude |
| 继续第二批搜索，聚焦表演性政治理论、形象管理、卢旺达发展国家等更精准的角度： | 1 | claude |
| 执行清理：删除5个重复文件 + 重命名13个文件（对齐已有 MD 基名）： | 1 | claude |
| - 更新 3 个已有 MD 的 PDF 字段对齐新文件名 | 1 | claude |
| 下载链路不平整,我没有盲信文件名,而是**逐篇用 pypdf 抽首页文字核对标题**,因此拦下了两个错配: | 1 | claude |
| 考虑到你当前的项目背景（非洲政治学、卢旺达研究），如果你需要一个方向，我提出几个问题帮你聚焦： | 1 | claude |
| 2. **你希望偏向哪个分析维度？**（例如：制度建设、政治修辞、监控治理、非洲发展合作等） | 1 | claude |
| 这一发现来自对埃塞俄比亚的深度组织民族志研究（3 个月田野调查，30 次深度访谈），包含三个维度： | 1 | claude |
| **验证结果**：三个维度分别以 3-0、2-1、2-1 通过 | 1 | claude |
| - 提出了仪式行动的三个维度：**理性（rationality）**、**功能性（functionality）**、**展演性（performativity）** | 1 | claude |
| 保存后告诉我，我立即继续调试下载流程——只差最后一步捕获文件就能打通全流程 | 1 | claude |
| 我们正在做的是**从 Anna's Archive 自动化下载学术书籍**，流程已打通 90%，只差最后一步——捕获 DDoS-Guard 通过后的文件下载 | 1 | claude |
| \| 维度 \| 篇数 \| 代表文献 \| | 1 | claude |
| ### ✅ 已覆盖维度（全面） | 1 | claude |
| \| 维度 \| 代表文献 \| | 1 | claude |
| **Round 6** — 聚焦 OA 友好渠道，加速下载： | 1 | claude |
| ### ✅ 已覆盖12个维度 | 1 | claude |
| 当前核心文献覆盖已相当全面（经典+综述+批判+前沿+区域各维度齐全），接近终止条件(3) | 1 | claude |
| ** 但核心文献覆盖已极为全面——经典+综述+批判+实证+区域+专题各维度均已覆盖，接近终止条件(3)："核心文献已覆盖（各维度齐全）" | 1 | claude |
| \| **覆盖维度** \| 18 个 \| | 1 | claude |
| 接近终止条件(3)——核心文献已覆盖（经典+综述+批判+实证+前沿+区域各维度齐全） | 1 | claude |
| 所有信息已全部落地为 markdown | 1 | claude |
| 按三个维度组织：**① 卢旺达的政治表演呈现**（国家如何为内外受众表演） | 1 | claude |
| ### A 卢旺达/东非聚焦 × 援助核心（12 篇） | 1 | claude |
| 3. **`/` 快捷键聚焦搜索框** — 小便利 | 1 | claude |
| 分三批补全，每批约 35-40 词，全部聚焦 freq 7-10 高使用率 | 1 | claude |
| - **策略主线**：以**「自我表达」**为情绪锚点，搭一条 **看见自己 → 表达自己 → 拥有自己** 的闭环：人格测试负责"看见"、UGC 孵化负责"表达"、限定罐负责"拥有" | 1 | claude |
| - 落地形式：H5 / 小程序，入口投放在乐堡官微、网易云活动页、达人种草帖 | 1 | claude |

## 空洞动词

判定说明：语义空洞，可换成具体动作

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| - 从 research 预设创建了 `config.yaml`，文档目录指向 `./literature` | 1 | claude |
| - 创建了 `.claude/mcp.json`，指向 knowledge-rag 命令 | 1 | claude |
| 这意味着：援助流动是依靠**表演性地交付减贫成果**来维系的，而非依靠民主问责制 | 1 | claude |
| **项目级配置**（`非洲论文\orientation2_perfomance&aid\.claude\mcp.json`）本身是正确的，`config.yaml` 也已配置好，指向 `./literature` 目录做文档索引 | 1 | claude |
| \| `README.md` \| 5KB \| 总索引，指向全部 25 个 md \| | 1 | claude |
| 这是最明显的结构性问题之一：表格指向不存在的课文卡片 | 1 | claude |
| 详细规则与**完整变更日志**（v1.1→v1.4、长图 v1/v2/v3、0616 改）一直在维护，§0b 基准已指向 v1.4 | 1 | claude |
| `CLAUDE.md` 变更日志 + `_HANDOFF_交接说明.md`（产物指向 v2、记录页码映射与 GIF 细节） | 1 | claude |
| 已更新 `CLAUDE.md` 变更日志、`_HANDOFF_交接说明.md`（指向 v3）、`video-gif/_NAMING_NOTE.md`（新 3 段时间段与用途） | 1 | claude |
| 并在 `_HANDOFF_交接说明.md §5` 和 `CLAUDE.md` 变更日志加了指向 `_style_guide/` 的入口，确保下个 agent 能发现并先读它 | 1 | claude |
| 改成指向你的真实 Chrome 用户数据目录： | 1 | claude |
| - **仅当** A 反复失败超过一段时间（指向令牌过期而非后端故障），才需要你在终端跑一次 `/login` 重新登录——届时我会明确提示 | 1 | claude |
| 对于"每天自动生成简报"这个需求，7 天过期意味着你每周至少要重新设置一次——这显然不够自动化 | 1 | claude |

## 单字动词加补语

判定说明：口语结构

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| 现在把 4 篇文献（3 篇目标 + APPP 简报）写成 markdown 文档并批量加入 knowledge-rag | 2 | claude |
| ## ✅ `larkcli` 安装完成 | 1 | claude |
| 删除那 3 个冲突的 chroma_db，然后让 knowledge-rag 在项目目录下跑完一次完整索引 | 1 | claude |
| 这次让它在后台跑完索引，后续启动就快了 | 1 | claude |
| 并行写完剩余所有MD文件： | 1 | claude |
| **所有35篇MD文件全部写完！** 最后更新CHANGELOG并生成汇总INDEX： | 1 | claude |
| 每条都在文件里写明了**与现有论文的具体"生发点"**（例如 Dietrich 的捐助者侧"绕开 vs 经由"模型，正好可补上卢旺达用 Imihigo/清廉排名诱导捐助者选择"engage/预算支持"的**受援国能动性**一环） | 1 | claude |
| Oren_Solomon 提取出错，尝试修复 | 1 | claude |
| 您希望我尝试哪个方向？或者您可以先通过Anna's Archive手动下载几本核心著作放进来，我继续做知识库整合 | 1 | claude |
| Cloudscraper 成功绕过了 Cloudflare！现在写完整的下载脚本 | 1 | claude |
| 安装完成，但这个 skill 有个问题——让我直接说明： | 1 | claude |
| 已补上启动按钮，验证可正常出题、计分、显示「下一题」 | 1 | claude |
| Agent 配置本身可以先写好，但真正运行时会缺少这些组件 | 1 | claude |
| 代码写好，先验证合成不报错： | 1 | claude |
| - **枪口火焰** → 已移除（`weapon.py` 删掉 `effects.muzzle_flash`） | 1 | claude |
| ## 游戏已自己跑起来验证（不止写完） | 1 | claude |
| **双击 [run.bat](run.bat)** 即可（虚拟环境和依赖我已装好，会直接进游戏） | 1 | claude |
| ursina 我**已经装好了**——只是装在项目的 `venv` 里，必须在项目目录运行 | 1 | claude |
| **你现在就能玩（源码方式，ursina 其实已经装好了）：** | 1 | claude |
| ursina 我确实装好了——装在项目的 `venv` 里 | 1 | claude |
| **我这次用截图亲眼确认了画面**（坦白：上次我说"已实测 exe 可运行"只验证了"不崩溃"，没看画面，所以漏掉了这个纯视觉 bug——这次补上了截图自检）： | 1 | claude |
| > 🔴 提醒一条红线（已写在 `CLAUDE.md` 置顶）：**未公开的融资/估值/投资方、未发布产品参数、客户名单、内部技术细节，绝不要放进会外传或公开同步的地方** | 1 | claude |
| > 说明这是**半自动**：脚本出"结构化初稿+真实事件"，在 Claude Code 里你对我说一句"把今天的综合分析润色成稿"，我就改写成连贯成文 | 1 | claude |
| 重写完成，逻辑链现在诚实了： | 1 | claude |
| 1. **行业基准 → 删掉**，改为用刘家铭**本账号实测数据**作为唯一基准 | 1 | claude |
| 3. **附录新增** MediaCrawler 采集任务——告诉你这个洞目前还没补上，什么时候补、怎么补 | 1 | claude |
| 有两个 xlsx 文件（`~$` 临时锁定文件）因为 Excel 打开中没移成功，关掉 Excel 后手动拖进去就行 | 1 | claude |
| `templates/` 里三个 xlsx 全部到位，`.~lock.*` 是 LibreOffice/WPS 的临时锁文件，不影响使用，关掉软件后会自动消失 | 1 | claude |
| **要我现在就把方案 A 的截图脚本写好吗？** 只需要 Python + `Pillow`（或 `pyautogui`），你的环境里可能已经有了 | 1 | claude |
| ffmpeg 安装中（后台），同时先把截图模式启动，等 ffmpeg 装好再加录频： | 1 | claude |

## 缩略化表达

判定说明：动词短语压成名词短语

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| ### 📋 待处理清单 | 1 | claude |

## 名词短语加冒号

判定说明：解释型冒号

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| \| **paper-search MCP** \| ✅ 已连接 \| 20+ 工具：跨 15+ 数据源搜索、下载 PDF、阅读提取文本 \| | 1 | claude |
| **最优方案：创建一个定制技能**，专门桥接你的 paper-search MCP 工具，提供完整的论文爬取工作流 | 1 | claude |
| ### 推荐方案：npm 全局安装 | 1 | claude |
| ## 四、AI Agent 接入：Split-Flow 授权流程 | 1 | claude |
| ### 第一步：发起授权（当前轮） | 1 | claude |
| ### 第二步：完成授权（用户确认后） | 1 | claude |
| ## 🔍 问题诊断：knowledge-rag MCP 无法加载 | 1 | claude |
| - 配置文件写的是：`BAAI/bge-small-en-v1.5` | 1 | claude |
| - ChromaDB 里存的是：`default`（旧版本/默认值） | 1 | claude |
| 结果就是：MCP 永远加载不出来 | 1 | claude |
| > 说明：✓表示数据库已确认引用量 | 1 | claude |
| 地区标记：🇷🇼卢旺达 | 1 | claude |
| ### 第一组：建构主义核心理论（IR/政治科学，Q1，≥100次引用） | 1 | claude |
| ### 第二组：政治表演、展示、面子、身份管理（Q1，≥100次引用） | 1 | claude |
| ### 第三组：象征性服从、空洞承诺、表演式合规（Q1，≥100次引用） | 1 | claude |
| ### 第四组：卢旺达/东非治理、援助、展示与合法性（Q1，≥100次引用） | 1 | claude |
| ### 第五组：补充（跨越政治表演与建构主义，Q1，≥100次引用） | 1 | claude |
| **请审阅后确认，我将进入下一步：批量下载PDF并在本地建立文献库 | 1 | claude |
| 第一批：5篇下载成功，1篇模型限速失败 | 1 | claude |
| 状态清晰：**IR_Constructivism 15篇完成 ✓，IR_NormCompliance 还差3篇，IR_Status 需补5篇，非洲/卢旺达区需7篇，最后更新CHANGELOG** | 1 | claude |
| `literature/literature/` 现共 **66 个 MD 文件**，全部包含：5条核心论点、关键概念、在研究框架中的位置 | 1 | claude |
| 本轮聚焦三大主题：imihigo 制度、政治表演性、卢旺达对外关系/援助 | 1 | claude |
| 最后一批补充搜索：卢旺达维和外交、发展馈赠理论、高现代主义等，随后开始批量下载： | 1 | claude |
| 全部核对通过：无遗留原始文件名，28篇新PDF全部有对应MD | 1 | claude |
| - 核对无误：无遗留原始文件名，28 篇 PDF 均有同名 MD | 1 | claude |
| - 当前库存：根目录 **105 篇 PDF**，元数据 **165 篇 MD** | 1 | claude |
| 特别契合你"表演的两侧"要求的核心收获：**Dubinsky 2025** 与 **Grix 2023** 直接论证了威权形象表演与西方/捐助方共谋互为条件（"it takes two to tango"） | 1 | claude |
| 执行清理：删除5个重复文件 + 重命名13个文件（对齐已有 MD 基名）： | 1 | claude |
| - 三重内部校验全部通过：① 39 年无缺口 | 1 | claude |
| - ⚠️ 一点局限：本次想做的**外部独立交叉抓取（WebFetch/WebSearch）被当前网络安全策略临时拦截**，所以"对照另一网站再核一遍"这步没能完成 | 1 | claude |

## 主语或宾语省略

判定说明：缺施动者或者对象

（语料中未命中）

## 时间状态缺失

判定说明：计划中的动作未标明

（语料中未命中）

## 口语虚词

判定说明：口语化连接与语气词

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| 从 JSON 输出提取 `verification_url` 和 `device_code`，然后生成二维码： | 1 | claude |
| 然后**结束本轮对话** | 1 | claude |
| 删除这 3 个冲突/损坏的 chroma_db 目录，然后重新从正确位置（项目目录）运行一次完整索引 | 1 | claude |
| 删除那 3 个冲突的 chroma_db，然后让 knowledge-rag 在项目目录下跑完一次完整索引 | 1 | claude |
| 还是有 embedding 冲突，但这是 Python 包内部的行为 — 它在早期初始化时先创建了 `default` 集合，然后读到配置才检测到冲突 | 1 | claude |
| 好的，我将先探索这个文件夹的结构和内容，然后设计一个计划来建立知识库 | 1 | claude |
| 先更新任务状态，然后开始创建知识库文件 | 1 | claude |
| 我先搜索可用的文献检索工具，然后系统地执行这个多条件搜索 | 1 | claude |
| 我先加载文献搜索工具，然后系统性地多路并行检索 | 1 | claude |
| 再试几篇并确认总数，然后开始重命名与建MD： | 1 | claude |
| 需要我接着做的话:可加 **constant 2021 US$（实际值）** 或 **per‑capita** 指标、生成 **图表/xlsx**、或把六国扩展到 **ICGLR 更大范围** | 1 | claude |
| 然后**排除所有已收录条目**，沿两个主题桶检索，引用数经 OpenAlex/Semantic Scholar 实时核验 | 1 | claude |
| 需要的话我可以用 `download_*` 工具尝试抓取开放获取的 PDF 到 `literature/` | 1 | claude |
| - 自动聚合器(CORE)给 Behuria DOI 返回的其实是一篇**吉尔吉斯斯坦**的论文 → 已删除,改用 Sci‑Hub 重下正确版本; | 1 | claude |
| 让我先全面了解当前配置状态，然后帮你启用 knowledge-rag MCP | 1 | claude |
| **请直接告诉我你想研究的具体问题**，然后我会立即启动多角度搜索和深度研究 | 1 | claude |
| 好问题！让我提炼成精确的研究问题，然后启动深度研究 | 1 | claude |
| 先确认 paper-search CLI 可用，然后多路并行搜索 | 1 | claude |
| 先确认 CLI 可用，然后并行搜索 | 1 | claude |
| 先确认哪些论文不在 literature 文件夹中，然后并行下载 | 1 | claude |
| 先重命名剩余文件，然后尝试从 Anna's Archive 下载重要著作 | 1 | claude |
| 大量文件内容错误！让我用正确编码检查剩余文件，然后重新下载 | 1 | claude |
| 无DDoS-Guard！只需搞定认证即可 | 1 | claude |
| 1. **重新安装 `knowledge-rag` MCP** — 需要找到它的安装源（是 pip 包吗？是 GitHub 仓库吗？），然后重新安装 | 1 | claude |
| 让我给 Git 配上代理，然后重新安装： | 1 | claude |
| 实际上，重新读取文件后发现：在第 30 行 items 表格之后，`---`，然后是第 32 行 `## 文化成语`，第 34 行的引用语块，然后是 `---`，然后第 38 行 `## 学习工具` | 1 | claude |
| 每个文件都以 H1 标题开头，后跟一个介绍性引用语，然后是 `---` | 1 | claude |
| 让我先读取项目配置文档，然后调用文献搜索工具进行系统性检索 | 1 | claude |
| 先加载搜索工具，然后并行发起多组查询以确保覆盖 20+ 篇 | 1 | claude |
| 先枚举核心英文检索词，然后并行发起 6 组精准查询 | 1 | claude |

## 成对套话句式

判定说明：成对套话

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| **需要你批准：** 允许 git clone `https://github.com/kaiCATs/pet-reminder` 到本地，我好在此基础上修改 | 1 | claude |

## 长句未切分

判定说明：连续 56 字以上无停顿

| 原始语句 | 命中次数 | 来源 |
|---|---|---|
| I'm ready to help you discover and install skills from the open agent skills ecosystem. | 1 | claude |
| - **"Find a skill for React testing"** — I'll search for relevant skills | 1 | claude |
| - **"How do I make my app faster?"** — I'll look for performance optimization skills | 1 | claude |
| - **"Is there a skill for PR reviews?"** — I'll check what's available | 1 | claude |
| - **"I need help with deployment"** — I'll find deployment-related skills | 1 | claude |
| API Error: Unable to connect to API: SSL certificate hostname mismatch | 1 | claude |
| > *"Cannot access full-text papers directly" "Cannot execute database searches"* | 1 | claude |
| - **仓库**: [github.com/larksuite/cli](https://github.com/larksuite/cli) | 1 | claude |
| \| **命令** \| `npm install -g @larksuite/cli` \| `git clone` + `make install` \| | 1 | claude |
| 步骤 1 成功，但步骤 2（CLI SKILL）因网络问题失败 — Git 克隆 GitHub 仓库时 SSL/TLS 握手被阻断 | 1 | claude |
| 原始命令 `npx skills add larksuite/cli -y -g` 因 **Git SSL/TLS 网络问题**（国内网络环境）无法克隆 GitHub 仓库 | 1 | claude |
| \| \| **Bot 身份** (`--as bot`) \| **User 身份** (`--as user`) \| | 1 | claude |
| 当 lark-cli 运行在 Agent 环境（Claude Code / OpenClaw / Hermes）中时，需要将应用凭证绑定到 Agent 工作空间 | 1 | claude |
| \| Agent split-flow \| `lark-cli auth login --scope "xxx" --no-wait --json` \| | 1 | claude |
| \| 生成二维码 \| `lark-cli auth qrcode "<url>" --output "qr.png"` \| | 1 | claude |
| \| Agent 绑定 \| `lark-cli config bind --identity bot-only` \| | 1 | claude |
| Here are the available skills you can use with `/` commands: | 1 | claude |
| \| `/code-review` \| Review current diff for correctness bugs and reuse/simplification/efficiency cleanups \| | 1 | claude |
| \| `/security-review` \| Complete a security review of pending changes on the current branch \| | 1 | claude |
| \| `/verify` \| Verify a code change works by running the app and observing behavior \| | 1 | claude |
| \| `/init` \| Initialize a new CLAUDE.md with codebase documentation \| | 1 | claude |
| \| `/update-config` \| Configure settings.json — permissions, hooks, env vars, automated behaviors \| | 1 | claude |
| \| `/fewer-permission-prompts` \| Scan transcripts for common read-only commands and add an allowlist to reduce prompts \| | 1 | claude |
| \| `/keybindings-help` \| Customize keyboard shortcuts and chord bindings \| | 1 | claude |
| \| `/run` \| Launch and drive this project's app to see a change working \| | 1 | claude |
| \| `/loop` \| Run a prompt or slash command on a recurring interval \| | 1 | claude |
| \| `/find-skills` \| Discover and install agent skills from the community \| | 1 | claude |
| Let me check your MCP configuration to diagnose the issue. | 1 | claude |
| 索引所有 PDF 需要几分钟，而 Claude Code 的 MCP 客户端在 server 没有及时响应 `initialize` 请求时会**超时断开** | 1 | claude |
| - `C:\Users\87878\%USERPROFILE%\knowledge-rag\data\chroma_db` — 路径展开 bug | 1 | claude |
