# 🔗 集成说明 - 使用新的简单 API

## 📝 概述

新的简单 API 系统已经创建完成，现在需要集成到前端。

有两种方式：

---

## ✅ 方式1: 直接替换（推荐 - 最简单）

直接用新的 Store 替换旧的：

### 步骤1: 备份旧文件（可选）
```bash
cd astrocade/src/store
copy ladderStore.ts ladderStore.old.ts
```

### 步骤2: 替换 Store
```bash
del ladderStore.ts
copy ladderStoreSimple.ts ladderStore.ts
```

### 步骤3: 更新 API 服务
由于新的 Store 使用了 `simpleLadderApi.ts`，这个文件已经创建好了。

### 步骤4: 测试
```bash
cd astrocade
npm run dev
```

---

## 🔄 方式2: 平滑过渡（更安全）

保留两个版本，可以随时切换：

### 当前文件结构
```
src/
  store/
    ladderStore.ts          # 旧版本（本地模拟）
    ladderStoreSimple.ts    # 新版本（支持在线）
  services/
    simpleLadderApi.ts      # 新 API 服务
```

### 切换方法
在需要使用新 Store 的组件中：

```typescript
// 从
import { useLadderStore } from '../store/ladderStore';

// 改为
import { useLadderStore } from '../store/ladderStoreSimple';
```

---

## 📊 API 对比

### 旧 Store (ladderStore.ts)
- ✅ 纯本地模拟
- ✅ 不需要后端
- ❌ 无法多人在线

### 新 Store (ladderStoreSimple.ts)
- ✅ 支持在线多人
- ✅ 自动降级到本地模式（后端不可用时）
- ✅ 真实数据持久化
- ✅ 使用自己的简单后端

---

## 🎯 推荐集成步骤（最简单）

### 1. 创建环境配置文件

```bash
cd astrocade
copy env-production-template.txt .env.production
```

编辑 `.env.production`，确保内容为：
```env
VITE_API_URL=http://43.173.170.5:3001/api
```

### 2. 直接替换 Store 文件

**Windows PowerShell:**
```powershell
cd astrocade\src\store
Remove-Item ladderStore.ts
Copy-Item ladderStoreSimple.ts ladderStore.ts
```

**或者手动操作:**
1. 删除 `astrocade/src/store/ladderStore.ts`
2. 复制 `astrocade/src/store/ladderStoreSimple.ts`
3. 将副本重命名为 `ladderStore.ts`

### 3. 测试本地开发

```bash
cd astrocade
🎮本地测试-立即开始.bat
```

这会同时启动后端和前端，你可以测试完整的在线功能。

### 4. 构建并部署

```bash
cd astrocade
📦一键构建并准备部署.bat
```

或使用自动化脚本：
```bash
python 🚀自动部署到服务器.py
```

---

## 🔍 Store API 兼容性

新的 `ladderStoreSimple` 保持了与旧版本相同的 API 接口：

### 相同的 Actions
- ✅ `initializeLadder()` - 初始化系统
- ✅ `selectOpponent()` - 选择对手
- ✅ `setShowChallengeModal()` - 显示确认弹窗
- ✅ `executeChallenge()` - 执行挑战
- ✅ `updateDefenseFormation()` - 更新防守阵容

### 新增的 Actions
- 🆕 `checkOrRegisterPlayer()` - 注册/登录玩家
- 🆕 `refreshLeaderboard()` - 刷新排行榜
- 🆕 `resetError()` - 重置错误

### 新增的 State
- 🆕 `isOnlineMode` - 是否在线模式
- 🆕 `error` - 错误信息
- 🆕 `isLoading` - 加载状态

---

## 🎮 用户体验变化

### 旧版本流程
1. 进入擂台 → 自动生成模拟数据
2. 设置防守阵容（仅本地保存）
3. 挑战对手（模拟战斗）

### 新版本流程
1. 进入擂台 → 检测后端（自动降级）
2. 首次进入 → 提示输入昵称注册
3. 设置防守阵容 → 同步到服务器
4. 挑战对手 → 真实战斗，实时更新排行榜

### 如果后端不可用
- ✅ 自动降级到本地模式
- ✅ 功能与旧版本完全相同
- ✅ 用户无感知切换

---

## 🛠️ 需要修改的组件（如果需要玩家注册 UI）

### LadderPage.tsx

在组件开始处添加玩家注册检测：

```typescript
import PlayerRegisterModal from './PlayerRegisterModal';

export default function LadderPage() {
  const { 
    leaderboard, 
    myLadderData, 
    isOnlineMode,
    initializeLadder,
    checkOrRegisterPlayer,
  } = useLadderStore();
  
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  useEffect(() => {
    initializeLadder();
    
    // 如果是在线模式且没有玩家数据，显示注册弹窗
    if (isOnlineMode && !myLadderData) {
      setShowRegisterModal(true);
    }
  }, [initializeLadder, isOnlineMode, myLadderData]);
  
  const handleRegister = async (playerName: string) => {
    try {
      await checkOrRegisterPlayer(playerName);
      setShowRegisterModal(false);
    } catch (error) {
      console.error('注册失败:', error);
    }
  };
  
  return (
    <div>
      {showRegisterModal && (
        <PlayerRegisterModal
          onRegister={handleRegister}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
      {/* 原有内容 */}
    </div>
  );
}
```

但实际上，新的 Store 设计了自动降级机制，即使不注册也能以本地模式使用，所以这一步是可选的。

---

## ✅ 立即测试

### 本地测试（无需服务器）

```bash
cd astrocade
🎮本地测试-立即开始.bat
```

会自动启动后端和前端，打开浏览器测试。

### 部署测试（需要服务器）

```bash
cd astrocade
python 🚀自动部署到服务器.py
```

自动部署到你的服务器。

---

## 🎉 完成！

现在你有一个完整的在线异步对战系统！

**下一步**: 运行 `🎮本地测试-立即开始.bat` 立即体验！


