# AstroCade Web项目启动指南

> 🚀 快速开始Web版开发

---

## 📋 环境要求

### 必需软件
- **Node.js**: v18+ ([下载地址](https://nodejs.org/))
- **pnpm**: v8+ (推荐) 或 npm/yarn
- **Git**: 版本控制
- **VS Code**: 推荐IDE

### 安装pnpm
```bash
npm install -g pnpm
```

---

## 🎯 快速开始（5分钟）

### 1. 创建项目

```bash
# 使用Vite创建React + TypeScript项目
pnpm create vite astrocade --template react-ts

# 进入项目目录
cd astrocade

# 安装基础依赖
pnpm install
```

### 2. 安装核心依赖

```bash
# 游戏引擎
pnpm add phaser

# 状态管理
pnpm add zustand

# 拖拽功能
pnpm add react-dnd react-dnd-html5-backend

# 样式框架
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. 配置TailwindCSS

修改 `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

修改 `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. 配置TypeScript路径别名

修改 `tsconfig.json`:
```json
{
  "compilerOptions": {
    // ... 其他配置
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

修改 `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 5. 创建项目结构

```bash
# 创建目录结构
mkdir -p src/{game/{scenes,entities,systems},components/{Battle,Recruit,Train,Common},store,config,assets/{images,audio},utils,types}

# 创建基础文件
touch src/game/PhaserGame.tsx
touch src/game/scenes/BattleScene.ts
touch src/store/playerStore.ts
touch src/store/gameStore.ts
touch src/types/index.ts
```

### 6. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:5173`

---

## 📁 项目结构

```
astrocade/
├── public/                 # 静态资源
├── src/
│   ├── game/              # Phaser游戏逻辑
│   │   ├── PhaserGame.tsx      # Phaser容器组件
│   │   ├── scenes/             # 游戏场景
│   │   │   ├── BattleScene.ts  # 战斗场景
│   │   │   └── PreloadScene.ts # 预加载场景
│   │   ├── entities/           # 游戏实体
│   │   │   ├── Character.ts    # 角色类
│   │   │   └── Skill.ts        # 技能类
│   │   └── systems/            # 游戏系统
│   │       ├── AISystem.ts     # AI系统
│   │       └── BuffSystem.ts   # BUFF系统
│   ├── components/        # React UI组件
│   │   ├── Common/             # 通用组件
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Card.tsx
│   │   ├── Battle/             # 战斗UI
│   │   │   ├── FormationEditor.tsx  # 阵型编辑
│   │   │   └── BattleUI.tsx         # 战斗界面
│   │   ├── Recruit/            # 招募UI
│   │   │   └── RecruitPanel.tsx
│   │   └── Train/              # 养成UI
│   │       └── TrainPanel.tsx
│   ├── store/             # Zustand状态管理
│   │   ├── playerStore.ts      # 玩家数据（角色、俘虏）
│   │   └── gameStore.ts        # 游戏状态（关卡、战斗）
│   ├── config/            # 配置表JSON
│   │   ├── characters.json     # 角色配置
│   │   ├── skills.json         # 技能配置
│   │   ├── buffs.json          # BUFF配置
│   │   └── levels.json         # 关卡配置
│   ├── assets/            # 资源文件
│   │   ├── images/
│   │   └── audio/
│   ├── utils/             # 工具函数
│   │   ├── storage.ts          # LocalStorage封装
│   │   └── config.ts           # 配置加载
│   ├── types/             # TypeScript类型
│   │   └── index.ts
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 入口文件
│   └── index.css          # 全局样式
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🔧 核心代码模板

### 1. Phaser游戏容器 (`src/game/PhaserGame.tsx`)

```tsx
import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import BattleScene from './scenes/BattleScene'

const PhaserGame = () => {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-game',
      scene: [BattleScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: true
        }
      }
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return <div id="phaser-game" />
}

export default PhaserGame
```

### 2. 战斗场景 (`src/game/scenes/BattleScene.ts`)

```ts
import Phaser from 'phaser'

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
  }

  preload() {
    // 加载资源
  }

  create() {
    // 创建战场
    this.createBattlefield()
  }

  update(time: number, delta: number) {
    // 游戏主循环
  }

  private createBattlefield() {
    // 创建3×3网格
    const gridSize = 80
    const startX = 100
    const startY = 100

    // 绘制玩家方网格
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + col * gridSize
        const y = startY + row * gridSize
        this.add.rectangle(x, y, gridSize - 2, gridSize - 2, 0x00ff00, 0.2)
          .setStrokeStyle(2, 0x00ff00)
      }
    }

    // 绘制敌方网格
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + 400 + col * gridSize
        const y = startY + row * gridSize
        this.add.rectangle(x, y, gridSize - 2, gridSize - 2, 0xff0000, 0.2)
          .setStrokeStyle(2, 0xff0000)
      }
    }
  }
}
```

### 3. 玩家状态管理 (`src/store/playerStore.ts`)

```ts
import { create } from 'zustand'

