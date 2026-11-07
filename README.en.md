# XuanJi PaiPan

[简体中文](README.md) | [English](README.en.md)

<div align="center">
  <img src="assets/logo/og-image.png" alt="XuanJi PaiPan: mystery of mysteries, gate of all wonders" width="560">

[![GitHub Pages](https://github.com/GaoRenYouShu/XuanJiPaiPan/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/GaoRenYouShu/XuanJiPaiPan/deployments)
[![Vercel](https://img.shields.io/website?url=https%3A%2F%2Fxuanjipaipan.vercel.app%2F&label=Vercel&logo=vercel)](https://xuanjipaipan.vercel.app/)
[![Cloudflare Pages](https://img.shields.io/website?url=https%3A%2F%2Fxuanjipaipan.pages.dev%2F&label=Cloudflare%20Pages&logo=cloudflare)](https://xuanjipaipan.pages.dev/)
[![Netlify](https://img.shields.io/website?url=https%3A%2F%2Fxuanjipaipan.netlify.app%2F&label=Netlify&logo=netlify)](https://xuanjipaipan.netlify.app/)
[![gaoren.org](https://img.shields.io/badge/gaoren.org-online-4c9e4c)](https://gaoren.org/)

[![License](https://img.shields.io/github/license/GaoRenYouShu/XuanJiPaiPan?style=flat-square&label=License)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/GaoRenYouShu/XuanJiPaiPan/main?style=flat-square)](https://github.com/GaoRenYouShu/XuanJiPaiPan/commits/main)
[![Repo size](https://img.shields.io/github/repo-size/GaoRenYouShu/XuanJiPaiPan?style=flat-square&label=Repo_size)](https://github.com/GaoRenYouShu/XuanJiPaiPan)
[![Code size](https://img.shields.io/github/languages/code-size/GaoRenYouShu/XuanJiPaiPan?style=flat-square&label=Code_size)](https://github.com/GaoRenYouShu/XuanJiPaiPan)
[![Commits](https://img.shields.io/github/commit-activity/t/GaoRenYouShu/XuanJiPaiPan?style=flat-square&label=Commits)](https://github.com/GaoRenYouShu/XuanJiPaiPan/commits/main)
[![Tools](https://img.shields.io/badge/Tools-38-2CA5E0?style=flat-square)](#feature-overview)
[![Pure frontend](https://img.shields.io/badge/Pure_frontend-Zero_build-4c9e4c?style=flat-square)](#tech-stack)
[![Works offline](https://img.shields.io/badge/Works_offline-PWA-7e57c2?style=flat-square)](#tech-stack)
[![Dual themes](https://img.shields.io/badge/Dual_themes-Follows_system-8a6d3b?style=flat-square)](#tech-stack)
![Vibe Coding](https://img.shields.io/badge/Vibe_Coding-100%25-ff69b4?style=flat-square)
</div>

A research and demonstration site for traditional Chinese metaphysics, calendrics and divination culture. A pure front-end static application with no backend: open it and it works. The site interface is in Chinese; browser translation works well for a quick look.

**Live demo** (five mirrors serving the same content, pick any):

- gaoren.org (custom domain): https://gaoren.org/
- GitHub Pages: https://gaorenyoushu.github.io/XuanJiPaiPan/
- Vercel: https://xuanjipaipan.vercel.app/
- Cloudflare Pages: https://xuanjipaipan.pages.dev/
- Netlify: https://xuanjipaipan.netlify.app/

All five mirrors serve identical content; speed depends on your location and route. GitHub Pages can be slow on the first load from mainland China (styles and fonts load on demand and settle within seconds); pick whichever is fastest for you.

## Feature Overview

Eight categories with 38 independent tools: Calendars, Fate Analysis, Three Styles, Divination, Folk Practices, Yunqi, Wellness and Physiognomy.

| Category | Tools |
|---|---|
| **Calendars** | Perpetual Calendar, Almanac, Buddhist Calendar, Taoist Calendar, Tibetan Calendar, Date Selection, Huangji Jingshi |
| **Fate Analysis** | BaZi Chart, BaZi Compatibility, Zi Wei Dou Shu, He Luo Numerology, Tie Ban Shen Shu, Name Analysis, Western Astrology, Qizheng Siyu |
| **Three Styles** | Qi Men Dun Jia, Da Liu Ren, Tai Yi Shen Shu |
| **Divination** | Liu Yao, Plum Blossom Numerology, Xiao Liu Ren, Fortune Sticks, Tarot, Lenormand |
| **Folk Practices** | Folk Divination, Character Divination, Duke of Zhou Dream Interpretation, Twenty-Eight Mansions, Tai Sui and Zodiac, Sacrificial Offerings |
| **Yunqi** | Five Movements and Six Qi, Ziwu Liuzhu Meridian Clock |
| **Wellness** | Essential Oil Aromatherapy |
| **Physiognomy** | Palmistry, Face Reading, Yang Dwelling Feng Shui, Yin Dwelling Feng Shui, Luopan |

## Interface Preview

| BaZi Chart | Zi Wei Dou Shu |
|:---:|:---:|
| ![BaZi Chart: four pillars, ten gods, luck cycles and symbolic stars](assets/preview/bazi.png) | ![Zi Wei Dou Shu: twelve palaces, star placements and four transformations](assets/preview/ziwei.png) |
| **Western Astrology** | **Yang Dwelling Feng Shui** |
| ![Western Astrology: natal chart with signs and houses](assets/preview/xingzhan.png) | ![Yang Dwelling Feng Shui: flying star chart of sitting and facing](assets/preview/fengshui.png) |
| **Liu Yao** | **Tarot** |
| ![Liu Yao: hexagram construction with world and response lines](assets/preview/liuyao.png) | ![Tarot: Rider-Waite deck and spreads](assets/preview/tarot.png) |

## Main Tools

Introduced in the order of the site's eight sections.

### Calendars (7)

- **Perpetual Calendar**: Gregorian, lunar and sexagenary conversion, the 24 solar terms, holiday markers, and a century-spanning calendar table for quick browsing
- **Almanac**: daily suitability and avoidance, clash and sha, auspicious and inauspicious deities, nayin, jianchu, the 28 mansions, nine-palace flying stars and hourly fortune
- **Buddhist Calendar**: Buddhist year counting against Gregorian and lunar dates, marking Buddha's Birthday, Vesak and other Buddhist festivals
- **Taoist Calendar**: Taoist year counting against Gregorian and lunar dates, marking the Three Primes, Eight Festivals and other Taoist observances
- **Tibetan Calendar**: Kalachakra Phugpa calculations, rabjung year counting, five elements and zodiac, duplicated and omitted days, auspicious days and school differences
- **Date Selection**: almanac-based date selection and destiny-based date selection, two sets of criteria listed side by side
- **Huangji Jingshi**: Shao Yong's yuan, hui, yun and shi framework; four-level placement for any Gregorian year (BC supported), the twelve hui hexagrams and historical anchors

### Fate Analysis (8)

- **BaZi Chart**: four pillars, ten gods, luck cycles, favorable elements, classic ten-god judgments and life-situation readings
- **BaZi Compatibility**: six-dimension scoring and mutual favorability, with two charts compared side by side
- **Zi Wei Dou Shu**: twelve palaces, major and minor stars, four transformations, life and body palaces
- **He Luo Numerology**: BaZi converted to numbers to raise the prenatal hexagram, Yuantang changing lines to derive the postnatal hexagram, yang-nine and yin-six luck cycles, and changing lines for year, month, day and hour layer by layer
- **Tie Ban Shen Shu**: Taixuan number conversion, eight-ke time determination, Huangji totals and verse drawing; birth data can be carried over from the BaZi page
- **Name Analysis**: five-grid profiling, three-talents configuration, three-cycle relations and 81-number numerology, with BaZi favorable-element integration
- **Western Astrology**: natal chart with the Sun through the Ascendant, signs, houses and aspect angles at a glance
- **Qizheng Siyu**: eleven luminaries in their mansions and Dongwei major periods, with true ecliptic longitude computed from the VSOP87 ephemeris

### Three Styles (3)

- **Qi Men Dun Jia**: hour-based nine-palace layout, three marvels and six instruments, eight gates, nine stars and eight deities, with patterns and useful gods annotated automatically
- **Da Liu Ren**: automatic heaven and earth plates, four lessons and three transmissions, the twelve heavenly generals and pattern classifications, with judgments and timing
- **Tai Yi Shen Shu**: Tai Yi accumulated years, the sixteen-deity layout, host and guest counts, and major and minor wanderings

### Divination (6)

- **Liu Yao**: seven casting methods including coins, numbers and time; automatic hexagram construction with six relations, six spirits, world and response lines; void and broken markers and symbolic-star timing; true solar time and consecutive-cast comparison
- **Plum Blossom Numerology**: time-based casting with automatic body and function separation, mutual, changed, opposite and reversed hexagrams, and judgments by generation and restraint and by hexagram qi
- **Xiao Liu Ren**: the six spirit hand formulas of Da An, Liu Lian, Su Xi, Chi Kou, Xiao Ji and Kong Wang; instant judgment from month, day and hour numbers
- **Fortune Sticks**: draw and interpret sticks from the Wong Tai Sin, Guanyin, Yue Lao and Guan Gong sets, with poems, historical allusions and auspicious or inauspicious readings
- **Tarot**: the 78-card Rider-Waite deck, six spreads, upright and reversed keywords with readings by domain, and astrological correspondences
- **Lenormand**: 36 cards, seven spreads, a full 630-pair combination dictionary, playing-card correspondences, significator houses and knight-move reading

### Folk Practices (6)

- **Folk Divination**: bone-weight fortune, offending-month lookup, natal Buddha, phone-number eight-star magnetism and the Book of Three Lives
- **Character Divination**: a curated glyph-splitting dictionary with question-driven splits, six-script annotations, added and removed stroke transformations, component glosses, Kangxi stroke counts, plum-blossom hexagrams, and hour and day correspondences
- **Duke of Zhou Dream Interpretation**: the full 951-entry text in 27 categories from the common edition, with dual-source comparison, keyword search and category browsing
- **Twenty-Eight Mansions**: natal mansion, Yanqin and mansion-based daily suitability, with the twelve palace divisions, the 24-mountain mansion mapping and judgments from the Treatise on the Celestial Offices
- **Tai Sui and Zodiac**: annual Tai Sui offense checks (value, clash, punishment, harm, destruction and combination), yearly and monthly forecasts for the twelve zodiac signs, and biographies of the 60 Tai Sui generals
- **Sacrificial Offerings**: seasonal rites, deity festivals, ancestral offerings, offerings and ritual taboos, queried by date, deity or occasion, with classical source, region and orientation for each entry

### Yunqi (2)

- **Five Movements and Six Qi**: annual movement, governing and terrestrial qi, guest and host qi, and qi convergence
- **Ziwu Liuzhu Meridian Clock**: twelve two-hour periods and their ruling meridians, twenty meridians, 361 standard acupoints plus extra points, nine categories of specific points, and the Nazhi and Feiteng point-selection methods

### Wellness (1)

- **Essential Oil Aromatherapy**: formulas calculated by effect, group, season and constitution, with 72 single oils, 18 carrier oils and 12 classic blends; each oil lists its main action, refined action, trade name and suitable groups, and specified single oils or carrier oils can be pinned into the formula, plus 20 hydrosols for reference only, with dilution limits and safety caveats cited entry by entry

### Physiognomy (5)

- **Palmistry**: seven palm shapes with nine palaces and eight mounts, the three major lines and auxiliary lines, a checklist self-assessment, and texts quoted from the Ma Yi Physiognomy
- **Face Reading**: three zones, seven face shapes, the five features, complexion and mole readings with twelve-palace position texts, plus self-assessment and classical illustrations
- **Yang Dwelling Feng Shui**: purple-white flying stars for year, month, day and hour, eight-mansion auspicious directions, 24-mountain orientation and annual Tai Sui avoidance; the compass uses the WMM2025 geomagnetic model to correct declination; the dwelling is the body and the year the function
- **Yin Dwelling Feng Shui**: terrain survey of dragon, sand, water and point, flying-star sitting and facing, three-harmony water methods and the eight-sha, yellow-spring and peach-blossom waters, immortal-destiny mountain matching and 28-mansion metal division, with burial dates chosen to avoid repeated mourning, repeat days, and the four separations and four severances
- **Luopan**: an online geomantic compass that gathers three plates and three needles, metal division, hexagram cycles and the 28 mansions onto one dial, modeled on a real luopan and fully rotatable; the three plate configurations are switchable, north is up and south is down, dial angles are geographic degrees, and black, gold or white backgrounds are available

All divination tools support switching between schools and algorithms, with results computed in real time.

## Site Navigation

The top navigation has nine sections: Calendars, Fate Analysis, Three Styles, Divination, Folk Practices, Yunqi, Wellness, Physiognomy and the Appendix of three pages.

- **Classics Reference** `dianji.html`: the classics, editions and open access channels behind each module
- **Documentation** `shuoming.html`: casting rules, school choices, source research, conventions and terminology for every tool
- **Algorithms and Data** `opensource.html`: open-source algorithm libraries and data sources, each entry noting its license and the pages it serves

## Tech Stack

- Pure HTML, CSS and vanilla JavaScript with no build step; runs on any static deployment
- Installable to the desktop and home screen (PWA); visited pages work offline; light and dark themes follow the system
- On Android the installed app is generated by Google Play services, so Google must be reachable; after installing it no longer depends on Google. Where Google is out of reach, add a shortcut to the home screen instead, which has no such requirement
- Calendar engine based on [lunar-javascript](https://github.com/6tail/lunar-javascript) (MIT)
- Zi Wei Dou Shu charting based on [iztro](https://github.com/SylarLong/iztro) (MIT)
- Astrology ephemeris based on [astronomy-engine](https://github.com/cosinekitty/astronomy) (MIT)
- Self-hosted fonts (SIL OFL 1.1) that work offline; see `opensource.html` for the full list

## Run Locally

Any static server will do:

```bash
cd XuanJiPaiPan
python -m http.server 8080
# open http://localhost:8080
```

You can also open `index.html` directly; scripts load by relative path and work offline.

## Deploy Online

Pure static with zero build. Fork the repository and pick any host; any domain and subpath work without changing the source: canonical, og:url and share-image links inside pages are generated by `assets/meta.js` from the actual address, and the 404 page is recognized automatically by each platform.

- **GitHub Pages**: repository Settings → Pages → Source: Deploy from a branch, Branch: main and the root directory (`(root)`).
- **Vercel**: import the repository at vercel.com/new, choose Other as the framework preset, leave the build command empty and set the output directory to `./`; keep everything else as default.
- **Cloudflare Pages**: Workers and Pages → Create → Pages → Connect to Git, choose None as the preset, leave the build command empty and set the output directory to `/`.
- **Netlify**: import the repository at app.netlify.com, leave the build command empty and set the publish directory to `./`.
- **Other hosts**: any static host or object storage with a CDN (Alibaba Cloud OSS, Tencent Cloud COS, EdgeOne Pages, Render and others) works by uploading the repository files as they are; no server side needed.

## Deploy with Docker

The site is pure static with no backend, so a container only has to serve files: no build step and no environment variables. The shortest path clones the repository and starts the container in one command:

```bash
git clone --depth 1 https://github.com/GaoRenYouShu/XuanJiPaiPan.git && cd XuanJiPaiPan && docker run -d --name xuanji-paipan -p 8080:80 -v "$PWD:/usr/share/nginx/html:ro" nginx:alpine
# open http://localhost:8080
```

With the repository already on disk, pick any of the following three ways.

**Run the nginx container against the repository** (no files changed; good for a local or intranet trial):

```bash
docker run -d --name xuanji-paipan -p 8080:80 \
  -v "$PWD:/usr/share/nginx/html:ro" \
  nginx:alpine
# open http://localhost:8080
```

**Build your own image** (good for intranet distribution and pinned versions):

```dockerfile
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY *.html manifest.webmanifest robots.txt sitemap.xml sw.js ./
COPY assets ./assets
```

```bash
docker build -t xuanji-paipan .
docker run -d --name xuanji-paipan -p 8080:80 xuanji-paipan
```

**Run with docker compose** (good for long-running deployments):

```yaml
services:
  xuanji-paipan:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./:/usr/share/nginx/html:ro
    restart: unless-stopped
```

```bash
docker compose up -d
```

- Any domain, port or subpath works as is: canonical, og:url and share-image links are generated from the actual address, with no source changes.
- PWA installation and offline caching require HTTPS or localhost: over plain http on a LAN IP the pages work but the service worker does not register; for public deployment put an HTTPS reverse proxy in front of the container.
- 404 page: nginx serves its own error page by default; to use the site's 404.html, add `error_page 404 /404.html;` to the server block.
- A read-only mount is enough: the site never writes, all data and calculation run in the browser, and recreating the container loses no state.

**Update a running deployment**: the container does not pull GitHub updates by itself; the steps depend on how it was deployed.

**Mounted repository** (including the one-command setup): pull the repository and refresh the page; no container restart is needed:

```bash
cd XuanJiPaiPan
git pull
```

**Built image**: rebuild and replace the old container:

```bash
cd XuanJiPaiPan
git pull
docker build -t xuanji-paipan .
docker rm -f xuanji-paipan
docker run -d --name xuanji-paipan -p 8080:80 xuanji-paipan
```

**Compose** mounts the repository, so updates follow the mounted case; rerun `docker compose up -d` only when the compose file itself changes.

For fully automatic updates, add a scheduled pull on the host:

```bash
# pull once a day at 04:00
0 4 * * * cd /path/to/XuanJiPaiPan && git pull --ff-only
```

If the upstream history was rewritten and `git pull` fails, align with `git fetch --depth 1 origin main && git reset --hard origin/main`.

### Commit Activity

![Repobeats analytics](https://repobeats.com/GaoRenYouShu/XuanJiPaiPan?theme=light&size=medium&period=30)

## Directory Structure

```
XuanJiPaiPan/
├── *.html        43 pages: 38 tools plus the home page, three appendix pages and a 404 page
├── assets/       all scripts, styles, fonts and image sources
├── manifest.webmanifest and sw.js   PWA manifest and offline service worker
├── .nojekyll     skips Jekyll processing on GitHub Pages
├── LICENSE       MIT license text
├── README.md and README.en.md
├── robots.txt
└── sitemap.xml
```

Running the site needs only the root pages and `assets/`; there are no external directory dependencies.

## License

Released under the [MIT License](LICENSE).

- Free to use, including personal use, commercial projects and further development
- Keep the copyright notice and attribution when using or distributing, and link to the repository in a prominent place
- Third-party open-source libraries remain under their respective licenses

## Data Sources and Credits

- [6tail/lunar-javascript](https://github.com/6tail/lunar-javascript): calendar data foundation (MIT)
- [SylarLong/iztro](https://github.com/SylarLong/iztro): Zi Wei Dou Shu engine (MIT)
- [cosinekitty/astronomy-engine](https://github.com/cosinekitty/astronomy): astrology ephemeris (MIT)
- [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck): the 78 public-domain Rider-Waite-Smith tarot cards (drawn by Pamela Colman Smith, 1909)
- [Unicode Unihan Database](https://www.unicode.org/charts/unihan.html): source of Kangxi stroke-count data (Unicode Data Files License)
- CBDB China Biographical Database: person data for the name analysis module (CC BY-NC-SA 4.0)
- Kyoto University Institute for Research in Humanities (Kanripo) and Wikisource: full-text sources of classical works (public domain and CC BY-SA)

See `opensource.html` for the complete list and per-entry licenses.

## Disclaimer

This project is a cultural research and entertainment demonstration. All charting, date selection and divination results are for cultural research reference only; please do not treat them as superstition. For major decisions, rely on professional advice. Chart calculations follow the mainstream conventions of each module, and the interpretation texts are performances of traditional destiny culture.

## Contact

[![Telegram](https://img.shields.io/badge/Telegram-@gaoren-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/gaoren)
