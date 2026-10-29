# Nginx 发布

`npm run build` 生成 `dist/`。将其中的内容完整发布到现有站点的静态根目录，保持 JS/CSS 与 index.html 来自同一次构建。

构建资源使用 `/static/`，避免与资产页面路由 `/assets` 冲突。

将 `spa.nginx.conf` 中的规则合并到现有 `server` 中：

- `root` 指向发布的静态根目录。
- 如果已有 `location /` 或 `/static/`，合并或替换对应块，不要重复配置。
- 保留现有 `/api/` 反向代理。本站的配置接口不可代理回相同域名，否则可能循环请求；`safe-config.nginx.conf` 用于其他 Web 域名部署时访问配置中心。
- `/assets` 和 `/assets/` 的精确匹配返回应用入口，也可修复旧构建残留 `assets/` 目录时的 403。
- `/static/` 下不存在的文件应返回 404，不能回退为 HTML。
- 入口文件不长期缓存，带哈希的静态文件可以长期缓存。更新时先上传静态文件，最后切换 index.html，保留上一版本哈希文件供旧会话使用。

由有服务器访问权限的维护者执行 `nginx -t`，通过后执行 `nginx -s reload`。然后检查：

1. `/assets`、`/assets/`、`/transactions/`、`/new-safe/create` 直接打开和刷新均返回应用 HTML。
2. HTML 中引用的 `/static/*.js`、`/static/*.css` 返回正确内容类型。
3. `/static/not-found.js` 返回 404。
4. `/api/config/safe` 仍返回 JSON。

本地工程修改不会自动修改线上 Nginx；必须发布新构建并合并服务器规则。
