# 部署指南 (Deployment Guide)

本指南介绍如何在 Linux 服务器（如 Ubuntu）上使用 Nginx 部署 PitchPerfect AI。

## 1. 环境准备
确保服务器已安装以下软件：
- **Node.js** (v18+): `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
- **Nginx**: `sudo apt install nginx`
- **MongoDB**: (可选，如果使用本地数据库) [安装指南](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)
- **PM2**: `sudo npm install -g pm2`

## 2. 获取代码
```bash
git clone https://github.com/your-username/PitchPerfect-AI.git
cd PitchPerfect-AI
```

## 3. 安装依赖与构建
```bash
# 安装依赖
npm install

# 构建前端 (生成 dist 目录)
npm run build
```

## 4. 启动后端服务
我们使用 PM2 来管理 Node.js 进程，确保它在后台稳定运行。

1. 修改 `.env` 文件（或确保环境变量正确设置）。
2. 使用 PM2 启动：
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 5. 配置 Nginx
Nginx 将作为反向代理，同时负责提供前端静态文件和转发 API 请求。

1. 将项目中的 `nginx.conf` 内容复制到 Nginx 配置目录：
```bash
sudo nano /etc/nginx/sites-available/pitchperfect
```
(粘贴 `nginx.conf` 的内容，并修改 `server_name` 和 `root` 路径)

**注意修改 root 路径**：确保 `root` 指向你实际的 `dist` 目录，例如 `/home/ubuntu/PitchPerfect-AI/dist`。

2. 启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/pitchperfect /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置是否正确
sudo systemctl restart nginx
```

## 6. 完成
现在可以通过浏览器访问你的域名或服务器 IP 来使用应用了！

---

### 常见问题
- **API 请求 404/502**: 检查后端是否在 4000 端口运行 (`pm2 list`)。
- **页面刷新 404**: 确保 Nginx 配置中有 `try_files $uri $uri/ /index.html;`。
- **MongoDB 连接失败**: 确保 MongoDB 服务已启动，或 `.env` 中的 `MONGO_URI` 正确。
