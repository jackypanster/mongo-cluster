# 使用Node.js官方镜像
FROM node:lts

# 创建工作目录
WORKDIR /usr/src/app

# 安装应用依赖
COPY package*.json ./
RUN npm install

# 复制应用源代码
COPY . .

# 应用绑定的端口
EXPOSE 3000

# 启动应用
CMD [ "node", "server.js" ]
