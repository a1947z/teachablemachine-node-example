# 存在问题
- 在windows下出现gyp错误，gyp错误以来vs版本，所以这个项目直接下载node镜像，在Docker里build
- Node当前选择为node:16-bullseye，提前pull到本地
- 


# 构建

```
docker build -t teachablemachine .

```
# 运行
```
docker run --rm -p 3000:3000 teachablemachine
```