interface Character {
  id: string
  name: string
  hp: number
  maxHp: number
  damage: number
  moveSpeed: number
  attackType: 'melee' | 'ranged'
  role: 'warrior' | 'archer' | 'assassin'
  skills: string[]
}

interface Prisoner {
  characterId: string
  name: string
  skills: string[]
}

interface PlayerStore {
  characters: Character[]
  prisoners: Prisoner[]
  addCharacter: (character: Character) => void
  removeCharacter: (id: string) => void
  addPrisoner: (prisoner: Prisoner) => void
  removePrisoner: (id: string) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  characters: [],
  prisoners: [],
  
  addCharacter: (character) =>
    set((state) => ({ characters: [...state.characters, character] })),
  
  removeCharacter: (id) =>
    set((state) => ({ 
      characters: state.characters.filter(c => c.id !== id) 
    })),
  
  addPrisoner: (prisoner) =>
    set((state) => ({ prisoners: [...state.prisoners, prisoner] })),
  
  removePrisoner: (id) =>
    set((state) => ({ 
      prisoners: state.prisoners.filter(p => p.characterId !== id) 
    }))
}))
```

### 4. 阵型编辑组件 (`src/components/Battle/FormationEditor.tsx`)

```tsx
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState } from 'react'

const FormationEditor = () => {
  const [formation, setFormation] = useState<Array<Array<string | null>>>(
    Array(3).fill(null).map(() => Array(3).fill(null))
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-8 p-8">
        {/* 玩家方网格 */}
        <div className="grid grid-cols-3 gap-2">
          {formation.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="w-20 h-20 border-2 border-green-500 bg-green-50 rounded flex items-center justify-center"
              >
                {cell || '空'}
              </div>
            ))
          )}
        </div>

        {/* 敌方网格（预览） */}
        <div className="grid grid-cols-3 gap-2">
          {Array(9).fill(null).map((_, index) => (
            <div
              key={index}
              className="w-20 h-20 border-2 border-red-500 bg-red-50 rounded"
            >
              敌人
            </div>
          ))}
        </div>
      </div>

      <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded">
        开始战斗
      </button>
    </DndProvider>
  )
}

export default FormationEditor
```

### 5. 类型定义 (`src/types/index.ts`)

```ts
export interface Character {
  id: string
  name: string
  hp: number
  maxHp: number
  damage: number
  moveSpeed: number
  attackType: 'melee' | 'ranged'
  role: 'warrior' | 'archer' | 'assassin' | 'healer'
  skills: Skill[]
  position?: { x: number; y: number }
}

export interface Skill {
  id: string
  name: string
  type: 'active' | 'passive'
  cd: number
  currentCd: number
  range: number
  damage: number
  effect: string
}

export interface Buff {
  id: string
  name: string
  type: 'buff' | 'debuff'
  duration: number
  tick: number
  attrType: 'hp' | 'damage' | 'moveSpeed'
  valueType: 'fixed' | 'percent'
  value: number
}

