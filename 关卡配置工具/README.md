# 🎮 关卡配置工具包

**AI Dungeon Level Configuration Tools**

一套完整的关卡配置解决方案，让你轻松配置游戏关卡的敌人、位置、环境参数。

---

## 📦 工具列表

### 1. 🌐 可视化配置器 - `level_config_editor.html`
**最推荐！** 零代码，可视化界面，直接在浏览器中配置。

**特点**:
- ✅ 拖拽式操作
- ✅ 实时预览统计
- ✅ 一键生成JSON
- ✅ 无需安装，直接打开

**使用**:
```bash
# 双击打开文件，或用浏览器打开
level_config_editor.html
```

---

### 2. 🐍 Python配置脚本 - `quick_config.py`
代码化配置，支持批量操作和自动化。

**特点**:
- ✅ 批量生成关卡
- ✅ 代码版本控制
- ✅ 自动化配置
- ✅ 交互式向导

**使用**:
```bash
# 运行脚本
python quick_config.py

# 或直接在代码中使用
from quick_config import LevelBuilder
```

---

### 3. 📖 配置指南 - `配置模板与使用指南.md`
详细的配置文档和示例。

**内容包括**:
- 配置模板
- 快速示例
- 字段说明
- 常见问题
- 最佳实践

---

## 🚀 快速开始

### 5分钟快速配置一个新关卡

#### 方式1: 使用可视化编辑器（最简单）

1. **打开编辑器**
   ```bash
   双击 level_config_editor.html
   ```

2. **选择关卡**
   - 左侧点击要编辑的关卡
   - 或点击"➕ 新增关卡"

3. **配置基础信息**
   - 关卡名称：`火山深渊`
   - 难度：选择 `困难`
   - 时长：`65秒`
   - 环境燃烧：`18/秒`

4. **添加敌人**
   - 点击"➕ 添加敌人"
   - 选择"熔岩巨兽"
   - 设置位置 (1, 0)
   - 重复添加其他敌人

5. **生成配置**
   - 点击"📄 生成配置文件"
   - 点击"📋 复制到剪贴板"

6. **应用配置**
   - 打开 `astrocade/src/config/levels.json`
   - 粘贴替换内容
   - 完成！

---

#### 方式2: 使用Python脚本（快速批量）

1. **编写配置代码**
   ```python
   from quick_config import LevelBuilder
   
   # 创建新关卡
   level6 = (LevelBuilder(6)
       .set_name("火山深渊")
       .set_description("深入火山核心...")
       .set_difficulty("困难")
       .set_duration(65)
       .set_burn_damage(18)
       .add_enemy("熔岩巨兽", 1, 0)
       .add_enemy("火焰法师", 0, 1)
       .add_enemy("火焰法师", 2, 1)
       .build()
   )
   
   # 保存
   import json
   with open('level_6.json', 'w', encoding='utf-8') as f:
       json.dump(level6, f, indent=2, ensure_ascii=False)
   ```

2. **运行脚本**
   ```bash
   python your_config.py
   ```

3. **应用配置**
   - 复制生成的JSON到 `levels.json`

---

## 📋 使用示例

### 示例1: 修改环境伤害

**需求**: 将第3关的环境伤害从12改为10

**方法A - 可视化编辑器**:
```
1. 打开 level_config_editor.html
2. 点击"第3关"
3. 修改"环境燃烧" → 10
4. 点击"生成配置文件"
5. 复制JSON
```

**方法B - Python代码**:
```python
from quick_config import create_level_3

level3 = create_level_3()
level3['burnDamage'] = 10

import json
print(json.dumps(level3, indent=2, ensure_ascii=False))
```

---

### 示例2: 添加新敌人

**需求**: 在第2关添加一个火焰法师

**可视化编辑器**:
```
1. 选择第2关
2. 点击"➕ 添加敌人"
3. 选择"火焰法师"
4. 设置位置 (1, 2)
5. 生成配置
```

**Python代码**:
```python
from quick_config import create_level_2

level2 = create_level_2()
level2['enemies'].append({
    "characterId": "monster_fire_mage",
    "position": {"x": 1, "y": 2}
})
```

---

### 示例3: 批量调整难度

**需求**: 所有关卡的环境伤害都+2

**Python代码**:
```python
from quick_config import generate_levels
import json

levels = generate_levels()

# 批量修改
for level in levels:
    level['burnDamage'] += 2

# 保存
with open('levels_hard.json', 'w', encoding='utf-8') as f:
    json.dump(levels, f, indent=2, ensure_ascii=False)
```

---

## 🎯 完整工作流程

```
┌─────────────────┐
│ 1. 配置关卡     │
│   使用工具配置   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. 生成JSON     │
│   导出配置文件   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. 应用配置     │
│   替换levels.json│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. 构建项目     │
│   npm run build │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. 测试验证     │
│   本地或部署测试 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. 部署上线     │
│   同步到服务器   │
└─────────────────┘
```

