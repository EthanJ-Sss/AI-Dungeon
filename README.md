# 🎮 AstroCade - 策略战斗游戏

<div align="center">

![Status](https://img.shields.io/badge/状态-Sprint%203%20完成-brightgreen)
![Version](https://img.shields.io/badge/版本-v1.0.0-blue)
![Tech](https://img.shields.io/badge/React-18.3.1-61dafb)
![Tech](https://img.shields.io/badge/Phaser-3.87.0-8a2be2)
![License](https://img.shields.io/badge/license-MIT-green)

一款基于 **React + Phaser 3** 的策略战斗与角色养成游戏

[🎯 快速开始](#快速开始) • [📖 游戏介绍](#游戏介绍) • [🛠️ 技术栈](#技术栈) • [📸 游戏截图](#游戏截图) • [🗺️ 开发计划](#开发计划)

</div>

---

## 📖 游戏介绍

**AstroCade** 是一款融合了 **策略布阵**、**即时战斗**、**角色养成** 的 2D 战斗游戏。玩家需要通过招募角色、学习技能、挑战关卡来不断强化自己的队伍。

### 🎯 核心玩法

```
🔹 招募英雄 → 🔹 学习技能 → 🔹 布置阵型 → 🔹 实战战斗 → 🔹 俘虏敌人 → 🔹 继续养成
```

### ✨ 主要特性

#### 🎮 战斗系统
- **即时战斗**：基于 Phaser 3 引擎的实时战斗
- **策略布阵**：3×3 战场，9 种布阵位置
- **技能系统**：16+ 主动技能，8+ 被动技能
- **Buff 系统**：11 种状态效果（减速、眩晕、护盾、加速等）
- **环境效果**：不同关卡有独特的环境 Buff（如森林减速、沼泽持续伤害）

#### 🌟 角色系统
- **20+ 可招募角色**：战士、射手、刺客、法师、治疗 5 大职业
- **角色升级**：经验值系统，最高 10 级
- **属性成长**：HP 和攻击力随等级提升
- **技能学习**：从俘虏处学习新技能（最多 3 个）

#### 🗺️ 关卡系统
- **10 个关卡**：3 大环境（平原、森林、沼泽）+ Boss 战
- **难度递进**：从简单到极难，循序渐进
- **解锁机制**：通关后解锁下一关
- **Boss 挑战**：暗影领主终极战

#### 🎓 养成系统
- **俘虏机制**：战斗胜利后可选择俘虏一名敌人
- **技能训练**：从俘虏处学习技能并替换现有技能
- **角色替换**：队伍满员时可选择替换角色
- **统计追踪**：战斗次数、招募次数、技能学习次数

---

## 🚀 快速开始

### 📋 前置要求

- **Node.js**: v16.0.0 或更高版本
- **npm**: v7.0.0 或更高版本

### 💻 安装与运行

#### 方式一：一键启动（推荐）

**Windows 用户：**
```bash
# 双击运行
一键启动游戏.bat
```

**其他系统：**
```bash
# 1. 进入项目目录
cd astrocade

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

#### 方式二：手动启动

```bash
# 1. 克隆仓库
git clone https://github.com/EthanJ-Sss/AI-Dungeon.git
cd AI-Dungeon/astrocade

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# http://localhost:5173
```

### 🏗️ 构建生产版本

```bash
cd astrocade
npm run build
```

构建产物位于 `astrocade/dist/` 目录。

---

## 🎨 游戏截图

### 🏠 主界面
- 角色列表展示
- 技能信息查看
- 等级和经验条显示

### ⚔️ 战斗场景
- 7×9 网格战场
- 实时技能释放特效
- HP 条和伤害数字
- 环境特效

### 📚 训练界面
- 俘虏列表
- 技能学习动画
- 技能替换确认

---

## 🛠️ 技术栈

### 前端框架
- **React 18.3.1** - UI 框架
- **TypeScript 5.6.2** - 类型安全
- **Vite 6.0.1** - 构建工具
- **TailwindCSS 3.4.17** - 样式框架

### 游戏引擎
- **Phaser 3.87.0** - 2D 游戏引擎
- 实时战斗场景渲染
- 物理引擎支持
- 粒子特效系统

### 状态管理
- **Zustand 5.0.2** - 轻量级状态管理
- **persist 中间件** - LocalStorage 持久化

### 开发工具
- **ESLint** - 代码规范
- **PostCSS** - CSS 处理

---

## 📂 项目结构

```
circletest/
├── astrocade/                      # 💻 源代码目录
│   ├── src/
│   │   ├── components/            # React 组件
│   │   │   ├── HomePage.tsx       # 主页
│   │   │   ├── RecruitPage.tsx    # 招募页
│   │   │   ├── TrainPage.tsx      # 训练页
│   │   │   ├── LevelSelectPage.tsx # 关卡选择
│   │   │   ├── FormationPage.tsx  # 布阵页
│   │   │   └── ...                # 其他组件
│   │   ├── game/                  # Phaser 游戏逻辑
│   │   │   ├── scenes/
│   │   │   │   └── BattleScene.ts # 战斗场景
│   │   │   ├── SkillManager.ts    # 技能管理器
│   │   │   ├── BuffManager.ts     # Buff 管理器
│   │   │   └── PassiveSkillManager.ts # 被动技能管理
│   │   ├── store/                 # Zustand 状态管理
│   │   │   ├── gameStore.ts       # 游戏状态
│   │   │   └── playerStore.ts     # 玩家状态
│   │   ├── config/                # 游戏配置
│   │   │   ├── characters/        # 角色配置
│   │   │   ├── skills/            # 技能配置
│   │   │   ├── levels.json        # 关卡配置
│   │   │   ├── buffs.json         # Buff 配置
│   │   │   └── ...
│   │   ├── types/                 # TypeScript 类型定义
│   │   └── utils/                 # 工具函数
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                          # 📚 文档中心
│   ├── design/                    # 设计文档
│   ├── development/               # 开发文档
│   ├── completed/                 # 已完成功能文档
│   ├── testing/                   # 测试文档
│   ├── guides/                    # 使用指南
│   ├── archive/                   # 归档文档
│   └── 📚文档索引.md               # 文档导航
│
├── scripts/                       # 🔧 脚本工具
│   ├── deploy/                    # 部署脚本
│   ├── dev/                       # 开发脚本
│   └── maintenance/               # 维护脚本
│       └── 整理项目目录.ps1       # 目录整理工具
│
├── .cursor/                       # Cursor 配置
│   └── rules/                     # Cursor 规则
│
├── 📋项目目录管理规范.md           # 目录管理规范
└── README.md                      # 本文件（项目主文档）
```

### 📚 文档说明

所有文档已按类型整理到 `docs/` 目录：

- **[docs/📚文档索引.md](docs/📚文档索引.md)** - 完整文档导航
- **[docs/design/](docs/design/)** - 系统设计、功能设计
- **[docs/development/](docs/development/)** - 开发计划、进度追踪
- **[docs/completed/](docs/completed/)** - 已完成功能总结
- **[docs/testing/](docs/testing/)** - 测试指南、测试用例
- **[docs/guides/](docs/guides/)** - 使用指南、快速入门

### 🔧 脚本工具

所有脚本已整理到 `scripts/` 目录：

- **[scripts/dev/](scripts/dev/)** - 开发相关脚本（启动、构建等）
- **[scripts/deploy/](scripts/deploy/)** - 部署脚本
- **[scripts/maintenance/](scripts/maintenance/)** - 维护工具

**目录整理工具**: 运行 `scripts/maintenance/整理项目目录.ps1` 可自动整理项目结构。

### 📋 目录规范

查看 [📋项目目录管理规范.md](📋项目目录管理规范.md) 了解：
- 文件命名规范
- 文档分类规则
- 目录维护指南

---

## 🎯 游戏指南

### 新手教程

#### 1️⃣ 招募角色
- 进入"招募"页面
- 查看角色属性和技能
- 点击"确认招募"或"重新刷新"
- 建议先招募 2-3 个角色

#### 2️⃣ 挑战关卡
- 进入"挑战关卡"页面
- 选择已解锁的关卡
- 查看关卡难度和环境效果
- 进入布阵页面

#### 3️⃣ 布置阵型
- 在 3×3 网格中拖放角色
- 建议配置：前排坦克 + 中排输出 + 后排治疗
- 点击"开始战斗"

#### 4️⃣ 战斗操作
- 战斗自动进行
- 技能自动释放（冷却中）
- 观察 HP 条和技能图标
- 30-60 秒内分出胜负

#### 5️⃣ 战后奖励
- 战斗胜利后选择一名敌人俘虏
- 获得经验值和金币
- 自动解锁下一关

#### 6️⃣ 技能训练
- 进入"训练"页面
- 选择一个角色和一个俘虏
- 选择要学习的技能
- 确认替换技能（最多 3 个）

### 战斗技巧

#### 🛡️ 阵型推荐
- **攻守平衡**：1 坦克 + 1 输出 + 1 治疗
- **速攻流**：2 输出 + 1 刺客
- **持久战**：1 坦克 + 2 治疗

#### ⚔️ 职业克制
- **战士**：高血量，近战输出
- **射手**：远程攻击，灵活走位
- **刺客**：高爆发，瞬间击杀
- **法师**：AOE 伤害，控场能力
- **治疗**：回复友军，持续作战

#### 🌍 环境应对
- **平原**：无特殊效果，标准战斗
- **森林**：冰冻效果，减速 30%
- **沼泽**：持续伤害+减速，需要治疗
- **暗影**：Boss 战，高难度挑战

---

## 🗺️ 开发计划

### ✅ 已完成（Sprint 1-3）

- [x] **Sprint 1**：基础战斗系统
  - [x] React + Phaser 集成
  - [x] 角色招募功能
  - [x] 阵型布置
  - [x] 战斗场景基础逻辑

- [x] **Sprint 2**：技能与战斗系统
  - [x] 技能系统（16 个主动技能）
  - [x] Buff 系统（11 种状态）
  - [x] 被动技能（8 个）
  - [x] 关卡系统（9 个关卡）
  - [x] 环境效果

- [x] **Sprint 3**：养成与 Boss 系统
  - [x] 俘虏机制
  - [x] 技能训练系统
  - [x] 角色升级系统（1-10 级）
  - [x] Boss 战（暗影领主）
  - [x] 游戏统计
  - [x] 新手教程

### 🔜 计划中（Sprint 4+）

- [ ] **火山主题关卡**（设计中）
  - [ ] 5 个火山子关卡
  - [ ] 燃烧环境效果
  - [ ] 岩浆喷发机制
  - [ ] 元素克制系统
  - [ ] 火山 Boss：炎魔之王

- [ ] **音效与音乐**
  - [ ] 背景音乐
  - [ ] 技能音效
  - [ ] UI 音效

- [ ] **UI/UX 优化**
  - [ ] 动画优化
  - [ ] 教程完善
  - [ ] 多语言支持

---

## 📊 游戏数据

### 角色数量
- **可招募角色**：20 个
- **职业类型**：5 种（战士、射手、刺客、法师、治疗）
- **最大队伍人数**：6 人

### 技能系统
- **主动技能**：16 个
- **被动技能**：8 个
- **每角色技能槽**：最多 3 个主动技能

### 关卡系统
- **普通关卡**：9 个
- **Boss 关卡**：1 个
- **环境类型**：4 种（平原、森林、沼泽、暗影）

### Buff 类型
- **控制类**：减速、眩晕、定身
- **增益类**：加速、护盾、攻击提升
- **持续伤害**：燃烧、流血、毒

---

## 🐛 已知问题与修复

所有已知 Bug 均已修复，详见：
- [Bug 修复记录](docs/completed/Bug修复记录.md)
- [✅Bug修复总结.md](docs/completed/✅Bug修复总结.md)

---

## 📂 项目目录管理

本项目使用规范化的目录结构管理文档和脚本。

### 目录结构

```
📁 circletest/
├── 🔧一键整理项目目录.bat   ← 一键整理工具
├── README.md
├── astrocade/                ← 游戏源码
├── docs/                     ← 📚 所有文档
│   ├── completed/            ← ✅ 已完成功能总结
│   ├── testing/              ← 🎯 测试指南
│   ├── guides/               ← ⭐ 使用指南
│   ├── design/               ← 📊 设计文档
│   └── development/          ← 📝 开发文档
└── scripts/                  ← 🔧 所有脚本
    ├── deploy/               ← 部署脚本
    ├── dev/                  ← 开发脚本
    └── maintenance/          ← 维护脚本
```

### 🔧 一键整理工具

如果根目录出现文档混乱，运行：

```bash
# 双击根目录的批处理文件
🔧一键整理项目目录.bat

# 或在终端运行
.\🔧一键整理项目目录.bat
```

**功能：**
- ✅ 自动识别文件类型
- ✅ 移动到正确目录
- ✅ 安全可靠，可重复运行

**详细说明：** 查看 [📋项目目录管理规范](docs/design/📋项目目录管理规范.md)

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

**注意：** 请遵循[目录管理规范](docs/design/📋项目目录管理规范.md)，在正确位置创建文档。

---

## 📝 更新日志

### v1.0.0 (2024-10)
- ✨ 完成 Sprint 1-3 所有功能
- 🎮 完整的战斗系统
- 🌟 角色养成系统
- 🗺️ 10 个关卡 + Boss 战
- 📚 技能训练系统
- 🎯 新手教程

详细更新日志见 [更新日志.md](docs/guides/更新日志.md)

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📧 联系方式

- **GitHub**: [EthanJ-Sss](https://github.com/EthanJ-Sss)
- **项目地址**: [AI-Dungeon](https://github.com/EthanJ-Sss/AI-Dungeon)

---

## 🙏 致谢

- [React](https://react.dev/) - UI 框架
- [Phaser 3](https://phaser.io/) - 游戏引擎
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [TailwindCSS](https://tailwindcss.com/) - 样式框架
- [Vite](https://vitejs.dev/) - 构建工具

---

<div align="center">

**⭐ 如果觉得这个项目不错，请给个 Star！⭐**

Made with ❤️ by [EthanJ-Sss](https://github.com/EthanJ-Sss)

</div>

