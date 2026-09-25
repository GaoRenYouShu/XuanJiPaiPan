# 玄机排盘 XuanJi PaiPan

[![GitHub Pages](https://github.com/GaoRenYouShu/XuanJiPaiPan/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/GaoRenYouShu/XuanJiPaiPan/deployments)
[![Vercel](https://img.shields.io/website?url=https%3A%2F%2Fxuanjipaipan.vercel.app%2F&label=Vercel&logo=vercel)](https://xuanjipaipan.vercel.app/)
[![Cloudflare Pages](https://img.shields.io/website?url=https%3A%2F%2Fxuanjipaipan.pages.dev%2F&label=Cloudflare%20Pages&logo=cloudflare)](https://xuanjipaipan.pages.dev/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/39651e9e-35f7-4f29-a2ab-0d41fdeab4f4/deploy-status)](https://app.netlify.com/projects/gregarious-duckanoo-ed4d5b/deploys)

传统命理、历法与占卜文化研究演示站。纯前端静态应用，无需后端，打开即用。

**在线体验**（四路镜像同源同步，任选其一）：

- GitHub Pages：https://gaorenyoushu.github.io/XuanJiPaiPan/
- Vercel：https://xuanjipaipan.vercel.app/
- Cloudflare Pages：https://xuanjipaipan.pages.dev/
- Netlify：https://xuanjipaipan.netlify.app/

## 功能总览

涵盖历法、命理、三式、占卜、民俗、运气、相术七大类，共 34 个独立工具。

| 分类 | 工具 |
|---|---|
| **历法** | 万年历、老黄历、佛历、道历、藏历、择日、皇极经世 |
| **命理** | 八字排盘、八字合婚、紫微斗数、河洛理数、铁板神数、姓名学、占星术、七政四余 |
| **三式** | 奇门遁甲、大六壬、太乙神数 |
| **占卜** | 六爻、梅花易数、小六壬、灵签、塔罗牌、雷诺曼 |
| **民俗** | 民俗占法、测字、周公解梦、二十八宿、太岁生肖 |
| **运气** | 五运六气 |
| **相术** | 手相、面相、阳宅风水、阴宅风水 |

## 主要工具

- **八字排盘**：四柱、十神、大运、喜用神、十神经典断语、命局断事
- **八字合婚**：六维评分、喜忌互补，两盘并排比对
- **紫微斗数**：十二宫、主星与辅星、四化、命身宫
- **七政四余**：十一曜躔宫入宿、洞微大限，真黄经由 VSOP87 星历推算
- **铁板神数**：太玄化数、八刻考时定刻、皇极总数、条文抽演，支持从八字页带入出生信息
- **皇极经世**：邵雍元会运世体系，任一公历年（支持公元前）的四级定位、十二会辟卦与大事锚点
- **老黄历**：宜忌、冲煞、吉凶神、纳音、建除、二十八宿、九宫飞星、时辰吉凶
- **择日**：黄历择吉与造命择日两套判据分列
- **姓名学**：五格剖象、三才配置、三运关系、八十一数理，支持八字喜用神联动
- **测字**：精编拆字字典，含随问取拆多拆法、六书标注、加笔减笔活拆变象、部件释义、康熙数理、梅花字占卦象、时辰外应与值日冲日应期
- **五运六气**：岁运、司天在泉、客主加临、运气同化
- **手相与面相**：三大主线与八丘、掌形指形；三停五官、十二宫、气色痣相

各占卜工具均支持流派与算法切换，结果实时计算。

## 站内导航

顶部导航按八卷编排：历法、命理、三式、占卜、民俗、运气、相术，另有附录三类。

- **典籍参考** `dianji.html`：各模块所依典籍、版本与开放获取渠道
- **说明文档** `shuoming.html`：每个工具的起例口径、流派取舍、源流考据、凡例与术语解说
- **算法数据** `opensource.html`：开源算法库与数据来源清单，各条注明许可与实装页面

## 技术构成

- 纯 HTML、CSS 与原生 JavaScript，无构建步骤，静态部署即可运行
- 可安装到桌面与主屏幕（PWA），已访问页面断网可用；跟随系统自动切换深浅色主题
- 历法引擎基于 [lunar-javascript](https://github.com/6tail/lunar-javascript)（MIT）
- 紫微斗数排盘基于 [iztro](https://github.com/SylarLong/iztro)（MIT）
- 占星星历基于 [astronomy-engine](https://github.com/cosinekitty/astronomy)（MIT）
- 字体自托管（SIL OFL 1.1），离线可用；完整清单见 `opensource.html`

## 本地运行

任意静态服务器即可：

```bash
cd XuanJiPaiPan
python -m http.server 8080
# 打开 http://localhost:8080
```

也可以直接双击 `index.html` 打开，脚本按相对路径加载，离线可用。

## 在线部署

纯静态零构建，Fork 到自己账号后任选一家托管，任意域名与子路径都无需改动源码：页面内的 canonical、og:url 与分享图链接由 `assets/meta.js` 按实际访问地址自动生成，404 页各平台自动识别。

- **GitHub Pages**：仓库 Settings → Pages → Source 选 Deploy from a branch，Branch 选 main 与根目录（`(root)`）。
- **Vercel**：在 vercel.com/new 导入仓库，Framework Preset 选 Other，构建命令留空、输出目录 `./`；缓存与 URL 规则已由 `vercel.json` 给定，保持默认即可。
- **Cloudflare Pages**：控制台 Workers 和 Pages → 创建 → Pages → 连接到 Git，预设选 None，构建命令留空、输出目录 `/`。
- **Cloudflare Workers（命令行直传）**：`npm i -g wrangler`，`wrangler login` 后在本目录执行 `wrangler deploy`；配置见 `wrangler.jsonc`，上传排除清单见 `.assetsignore`。
- **Netlify**：在 app.netlify.com 导入仓库，构建命令留空、发布目录 `./`。
- **其他托管**：任意静态托管或对象存储加 CDN（阿里云 OSS、腾讯云 COS、EdgeOne Pages、Render 等）将仓库文件原样上传即可，无需服务端。

## 目录结构

```
XuanJiPaiPan/
├── *.html        39 个页面：34 个工具加首页、附录三类与 404 页
├── assets/       全部脚本、样式、字体与图源
├── manifest.webmanifest 与 sw.js   PWA 清单与离线 Service Worker
├── vercel.json   Vercel 部署配置（URL 规则与字体缓存）
├── wrangler.jsonc 与 .assetsignore  Cloudflare Workers 静态资产部署配置
├── .nojekyll     GitHub Pages 免 Jekyll 处理
├── LICENSE       MIT 许可文本
├── README.md
├── robots.txt
└── sitemap.xml
```

网页运行只需根目录的页面与 `assets/` 两项，不含任何外部目录依赖。

## 开源协议

本项目采用 [MIT License](LICENSE)。

- 可免费使用，包括个人使用、商业项目与二次开发
- 使用或分发时请保留本项目版权声明与出处，并在显著位置注明仓库链接
- 引入的第三方开源库版权归其原作者所有，各自遵循其许可

## 数据来源与致谢

- [6tail/lunar-javascript](https://github.com/6tail/lunar-javascript)：历法数据底座（MIT）
- [SylarLong/iztro](https://github.com/SylarLong/iztro)：紫微斗数引擎（MIT）
- [cosinekitty/astronomy-engine](https://github.com/cosinekitty/astronomy)：占星星历（MIT）
- [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck)：韦特史密斯塔罗 78 张公有领域牌图（Pamela Colman Smith 绘，1909）
- [Unicode Unihan 数据库](https://www.unicode.org/charts/unihan.html)：康熙笔画字库数据源（Unicode Data Files License）
- CBDB 中国历代人物传记资料库：姓名学人物资料（CC BY-NC-SA 4.0）
- 京都大学人文科学研究所汉籍资料库（Kanripo）、维基文库：古籍全文底本（公有领域与 CC BY-SA）

完整清单与逐条许可见 `opensource.html`。

## 免责声明

本项目为传统文化研究与娱乐演示，所有排盘、择日、占卜结果仅供文化研究参考，请勿迷信。重大决策请以专业意见为准。排盘计算依各模块主流口径实现，解读文字为传统命理文化演绎。

## 联系方式

[![Telegram](https://img.shields.io/badge/Telegram-@gaoren-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/gaoren)
