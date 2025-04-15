# Stage 1: 构建 node_modules（含 canvas 编译）
FROM node:16-bullseye as deps

WORKDIR /app
COPY package*.json ./

RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

RUN npm install --build-from-source=canvas --legacy-peer-deps

# Stage 2: 运行阶段镜像，复用依赖并安装必要系统库
FROM node:16-bullseye

WORKDIR /app

# ✅ 再装一遍运行时需要的系统依赖（不需要编译工具）
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libgif-dev \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
