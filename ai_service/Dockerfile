# 使用 Playwright 官方推荐的镜像，已包含所有浏览器依赖
FROM mcr.microsoft.com/playwright/python:v1.55.0-jammy

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
# --no-cache-dir 选项可以减小最终镜像的体积
RUN pip install --no-cache-dir -r requirements.txt

# 复制所有应用代码（包括微调好的模型文件夹）
COPY . .

# 暴露 Flask 服务运行的端口
EXPOSE 5000

# 容器启动时运行的命令
CMD ["python", "api.py"]