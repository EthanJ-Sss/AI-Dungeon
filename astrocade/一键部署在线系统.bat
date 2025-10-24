@echo off
chcp 65001 >nul
echo ========================================
echo  异步对战在线系统 - 一键部署助手
echo ========================================
echo.

echo [1/4] 检查环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未安装 Node.js，请先安装
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

echo.
echo [2/4] 检查 .env.local 配置...
if not exist ".env.local" (
    echo.
    echo ⚠️  还没有配置 .env.local
    echo.
    echo 请按照以下步骤快速配置（2分钟）：
    echo.
    echo 步骤1: 打开浏览器访问 https://supabase.com
    echo 步骤2: 使用 GitHub 登录
    echo 步骤3: 点击 "New Project"
    echo 步骤4: 填写：
    echo        项目名称: astrocade-ladder
    echo        密码: [设置一个密码并记住]
    echo        区域: Tokyo
    echo 步骤5: 等待项目创建完成（约1分钟）
    echo 步骤6: 点击 "SQL Editor"
    echo 步骤7: 复制 supabase-schema.sql 的内容并执行
    echo 步骤8: 进入 Settings -^> API，复制以下信息：
    echo.
    pause
    echo.
    echo 现在开始配置环境变量...
    echo.
    set /p SUPABASE_URL="请输入 Project URL: "
    set /p SUPABASE_KEY="请输入 anon public key: "
    
    echo VITE_SUPABASE_URL=%SUPABASE_URL%> .env.local
    echo VITE_SUPABASE_ANON_KEY=%SUPABASE_KEY%>> .env.local
    
    echo ✅ 配置文件已创建
) else (
    echo ✅ 配置文件已存在
)

echo.
echo [3/4] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo [4/4] 构建生产版本...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 构建完成

echo.
echo ========================================
echo  🎉 部署准备完成！
echo ========================================
echo.
echo 构建文件位于: dist/
echo.
echo 下一步：将 dist/ 文件夹上传到服务器
echo 服务器地址: http://43.173.170.5:8080/
echo.
echo 上传方式：
echo 1. 使用 FTP/SFTP 上传到服务器
echo 2. 或运行 "npm run deploy" （如果已配置）
echo.
pause

