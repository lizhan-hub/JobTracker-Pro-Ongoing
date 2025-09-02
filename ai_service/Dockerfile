# 使用官方的 Python 镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
# --no-cache-dir 选项可以减小最终镜像的体积
RUN pip install --no-cache-dir -r requirements.txt

# 【核心修改】为 Playwright 安装它需要的浏览器内核
# 这会下载 Chromium, Firefox, WebKit 等浏览器到镜像中
RUN playwright install

# 复制所有应用代码（包括微调好的模型文件夹）
COPY . .

# 暴露 Flask 服务运行的端口
EXPOSE 5000

# 容器启动时运行的命令
CMD ["python", "api.py"]