FROM node:16-bullseye

# 安装构建工具
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 拷贝项目文件
COPY . .

# 安装依赖
RUN npm install --legacy-peer-deps

# 启动应用
CMD ["node", "app.js"]
