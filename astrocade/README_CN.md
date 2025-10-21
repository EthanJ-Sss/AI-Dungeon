# AstroCade 游戏开发项目

> Roguelike + 角色养成 Web游戏

## 🎮 项目介绍

这是一款类似暗黑地牢玩法的游戏，玩家需要招募合适的角色，组成小队挑战各种特殊地形的关卡。

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📦 技术栈

- **游戏引擎**: Phaser 3.60+
- **前端框架**: React 18 + TypeScript
- **样式方案**: TailwindCSS
- **状态管理**: Zustand
- **拖拽功能**: react-dnd
- **构建工具**: Vite 5

## 📂 项目结构

```
src/
├── components/      # React UI组件
│   ├── HomePage.tsx        # 主页
│   ├── RecruitPage.tsx     # 招募页面
│   └── FormationPage.tsx   # 阵型布置页面
├── store/           # Zustand状态管理
│   ├── playerStore.ts      # 玩家数据
│   └── gameStore.ts        # 游戏状态
├── config/          # 配置文件
│   ├── characters.json     # 角色配置
│   └── levels.json         # 关卡配置
├── types/           # TypeScript类型定义
│   └── index.ts
├── game/            # Phaser游戏逻辑（待开发）
├── assets/          # 资源文件
└── utils/           # 工具函数
```

## ✅ 当前进度

### Sprint 0 - 技术准备 ✅
- [x] 初始化Vite + React + TypeScript项目
- [x] 安装核心依赖（Phaser、Zustand、TailwindCSS、react-dnd）
- [x] 搭建项目目录结构
- [x] 配置Zustand状态管理
- [ ] 集成Phaser游戏引擎（进行中）

### Sprint 1 - MVP核心功能 🚧
- [x] 实现角色系统基础
- [x] 实现简化招募系统
- [x] 实现阵型布置系统（双方3×3网格 + 拖拽）
- [x] 实现主页和战斗UI
- [ ] 实现基础战斗系统（AI、攻击、胜负判定）

## 🎯 功能说明

### 已完成功能

#### 1. 主页 (HomePage)
- 显示当前招募的角色列表
- "招募英雄"按钮 - 进入招募界面
- "出发冒险"按钮 - 进入阵型布置界面
- 角色卡片显示（名称、职业、属性）

#### 2. 招募系统 (RecruitPage)
- 固定招募3个预设角色
- 角色详细信息展示（名称、职业、HP、攻击、移速、攻击方式）
- 角色自动添加到玩家角色列表
- 招募完成后自动返回主页

#### 3. 阵型布置系统 (FormationPage)
- **双方3×3网格布阵**
- **拖拽功能**（使用react-dnd实现）
  - 从角色列表拖拽角色到己方网格
  - 已放置的角色可以重新拖拽调整位置
  - 点击已放置的角色可以移除
- **敌方阵型实时预览**
  - 显示敌人位置和信息
  - 从关卡配置读取敌方数据
- 至少需要放置1个角色才能开始战斗

### 待开发功能

#### 4. 战斗系统（下一步）
- Phaser游戏场景集成
- 双方3×3网格战场
- 角色AI（战士、弓手、刺客）
- 近战/远程攻击系统
- 血条显示
- 胜负判定
- 30秒计时器

## 🎨 UI特色

- **现代化设计**: 使用TailwindCSS实现渐变背景和卡片设计
- **响应式布局**: 支持不同屏幕尺寸
- **交互反馈**: 按钮悬停效果、拖拽高亮
- **emoji图标**: 使用emoji表示不同职业（⚔️ 战士、🏹 弓手、🗡️ 刺客）

## 🔧 核心配置

### 角色配置 (characters.json)
```json
{
  "id": 1,
  "name": "战士艾登",
  "hp": 200,
  "damage": 20,
  "attackType": "melee",
  "moveSpeed": 2,
  "role": "warrior"
}
```

### 关卡配置 (levels.json)
```json
{
  "id": 1,
  "name": "平原测试",
  "scene": "plain",
  "enemies": [
    {"characterId": 1, "position": {"x": 0, "y": 0}}
  ]
}
```

## 📝 下一步开发计划

1. **集成Phaser游戏引擎**
   - 创建BattleScene战斗场景
   - 实现双方3×3网格渲染
   - 角色生成系统

2. **实现角色AI**
   - 战士/弓手AI（移动到最近敌人并攻击）
   - 刺客AI（跳后排后攻击）

3. **实现攻击系统**
   - 近战攻击（1格范围）
   - 远程攻击（5格范围，子弹飞行）

4. **实现战斗UI**
   - 血条显示
   - 计时器
   - 胜负判定界面

## 🐛 已知问题

- 战斗场景还未实现，点击"开始战斗"只显示占位页面

## 👥 开发团队

单人敏捷开发项目

## 📄 License

MIT



