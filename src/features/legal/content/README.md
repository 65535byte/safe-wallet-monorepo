# 法律文件来源

中文正文迁移自本机 `drixone_8379_h5`：

- `src/pages/privacy-policy/index.vue`（六个章节）
- `src/pages/terms-service/index.vue`（八个章节）

源项目完整路径：`/Users/lzz/vscode/drixone_8379_h5`。保留原正文、品牌、联系邮箱、地域限制和原更新日期（2026 年 2 月 3 日），只将 Vue 的页面结构转换为本项目的内容数据和 React 页面。

源文件仅有中文；英文资源为本次同步翻译，章节和段落顺序与中文一致。不会根据部署时间更改正文的更新日期。

页面地址：`/privacy-policy`、`/terms-service`；`/terms-of-service` 为服务条款兼容入口。首页已连接和未连接状态均提供本地入口。不依赖钱包连接或业务 API。

Support pages are also migrated from the same H5 project: `/help` (12 FAQ items), `/service`, `/community`, and the linked `/suggest` form. Source `/pages/.../index` paths are accepted. Chinese content and community destinations are preserved, with English translations. Document UI follows the original white canvas, centered titles and section cards. The source feedback form uses a simulated request; the Web form keeps its fields and validation but reports that no submission endpoint is configured instead of claiming a successful delivery.
