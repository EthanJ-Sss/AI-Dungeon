@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║       🚀 正在自动部署到服务器...                      ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/3] 检查部署文件...
if not exist dist (
    echo ❌ dist 目录不存在，请先构建
    pause
    exit /b 1
)
echo ✅ 找到 dist 目录

echo.
echo [2/3] 准备上传到服务器...
echo 服务器: ubuntu@43.173.170.5
echo 目标: /var/www/html/
echo.

echo [3/3] 使用 WinSCP 命令行上传...

:: 创建 WinSCP 脚本
echo option batch abort > temp_upload.txt
echo option confirm off >> temp_upload.txt
echo open sftp://ubuntu:MTc1MjA0NDQ0MQ@43.173.170.5 >> temp_upload.txt
echo cd /var/www/html/ >> temp_upload.txt
echo lcd dist >> temp_upload.txt
echo put * >> temp_upload.txt
echo exit >> temp_upload.txt

:: 尝试使用 WinSCP
if exist "C:\Program Files (x86)\WinSCP\WinSCP.com" (
    "C:\Program Files (x86)\WinSCP\WinSCP.com" /script=temp_upload.txt
    del temp_upload.txt
    echo.
    echo ✅ 部署完成！
    echo 访问: http://43.173.170.5:8080/
    pause
    exit /b 0
)

if exist "C:\Program Files\WinSCP\WinSCP.com" (
    "C:\Program Files\WinSCP\WinSCP.com" /script=temp_upload.txt
    del temp_upload.txt
    echo.
    echo ✅ 部署完成！
    echo 访问: http://43.173.170.5:8080/
    pause
    exit /b 0
)

del temp_upload.txt

echo.
echo ⚠️ 未找到 WinSCP，尝试使用 pscp...

:: 尝试使用 pscp
echo MTc1MjA0NDQ0MQ | pscp -batch -r dist\* ubuntu@43.173.170.5:/var/www/html/ 2>nul
if errorlevel 0 (
    echo ✅ 使用 pscp 部署完成！
    echo 访问: http://43.173.170.5:8080/
    pause
    exit /b 0
)

echo.
echo ══════════════════════════════════════════════════════
echo 自动上传失败，请使用以下信息手动上传：
echo ══════════════════════════════════════════════════════
echo.
echo 服务器: 43.173.170.5
echo 用户名: ubuntu
echo 密码: MTc1MjA0NDQ0MQ
echo 本地文件: %~dp0dist\*
echo 目标路径: /var/www/html/
echo.
echo 使用 WinSCP 或 FileZilla:
echo 1. 连接到服务器
echo 2. 上传 dist 目录中的所有文件
echo 3. 访问 http://43.173.170.5:8080/
echo.
pause

