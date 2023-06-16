import Player from './Player';
import { Poker, PokerType } from './Poker';
import { chunk, isContinuousPokers, isGroupWith, isSamePokers } from './utils';

// 出牌记录类型
/* prettier-ignore */
export enum RecordType {
  SINGLE /*             */ = '__PUT_POKER_SINGLE',             // 单牌
  PAIR /*               */ = '__PUT_POKER_PAIR',               // 对子
  THREESOME /*          */ = '__PUT_POKER_THREESOME',          // 3 个不带牌
  THREE_WITH_ONE /*     */ = '__PUT_POKER_THREE_WITH_TWO',     // 三带 1 个
  THREE_WITH_PAIR /*    */ = '__PUT_POKER_THREE_WITH_PAIR',    // 三带 1 对(2个)
  BOMB /*               */ = '__PUT_POKER_BOMB',               // 炸弹
  BOMB_WITH_TWO /*      */ = '__PUT_POKER_BOMB_WITH_TWO',      // 四带 2 个
  BOMB_WITH_TWO_PAIR /* */ = '__PUT_POKER_BOMB_WITH_TWO_PAIR', // 四带 2 对(4个)
  ROCKET /*             */ = '__PUT_POKER_ROCKET',             // 火箭(王炸)
  INVALID /*            */ = '__PUT_POKER_INVALID',            // 不符合出牌规则
}

// 出牌记录
/* prettier-ignore */
export interface PutPokerRecord {
  type: RecordType;        // 本次出牌的类型
  pokers: Poker[];         // 本次出牌所有的扑克
  totalPokers: number;     // 总共有多少张扑克
  valuablePokers: Poker[]; // 计算值的扑克(有的规则不需要比较所有的牌的大小)
  player: Player;          // 出牌的玩家
  isType: () => boolean;   // 是否是符合某个规则
  getValue: () => number;  // 获取牌的总值(比较牌大小的时候用的)
}

export abstract class PutRecordAbstract implements PutPokerRecord {
  public type: RecordType;
  public valuablePokers: Poker[];
  public pokers: Poker[];
  public totalPokers: number;
  public player: Player;

  public constructor(type: RecordType, player: Player, pokers: Poker[]) {
    this.type = type;
    this.player = player;
    this.pokers = pokers;
    this.totalPokers = pokers.length;
    this.valuablePokers = pokers;
  }

  // 获取值
  public getValue() {
    let sumValue = 0;
    for (let i = 0, len = this.valuablePokers.length; i < len; i++) {
      sumValue += this.valuablePokers[i].value;
    }
    return sumValue;
  }

  // 是否是这个出牌类型
  abstract isType(): boolean;
}

class SingleImpl extends PutRecordAbstract {
  public isType(): boolean {
    // 单牌
    if (this.totalPokers === 1) {
      return true;
    }
    // 顺子 必须 5 张以上
    if (this.totalPokers >= 5 && this.totalPokers % 5 === 0) {
      return isContinuousPokers(this.pokers);
    }
    return false;
  }
}

class PairImpl extends PutRecordAbstract {
  public isType(): boolean {
    // 对子
    if (this.totalPokers === 2) {
      return isSamePokers(this.pokers);
    }

    // 连对 必须 3 对以上
    if (this.totalPokers % 2 === 0 && this.totalPokers >= 6) {
      return isContinuousPokers(this.pokers, 2);
    }
    return false;
  }
}

class ThreeSomeImpl extends PutRecordAbstract {
  public isType(): boolean {
    // 3 个一样的牌不带其他牌(一组)
    if (this.totalPokers % 3 === 0 && this.totalPokers >= 6) {
      return chunk(this.pokers, 3).every((chunk) => isSamePokers(chunk));
    }
    return false;
  }
}

class BombImpl extends PutRecordAbstract {
  public isType(): boolean {
    // 炸弹
    if (this.totalPokers >= 4 && this.totalPokers % 4 === 0) {
      return chunk(this.pokers, 4).every((chunk) => isSamePokers(chunk));
    }
    return false;
  }
}

