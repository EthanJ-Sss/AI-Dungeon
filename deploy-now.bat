@echo off
chcp 65001 >nul
echo =========================================
echo Starting deployment to server...
echo =========================================
echo.

set SERVER=ubuntu@43.173.170.5

echo Connecting to server...
echo.

ssh -o StrictHostKeyChecking=no %SERVER% "echo 'Starting deployment...'; sudo apt-get update -qq; sudo apt-get install -y nodejs npm git nginx; echo 'Software installed'; sudo mkdir -p /var/www/ai-dungeon; sudo chown -R ubuntu:ubuntu /var/www/ai-dungeon; if [ -d /var/www/ai-dungeon/.git ]; then cd /var/www/ai-dungeon; git pull origin main; else cd /var/www; git clone https://github.com/EthanJ-Sss/AI-Dungeon.git ai-dungeon; fi; echo 'Code fetched'; cd /var/www/ai-dungeon/astrocade; npm install --legacy-peer-deps; echo 'Dependencies installed'; npm run build; echo 'Build complete'; echo 'server { listen 80; server_name 43.173.170.5; root /var/www/ai-dungeon/astrocade/dist; index index.html; gzip on; location / { try_files \$uri \$uri/ /index.html; } }' | sudo tee /etc/nginx/sites-available/ai-dungeon; sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/; sudo rm -f /etc/nginx/sites-enabled/default; sudo nginx -t; sudo systemctl restart nginx; sudo systemctl enable nginx; echo ''; echo '========================================'; echo 'Deployment Complete!'; echo '========================================'; echo 'Visit: http://43.173.170.5'"

if %errorlevel% equ 0 (
    echo.
    echo =========================================
    echo Deployment Successful!
    echo =========================================
    echo.
    echo Visit: http://43.173.170.5
    echo.
) else (
    echo.
    echo Deployment failed. Please check connection.
    echo.
)

echo WARNING: Change server password immediately!
echo.
pause


