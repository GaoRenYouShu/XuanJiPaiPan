/* 访问统计信标装载（Cloudflare Web Analytics）：公开站点标识接入位，DSN 同款口径。
 *
 * 为什么有这件：GitHub Pages 无访问日志，站内对访客完全失明，功能优先级全靠猜。
 *   本件按站点红线以最小方式接入：Cloudflare 免费档无 cookie、无指纹，只采集
 *   页面地址、来源与浏览器粗类（国家、浏览器、设备类别），不含任何排盘数据，
 *   数据面板仅站长可见。
 *
 * 接入位（唯一一步）：CF_TOKEN 填入 Cloudflare Web Analytics 的站点令牌即生效；
 *   空串（缺省）＝不装载、零外发、零开销。启用步骤见运维手册（docs 目录下监控预览与回滚一档）。
 * 口径：只在正式站装载（主机名精确判加正式站路径前缀判：预览站与正式站同主机名，
 *   仅路径前缀之别，故 hostname 判挡不住它，必须再看 pathname）；预览站与本地开发
 *   不计入正式站统计；script 由本件动态挂载，装载失败静默，不碍任何排盘功能。
 * 登记与放行：上报主机已在开源页"站外数据服务"分组登记（机器核对外发与登记一致），
 *   CSP script-src 已放行信标脚本主机（按规范串逐页核对）。
 */
'use strict';
(function () {
  var CF_TOKEN = '7a1d2ce4b6d544d491a2eaf34ed43d46';   // Cloudflare Web Analytics 站点令牌（公开标识）；置空串即停用统计
  var HOST_ONLY = 'gaorenyoushu.github.io';
  if (!CF_TOKEN) return;
  if (location.hostname !== HOST_ONLY) return;
  /* 预览站与正式站同主机名（仅路径前缀之别），故按路径前缀再判一道：
     只认正式站前缀 /XuanJiPaiPan，排除预览站 /XuanJiPaiPan-preview。 */
  var p = location.pathname;
  if (p.indexOf('/XuanJiPaiPan-preview') === 0) return;
  if (p.indexOf('/XuanJiPaiPan') !== 0) return;
  try {
    var s = document.createElement('script');
    s.type = 'module';
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_TOKEN }));
    (document.head || document.documentElement).appendChild(s);
  } catch (e) { /* 挂载失败静默 */ }
})();