class ThreeWithOneImpl extends PutRecordAbstract {
  public isType(): boolean {
    // 三带一个
    if (this.totalPokers >= 4 && this.totalPokers % 4 === 0) {
      const { is, valuablePokers } = isGroupWith(this.pokers, 3);
      this.valuablePokers = valuablePokers;
      return is;
    }
    return false;
  }
}

class ThreeWithPairImpl extends PutRecordAbstract {
  public isType(): boolean {
    // 三带一对
    if (this.totalPokers >= 5 && this.totalPokers % 5 === 0) {
      const { is, valuablePokers } = isGroupWith(this.pokers, 3, true);
      this.valuablePokers = valuablePokers;
      return is;
    }
    return false;
  }
}

class BombWithTwoImpl extends PutRecordAbstract {
  // 四带2个
  public isType(): boolean {
    if (this.totalPokers >= 6 && this.totalPokers % 6 === 0) {
      const { is, valuablePokers } = isGroupWith(this.pokers, 4);
      this.valuablePokers = valuablePokers;
      return is;
    }
    return false;
  }
}

class BombWithTwoPairImpl extends PutRecordAbstract {
  // 四带两对
  public isType(): boolean {
    if (this.totalPokers >= 8 && this.totalPokers % 8 === 0) {
      const { is, valuablePokers } = isGroupWith(this.pokers, 4, true);
      this.valuablePokers = valuablePokers;
      return is;
    }
    return false;
  }
}

class RocketImpl extends PutRecordAbstract {
  // 火箭(王炸)
  public isType(): boolean {
    return this.totalPokers === 2 && this.pokers.every((item) => item.type === PokerType.KING);
  }
}

class InvalidImpl extends PutRecordAbstract {
  // 不符合任何规则
  public isType(): boolean {
    return true;
  }
}

// 创建规则的工厂
function recordFactory(type: RecordType, player: Player, pokers: Poker[]): PutPokerRecord {
  const factoryMap = {
    [RecordType.SINGLE]: SingleImpl,
    [RecordType.PAIR]: PairImpl,
    [RecordType.THREESOME]: ThreeSomeImpl,
    [RecordType.THREE_WITH_ONE]: ThreeWithOneImpl,
    [RecordType.THREE_WITH_PAIR]: ThreeWithPairImpl,
    [RecordType.BOMB_WITH_TWO]: BombWithTwoImpl,
    [RecordType.BOMB]: BombImpl,
    [RecordType.BOMB_WITH_TWO_PAIR]: BombWithTwoPairImpl,
    [RecordType.ROCKET]: RocketImpl,
    [RecordType.INVALID]: InvalidImpl,
  };
  const Factory = factoryMap[type];
  if (!Factory) {
    throw new TypeError('[recordFactory]unknown factory type');
  }
  return new Factory(type, player, pokers);
}

// 获取出牌记录
export function getPutPokerRecord(player: Player, pokers: Poker[]): PutPokerRecord {
  const allowRecordTypes = [
    RecordType.SINGLE,
    RecordType.PAIR,
    RecordType.THREESOME,
    RecordType.THREE_WITH_ONE,
    RecordType.THREE_WITH_PAIR,
    RecordType.BOMB,
    RecordType.BOMB_WITH_TWO,
    RecordType.BOMB_WITH_TWO_PAIR,
    RecordType.ROCKET,
  ];

  for (let i = 0, len = allowRecordTypes.length; i < len; i++) {
    const type = allowRecordTypes[i];
    const record = recordFactory(type, player, pokers);
    if (record.isType()) {
      return record;
    }
  }

  return recordFactory(RecordType.INVALID, player, []);
}

// 比较出牌记录的大小
export function compareRecord(prevRecord: PutPokerRecord, currRecord: PutPokerRecord): boolean {
  // 火箭
  if (prevRecord.type === RecordType.ROCKET) {
    return false;
  }
  if (currRecord.type === RecordType.ROCKET) {
    return true;
  }

  // 炸弹
  if (currRecord.type === RecordType.BOMB && prevRecord.type !== RecordType.BOMB) {
    return true;
  }

  // 规则相同(比较值)
  if (prevRecord.type === currRecord.type && prevRecord.totalPokers === currRecord.totalPokers) {
    return currRecord.getValue() > prevRecord.getValue();
  }

  // 规则不同也不是炸弹|火箭所以不能出牌
  return false;
}
