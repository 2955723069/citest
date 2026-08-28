# CITEST PORTAL

一个纯静态的演示登录门户网站。包含登录页与登录后的快捷入口页，账号密码仅保存在浏览器会话中，**不会发送到任何服务器**。

## 功能

- **登录页 (`index.html`)**：输入任意非空账号和密码即可登录，支持显示/隐藏密码、表单校验与无障碍提示。
- **快捷入口页 (`welcome.html`)**：登录后展示常用网站（百度、必应、GitHub），并可退出登录。
- **会话管理**：使用 `sessionStorage` 保存登录状态，未登录访问 `welcome.html` 会自动跳回登录页。
- **渐进增强**：未启用 JavaScript 时不会提交账号密码。

## 运行

```bash
python3 -m http.server 4173
```

然后在浏览器打开 http://127.0.0.1:4173 。

## 测试

```bash
npm test
```

基于 Node 内置测试运行器（`node --test`），覆盖认证逻辑、页面控制器与站点契约。

## 目录结构

```
├── index.html        # 登录页
├── welcome.html      # 登录后的快捷入口页
├── styles.css        # 样式
├── js/
│   ├── auth.js       # 会话与凭据校验逻辑
│   ├── login.js      # 登录页控制器
│   └── welcome.js    # 快捷入口页控制器
├── tests/            # Node 测试
└── assets/           # 静态资源
```

## 说明

登录背景图来自 [Unsplash](https://unsplash.com/photos/an-empty-modern-office-with-a-desk-and-window-K9DZz7B8sCU)，遵循 Unsplash License。

> 演示项目，请勿用于真实的身份认证。
