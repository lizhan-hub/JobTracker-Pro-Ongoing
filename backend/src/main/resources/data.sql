-- 清理旧表结构
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS job;

-- 创建job表（移除status字段）
CREATE TABLE job (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    source VARCHAR(255)
);

-- 创建user_favorites表
CREATE TABLE user_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    favorited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES job(id),
    UNIQUE(user_id, job_id)
);




-- 插入一些公开的职位数据
INSERT INTO job (title, company, location, description, source) VALUES
('Java开发工程师', '阿里巴巴', '杭州', '负责Java后端开发，要求3年以上经验，熟悉Spring Boot、MySQL等技术栈', 'LinkedIn'),
('前端开发工程师', '腾讯', '深圳', '负责React/Vue开发，要求2年以上经验，熟悉现代前端技术', 'Indeed'),
('全栈工程师', '字节跳动', '北京', '负责前后端开发，要求4年以上经验，熟悉多种编程语言', 'Boss直聘'),
('Python开发工程师', '百度', '北京', '负责Python后端开发，要求3年以上经验，熟悉Django、Flask等框架', '拉勾'),
('DevOps工程师', '美团', '北京', '负责CI/CD流程，要求3年以上经验，熟悉Docker、Kubernetes等工具', '猎聘'),
('产品经理', '小米', '北京', '负责产品规划和设计，要求5年以上经验，有互联网产品经验', '智联招聘'),
('UI设计师', '网易', '杭州', '负责产品界面设计，要求3年以上经验，熟悉设计工具和设计规范', '前程无忧'),
('数据分析师', '滴滴', '北京', '负责数据分析和挖掘，要求2年以上经验，熟悉SQL和Python', '脉脉');