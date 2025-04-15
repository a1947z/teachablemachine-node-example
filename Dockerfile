FROM node:16-bullseye

# 安装编译 native 模块的依赖，canvas 所需库全部列出
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
COPY package*.json ./

# 安装依赖（如果 canvas 在 package.json 中）：
RUN npm config set  registry https://repo.huaweicloud.com/repository/npm/
RUN npm install --legacy-peer-deps

# 再拷贝剩下的源码
COPY . .

EXPOSE 3000
CMD [ "node", "app.js" ]
