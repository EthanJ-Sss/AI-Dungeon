#!/usr/bin/env python3
"""
自动部署脚本 - 上传到服务器
"""

import os
import sys
import subprocess

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def main():
    print_header("🚀 开始部署到服务器")
    
    # 服务器配置
    server_ip = "43.173.170.5"
    server_user = "root"
    server_path = "/var/www/html/"
    
    print(f"服务器: {server_user}@{server_ip}")
    print(f"目标路径: {server_path}")
    print()
    
    # 检查dist目录
    dist_path = os.path.join(os.path.dirname(__file__), 'dist')
    if not os.path.exists(dist_path):
        print("❌ 错误: dist 目录不存在")
        print("请先运行: npm run build")
        sys.exit(1)
    
    print("✅ 找到 dist 目录")
    
    # 显示将要上传的文件
    files = os.listdir(dist_path)
    print(f"\n📁 将要上传 {len(files)} 个文件:")
    for f in files[:5]:
        print(f"   - {f}")
    if len(files) > 5:
        print(f"   ... 还有 {len(files) - 5} 个文件")
    
    print("\n" + "="*60)
    print("💡 部署方法：")
    print("="*60)
    
    print("\n【方法1】使用 SCP 命令（推荐）")
    print(f"   scp -r dist/* {server_user}@{server_ip}:{server_path}")
    
    print("\n【方法2】使用 rsync（更快）")
    print(f"   rsync -avz --progress dist/ {server_user}@{server_ip}:{server_path}")
    
    print("\n【方法3】使用 FTP 工具")
    print("   - 工具: WinSCP 或 FileZilla")
    print(f"   - 服务器: {server_ip}")
    print(f"   - 用户: {server_user}")
    print(f"   - 目标: {server_path}")
    
    print("\n" + "="*60)
    print("📝 手动上传步骤：")
    print("="*60)
    print(f"\n1. 打开 FTP 工具连接到 {server_ip}")
    print("2. 登录（使用 root 用户）")
    print(f"3. 进入目标目录: {server_path}")
    print(f"4. 上传 {dist_path} 中的所有文件")
    print("5. 完成！")
    
    print("\n" + "="*60)
    print("🎮 部署后测试")
    print("="*60)
    print(f"\n访问: http://{server_ip}:8080/")
    print("\n测试步骤:")
    print("1. 进入擂台竞技")
    print("2. 输入昵称注册")
    print("3. 设置防守阵容")
    print("4. 挑战敌人")
    print("5. 开始游戏！🎉")
    
    print("\n" + "="*60)
    print("✅ 部署说明已完成")
    print("="*60)
    print("\n💡 提示: 由于需要SSH密钥或密码，请手动执行上述命令")
    print("    或使用FTP工具上传文件")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ 已取消")
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()

