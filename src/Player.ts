import { Poker } from './Poker';

export default class Player {
  // 玩家ID
  public id: number;

  // 玩家名字
  public name: string;

  // 当前玩家所有的牌
  public pokers: Poker[] = [];

  // 初始化
  public constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  // 抓牌
  public takePokers(pokers: Poker[], isLanlordPokers: boolean = false): void {
    this.pokers = isLanlordPokers ? this.pokers.concat(pokers) : pokers;
    this.sortPokers();
  }

  // 理牌
  public sortPokers(): void {
    this.pokers.sort((a, b) => b.value - a.value);
  }

  // 选牌
  public selectPoker(pokerId: number): void {
    const poker = this.pokers.find((item) => item.id === pokerId)!;
    poker.selected = !poker.selected;
  }

  // 选中的牌
  public getSelectedPokers(): Poker[] {
    return this.pokers.filter((item) => item.selected);
  }

  // 出牌
  public putPokers(selected: Poker[]): void {
    this.pokers = this.pokers.filter((item) => !selected.includes(item));
  }

  // 是否赢得游戏
  public isWin(): boolean {
    return this.pokers.length === 0;
  }

  // 输了之后应该将牌全部丢掉
  public clearPokers() {
    this.pokers = [];
  }
}
