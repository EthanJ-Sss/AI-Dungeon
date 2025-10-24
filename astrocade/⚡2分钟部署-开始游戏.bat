@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║     🎮 异步对战在线系统 - 2分钟部署助手 🎮               ║
echo ║                                                            ║
echo ║     立刻和朋友一起玩！                                     ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
timeout /t 2 >nul

echo 📋 准备工作检查...
echo.

REM 检查是否已经配置
if exist ".env.local" (
    echo ✅ 已配置在线服务
    echo.
    goto BUILD
)

echo ⚠️  首次使用需要配置在线服务
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  第1步：创建 Supabase 项目 （只需要做一次，约1分钟）
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. 浏览器会自动打开 Supabase 网站
echo 2. 点击右上角 "Sign In" → 用 GitHub 登录
echo 3. 点击 "New Project"
echo 4. 填写：
echo    - 项目名称：astrocade-ladder
echo    - 密码：Astrocade2025！（记住这个）
echo    - 区域：Tokyo
echo 5. 点击 "Create new project"
echo.
pause
echo.
echo 正在打开 Supabase 网站...
start https://supabase.com
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  第2步：创建数据库 （约30秒）
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 项目创建完成后：
echo 1. 点击左侧 "SQL Editor"
echo 2. 点击 "New query"
echo 3. 打开文件夹中的 "supabase-schema.sql"
echo 4. 复制全部内容，粘贴到 SQL Editor
echo 5. 点击右下角 "Run" 按钮
echo 6. 看到 "Success" 提示
echo.
echo 正在打开 SQL 文件...
start notepad supabase-schema.sql
echo.
pause
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  第3步：获取密钥 （约10秒）
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 在 Supabase 项目中：
echo 1. 点击左侧 "Settings" → "API"
echo 2. 找到并复制以下两个值
echo.
pause
echo.

:INPUT_CONFIG
echo.
echo 请粘贴配置信息：
echo.
set /p SUPABASE_URL="Project URL (https://xxxxx.supabase.co): "
if "%SUPABASE_URL%"=="" (
    echo ❌ URL 不能为空
    goto INPUT_CONFIG
)
echo.
set /p SUPABASE_KEY="anon public key (eyJhbGci...): "
if "%SUPABASE_KEY%"=="" (
    echo ❌ Key 不能为空
    goto INPUT_CONFIG
)

echo.
echo 正在保存配置...
(
echo VITE_SUPABASE_URL=%SUPABASE_URL%
echo VITE_SUPABASE_ANON_KEY=%SUPABASE_KEY%
) > .env.local

echo ✅ 配置保存成功！
echo.

:BUILD
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  第4步：构建项目 （约30秒）
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM 检查依赖
if not exist "node_modules" (
    echo 正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

echo 正在构建生产版本...
call npm run build
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║               🎉 部署准备完成！ 🎉                        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
echo ✅ 构建完成！文件位于：dist/
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  下一步：上传到服务器
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 选项1：本地测试（推荐先测试）
echo    运行：npx serve dist
echo    访问：http://localhost:3000
echo.
echo 选项2：上传到服务器
echo    将 dist\ 文件夹的内容上传到：
echo    http://43.173.170.5:8080/
echo.
echo    使用 FTP 工具（如 FileZilla）或：
echo    scp -r dist/* root@43.173.170.5:/var/www/astrocade/
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🎮 告诉朋友访问你的网站地址，一起开始游戏！
echo.
echo 每个人输入自己的昵称后，排名会实时同步！ ⚔️
echo.
pause

