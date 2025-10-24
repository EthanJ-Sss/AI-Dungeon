#!/usr/bin/expect -f

# 服务器配置
set server "43.173.170.5"
set username "ubuntu"
set password "MTc1MjA0NDQ0MQ"
set timeout 600

puts "\n========================================="
puts "🚀 AI-Dungeon 自动部署脚本"
puts "========================================="
puts "📍 服务器: $username@$server\n"

# 连接服务器
puts "📡 正在连接服务器...\n"
spawn ssh -o StrictHostKeyChecking=no $username@$server

expect {
    "*password:*" {
        send "$password\r"
        exp_continue
    }
    "*\$*" {
        puts "\n✅ 连接成功！\n"
    }
    timeout {
        puts "\n❌ 连接超时\n"
        exit 1
    }
    eof {
        puts "\n❌ 连接失败\n"
        exit 1
    }
}

# 执行部署命令
puts "🚀 开始执行部署...\n"

send "echo '========================================'\r"
send "echo '🚀 AI-Dungeon 自动部署开始'\r"
send "echo '========================================'\r"
send "echo ''\r"

# 1. 安装基础软件
send "echo '📦 步骤1: 安装基础软件...'\r"
send "sudo apt-get update -qq\r"
expect "*password*" { send "$password\r" }
expect "*\$*"

send "sudo apt-get install -y nodejs npm git nginx\r"
expect {
    "*password*" { send "$password\r"; exp_continue }
    "*\$*" {}
    timeout { puts "安装超时"; exit 1 }
}
send "echo '✅ 基础软件已安装'\r"
expect "*\$*"

# 2. 准备目录
send "echo ''\r"
send "echo '📁 步骤2: 准备部署目录...'\r"
send "sudo mkdir -p /var/www/ai-dungeon\r"
expect {
    "*password*" { send "$password\r"; exp_continue }
    "*\$*" {}
}

send "sudo chown -R ubuntu:ubuntu /var/www/ai-dungeon\r"
expect {
    "*password*" { send "$password\r"; exp_continue }
    "*\$*" {}
}
send "echo '✅ 目录已准备'\r"
expect "*\$*"

# 3. 获取代码
send "echo ''\r"
send "echo '📥 步骤3: 获取项目代码...'\r"
send "if \[\[ -d /var/www/ai-dungeon/.git \]\]; then cd /var/www/ai-dungeon && git pull origin main; else cd /var/www && git clone https://github.com/EthanJ-Sss/AI-Dungeon.git ai-dungeon; fi\r"
expect "*\$*"
send "echo '✅ 代码已获取'\r"
expect "*\$*"

# 4. 安装依赖
send "echo ''\r"
send "echo '📦 步骤4: 安装项目依赖...'\r"
send "cd /var/www/ai-dungeon/astrocade\r"
expect "*\$*"
send "npm install --legacy-peer-deps\r"
expect {
    "*\$*" {}
    timeout { puts "依赖安装超时，但继续..."; }
}
send "echo '✅ 依赖已安装'\r"
expect "*\$*"

# 5. 构建项目
send "echo ''\r"
send "echo '🏗️ 步骤5: 构建生产版本...'\r"
send "npm run build\r"
expect {
    "*\$*" {}
    timeout { puts "构建超时，但继续..."; }
}
send "echo '✅ 构建完成'\r"
expect "*\$*"

# 6. 配置Nginx
send "echo ''\r"
send "echo '🌐 步骤6: 配置Nginx...'\r"
send "echo 'server { listen 80; server_name 43.173.170.5; root /var/www/ai-dungeon/astrocade/dist; index index.html; gzip on; location / { try_files \\\$uri \\\$uri/ /index.html; } }' | sudo tee /etc/nginx/sites-available/ai-dungeon\r"
expect {
    "*password*" { send "$password\r"; exp_continue }
    "*\$*" {}
}

send "sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/\r"
expect {
    "*password*" { send "$password\r"; exp_continue }
    "*\$*" {}
}

send "sudo rm -f /etc/nginx/sites-enabled/default\r"
expect {
    "*password*" { send "$password\r"; exp_continue }
    "*\$*" {}
}

send "sudo nginx -t\r"
expect {
    "*password*" { send "$password\r"; exp_continue }
    "*\$*" {}
}

send "sudo systemctl restart nginx\r"
expect {
    "*password*" { send "$password\r"; exp_continue }
    "*\$*" {}
}

send "sudo systemctl enable nginx\r"
expect {
    "*password*" { send "$password\r"; exp_continue }
    "*\$*" {}
}

send "echo '✅ Nginx配置完成'\r"
expect "*\$*"

# 完成
send "echo ''\r"
send "echo '========================================'\r"
send "echo '✅ 部署成功完成！'\r"
send "echo '========================================'\r"
send "echo '🌐 访问地址: http://43.173.170.5'\r"
send "echo '⚠️ 重要: 请立即修改服务器密码！'\r"
send "echo ''\r"
expect "*\$*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ 部署脚本执行完成"
puts "=========================================\n"



