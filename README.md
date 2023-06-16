## 最简单机斗地主实现

### 快速开始

```sh
git clone https://github.com/liaohui5/fighting-landlord-game-demo
cd fighting-landlord-game-demo
pnpm i
pnpm run dev
# open browser and visit http://localhost:8080
```

### 预览

![image](https://github.com/liaohui5/dotfiles/assets/29266093/ff831f90-579b-4068-a459-29a6ac614bdd)

### 功能

- [x] 抢地主
- [x] 发牌/洗牌
- [x] 出牌
  - [x] 获取出牌的规则(单个/顺子/一对/连队/三带一个/三带一对等等)
  - [x] 比牌(比较出牌大小)

### Q & A

> 为什么不纯原生 JS 来实现?

DOM 渲染更新与数据同步比较麻烦, 不是实现斗地主逻辑的重点

在这个项目中, 核心逻辑并没有使用 vue 的 reactivity API,

只是写完最后用 reactive 给 GameMgr 对象做了一层包装,

这样就能保证 gameMgr 总数据改动后, 能够驱动试图改变

> 为什么不做 websocket, 多人联机版本

一步一步来, 先明白最简单的逻辑实现
