import { Poker } from './Poker';

/**
 * Paging Arrays
 * @params {array} array
 * @params {number} size default 1
 * @return {Array<any[]>} result
 * @throw TypeError
 */
export function chunk(array: any[], size: number = 1): Array<any[]> {
  if (!Number.isSafeInteger(size)) {
    throw new TypeError("[chunk]'size' out of range");
  }

  const len = array.length;
  if (len === 0) {
    return [];
  }

  if (len <= size) {
    return [array];
  }

  const pages = Math.ceil(len / size);
  const result = new Array(pages);
  let i = 0;
  while (i < pages) {
    result[i] = array.slice(i * size, (i + 1) * size);
    i++;
  }
  return result;
}

// 多张扑克的值是否是一样的
export function isSamePokers(pokers: Poker[]): boolean {
  const firstPoker = pokers[0];
  return pokers.every((item) => item.value === firstPoker.value);
}

// 获取所有扑克的值
export function getPokersValue(pokers: Poker[]): number {
  let sumValue = 0;
  for (let i = 0, len = pokers.length; i < len; i++) {
    sumValue += pokers[i].value;
  }
  return sumValue;
}

// 是否是连续的牌
export function isContinuousPokers(pokers: Poker[], step: number = 1): boolean {
  const len = pokers.length;
  if (len < 2 || len < step) {
    return false;
  }
  const steps = Math.floor(len / step) - 1;
  for (let i = 0; i < steps; i++) {
    const current = pokers[i].value;
    const nextVal = pokers[i + step].value;
    if (current !== nextVal + 1) {
      return false;
    }
  }
  return true;
}

// 获取带牌结构的连续牌和被带的牌
export function isGroupWith(
  pokers: Poker[],
  group: number,
  checkPairs: boolean = false
): {
  is: boolean; // 是否是多带n的规则
  valuablePokers: Poker[]; // 需要计算值的牌
} {
  const len = pokers.length;
  const map = new Map<number, Poker[]>();

  // 根据值将牌分组
  for (let i = 0; i < len; i++) {
    const item = pokers[i];
    const elements = map.get(item.value);
    if (elements) {
      elements.push(item);
    } else {
      map.set(item.value, [item]);
    }
  }

  // 将连续组牌和被带牌分开
  const takesPokers: Poker[][] = [];
  const groupPokers: Poker[] = [];
  for (const value of map.values()) {
    if (value.length === group) {
      groupPokers.push(...value);
    } else {
      takesPokers.push(value);
    }
  }

  // 是否是为多组/一组
  let isGroup = false;
  if (groupPokers.length / group === 1) {
    isGroup = isSamePokers(groupPokers);
  } else {
    isGroup = isContinuousPokers(groupPokers, group);
  }

  // 不为一组/多组就直接失败
  const failResult = {
    is: false,
    valuablePokers: [],
  };
  if (!isGroup) {
    return failResult;
  }

  // 是否需要判断被带牌为对子
  if (!checkPairs) {
    return {
      is: true,
      valuablePokers: groupPokers,
    };
  }
  if (takesPokers.every((item) => item.length === 2)) {
    return {
      is: true,
      valuablePokers: groupPokers,
    };
  }

  return failResult;
}