export interface Level {
  id: number
  name: string
  scene: 'plain' | 'volcano' | 'snow' | 'swamp'
  enemies: Array<{
    characterId: string
    position: { x: number; y: number }
  }>
  difficulty: number
}
```

---

## 🎮 开发流程

### Sprint 0：搭建基础（1-2天）
1. ✅ 创建项目并安装依赖
2. ✅ 配置TypeScript和TailwindCSS
3. ✅ 创建项目目录结构
4. ✅ 集成Phaser引擎
5. ✅ 创建基础Zustand Store
6. ✅ 测试热更新和构建

### Sprint 1：MVP开发（1-2周）
1. 创建3个预设角色配置
2. 实现简单招募界面
3. 实现阵型编辑界面（react-dnd）
4. 实现战斗场景（Phaser）
5. 实现基础AI和攻击系统
6. 完成第一次可玩版本

---

## 🔍 调试技巧

### Chrome DevTools
```
F12 打开开发者工具
- Console: 查看日志
- Network: 检查资源加载
- Application > Local Storage: 查看存档数据
```

### Phaser调试
```ts
// 在BattleScene中启用物理调试
physics: {
  arcade: {
    debug: true  // 显示碰撞框
  }
}
```

### Zustand调试
```bash
# 安装Redux DevTools扩展
pnpm add @redux-devtools/extension

# 在store中启用
import { devtools } from 'zustand/middleware'

export const usePlayerStore = create(
  devtools((set) => ({...}))
)
```

---

## 📦 构建与部署

### 开发构建
```bash
pnpm dev
```

### 生产构建
```bash
pnpm build

# 预览构建结果
pnpm preview
```

### 部署到Vercel（推荐）
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 部署到GitHub Pages
```bash
# 修改vite.config.ts
export default defineConfig({
  base: '/astrocade/',  // 仓库名
  // ...
})

# 构建
pnpm build

# 部署到gh-pages分支
git subtree push --prefix dist origin gh-pages
```

---

## 📚 参考资源

### 官方文档
- [Phaser 3 文档](https://photonstorm.github.io/phaser3-docs/)
- [React 文档](https://react.dev/)
- [Zustand 文档](https://docs.pmnd.rs/zustand/)
- [React DnD 文档](https://react-dnd.github.io/react-dnd/)
- [TailwindCSS 文档](https://tailwindcss.com/docs)

### 示例项目
- [Phaser + React 示例](https://github.com/phaserjs/template-react)
- [Phaser 3 示例集](https://phaser.io/examples)

---

## 🐛 常见问题

### 1. Phaser无法渲染
```ts
// 确保在组件挂载后初始化
useEffect(() => {
  // Phaser初始化代码
  return () => {
    // 清理
  }
}, [])  // 空依赖数组
```

### 2. 热更新后Phaser重复创建
```ts
// 使用useRef防止重复创建
const gameRef = useRef<Phaser.Game | null>(null)
if (gameRef.current) return
```

### 3. TypeScript类型错误
```bash
# 安装Phaser类型定义（通常自动包含）
pnpm add -D @types/node
```

### 4. 拖拽不工作
```tsx
// 确保包裹DndProvider
<DndProvider backend={HTML5Backend}>
  {/* 拖拽组件 */}
</DndProvider>
```

---

## ✅ 检查清单

### 环境配置完成
- [ ] Node.js已安装（v18+）
- [ ] pnpm已安装
- [ ] 项目已创建
- [ ] 依赖已安装
- [ ] TailwindCSS已配置
- [ ] TypeScript路径别名已配置
- [ ] 目录结构已创建

### 功能验证
- [ ] `pnpm dev` 启动成功
- [ ] 页面可以访问
- [ ] 热更新正常工作
- [ ] Phaser场景可以渲染
- [ ] Zustand状态可以更新
- [ ] TailwindCSS样式生效

---

**准备好了吗？开始编码吧！🚀**

有问题可以参考：
- 📖 开发计划.md
- ✅ TodoList.md
- 📝 FirstDesign.md


