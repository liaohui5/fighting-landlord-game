// 扑克牌花色: 黑红梅方王
export enum PokerType {
  BLACK,
  RED,
  FLOWER,
  BLOCK,
  KING,
}

// 扑克牌
export interface Poker {
  id: number;
  label: string; // 显示的字符(应该替换为 URL 图片地址)
  type: PokerType; // 类型
  value: number; // 牌对应的值
  selected: boolean; // 是否选中(准备出牌)
}

// 创建所有的扑克牌
export function initPokers() {
  const items: Poker[] = [];
  const cards = [
    { k: '3', v: 3 },
    { k: '4', v: 4 },
    { k: '5', v: 5 },
    { k: '6', v: 6 },
    { k: '7', v: 7 },
    { k: '8', v: 8 },
    { k: '9', v: 9 },
    { k: '10', v: 10 },
    { k: 'J', v: 11 },
    { k: 'Q', v: 12 },
    { k: 'K', v: 13 },
    { k: 'A', v: 14 },
    { k: '2', v: 16 }, // 为了让2不能用作连续的牌型中 JQKA2
  ];
  const types = [
    { v: PokerType.BLACK, label: '黑桃' },
    { v: PokerType.RED, label: '红桃' },
    { v: PokerType.FLOWER, label: '梅花' },
    { v: PokerType.BLOCK, label: '方块' },
  ];

  let id = 1;
  for (let i = 0, len = cards.length; i < len; i++) {
    const card = cards[i];
    for (let j = 0, tlen = types.length; j < tlen; j++) {
      const type = types[j];
      items.push({
        id,
        label: `${type.label} ${card.k}`,
        type: type.v,
        value: card.v,
        selected: false,
      });
      id++;
    }
  }

  // 初始化大王小王
  const kings = [
    {
      label: '小王',
      type: PokerType.KING,
      value: 17,
      selected: false,
      id: id++,
    },
    {
      label: '大王',
      type: PokerType.KING,
      value: 18,
      selected: false,
      id: id++,
    },
  ];
  for (let i = 0, len = kings.length; i < len; i++) {
    items.push(kings[i]);
  }
  return items;
}