---

## 📚 文档结构

```
关卡配置工具/
├── level_config_editor.html     # 可视化配置器（HTML）
├── quick_config.py              # Python配置脚本
├── 配置模板与使用指南.md          # 详细指南
└── README.md                    # 本文档
```

---

## 🎨 可用怪物速查

| 怪物 | ID | HP | 伤害 | 特点 |
|-----|-----|-----|------|------|
| 训练假人·攻击型 | `monster_training_dummy_attack` | 160 | 16 | 教学用 |
| 训练假人·防御型 | `monster_training_dummy_defense` | 200 | 12 | 有护盾 |
| 训练假人·突袭型 | `monster_training_dummy_control` | 170 | 14 | 有控制 |
| 熔岩巨兽 | `monster_magma_brute` | 520 | 30 | 高血坦克 |
| 火焰哨兵 | `monster_flame_sentinel` | 300 | 38 | 远程输出 |
| 火山投石手 | `monster_rock_thrower_001` | 260 | 32 | 远程输出 |
| 烈焰卫士 | `monster_fire_tank` | 500 | 28 | 肉盾 |
| 火焰祭司 | `monster_fire_healer` | 320 | 25 | 治疗 ⚠️ |
| 火焰法师 | `monster_fire_mage` | 300 | 42 | AOE法师 |
| 烈焰冲锋者 | `monster_fire_charger_001` | 360 | 38 | 快速突袭 |
| Boss火山领主 | `boss_volcano_lord` | 950 | 48 | Boss |

---

## 💡 配置技巧

### 难度递增建议
```
第1关: 环境3, 总HP 500-600
第2关: 环境8, 总HP 1000-1200
第3关: 环境12, 总HP 1100-1300
第4关: 环境15, 总HP 1000-1200
第5关: 环境15, 总HP 900-1000 (Boss)
```

### 敌人组合模式
```
教学关: 3个不同类型怪物
普通关: 1坦克 + 2输出
困难关: 1坦克 + 1治疗 + 1法师
Boss关: 单个强力Boss
```

### 位置布局
```
前排型: 坦克在前，输出在后
分散型: 敌人分散3个位置
集火型: 敌人集中在后排
```

---

## ⚠️ 注意事项

### 配置前检查
- ✅ 关卡ID不重复
- ✅ 第1关必须 `unlocked: true`
- ✅ 环境伤害不要过高
- ✅ 敌人位置在0-2范围内

### 配置后验证
- ✅ JSON格式正确
- ✅ 怪物ID存在于 `monsters.json`
- ✅ 难度递增合理
- ✅ 本地测试通过

---

## 🔧 故障排除

### Q: 生成的JSON格式错误
**A**: 使用在线JSON验证器检查格式，或使用Python的 `json.loads()` 验证

### Q: 游戏中敌人不显示
**A**: 检查怪物ID是否正确，确保在 `monsters.json` 中定义

### Q: 环境伤害太高/太低
**A**: 参考难度建议表，或查看 `📋5关关卡完整配置-敌人属性与环境.md`

### Q: 如何添加更多关卡
**A**: 
```python
# Python方式
level6 = LevelBuilder(6).set_name("新关卡")...build()

# 或在HTML编辑器中点击"➕ 新增关卡"
```

---

## 📞 获取帮助

- 📖 查看 `配置模板与使用指南.md` 获取详细说明
- 📋 查看 `📋5关关卡完整配置-敌人属性与环境.md` 了解当前配置
- 💬 查看其他优化文档了解最佳实践

---

## 🎯 推荐使用方式

| 场景 | 推荐工具 | 理由 |
|-----|---------|------|
| 快速修改单个关卡 | 可视化编辑器 | 直观方便 |
| 批量调整数值 | Python脚本 | 自动化 |
| 新增多个关卡 | Python脚本 | 代码可复用 |
| 学习配置结构 | 可视化编辑器 | 可视化反馈 |
| 版本控制 | Python脚本 | 易于管理 |
| 测试不同方案 | 可视化编辑器 | 快速迭代 |

---

## ✨ 功能特色

### 可视化编辑器
- 🎨 美观的UI界面
- 📊 实时统计数据（总HP、敌人数、环境伤害）
- 🔄 一键生成/复制JSON
- 💾 支持导入现有配置
- 🗑️ 一键重置关卡

### Python脚本
- 🔧 链式调用API
- 📦 批量生成配置
- 🤖 交互式向导
- 📋 怪物列表查询
- 💻 命令行友好

---

**开始配置你的关卡吧！** 🎮✨

**提示**: 新手建议从可视化编辑器开始，熟悉后可以尝试Python脚本进行更高级的配置。


