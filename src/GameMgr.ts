import { LinkedNode, RingLinkedList } from './LinkedList';
import Player from './Player';
import { Poker, initPokers } from './Poker';
import { PutRecordAbstract, RecordType, compareRecord, getPutPokerRecord } from './Record';
import { chunk } from './utils';
import { reactive } from 'vue';

class GameMgr {
  // 总共有多少个玩家
  public playerTotal: number = 3;

  // 总共有多少张地主牌(均分完剩下的)
  public landlordPokerTotal: number = 3;

  // 地主牌
  public landlordPokers: Poker[] = new Array(this.landlordPokerTotal);

  // 被指定为地主的玩家
  public landlordPlayer?: Player;

  // 地主是否已经分配了(抢过地主了)
  public isLandlordReady: boolean = false;

  // 抢地主的玩家 id
  public fightedPIds: number[] = [];

  // 抢地主的次数
  public operateTimes: number = 0;

  // 所有玩家(单向环形链表)
  public playerLinkedList = new RingLinkedList<Player>();

  // 所有扑克
  public pokers: Poker[] = [];

  // 最后一次出牌记录
  public lastPutRecord?: PutRecordAbstract;

  // 所有玩家(数组)
  public get players(): Player[] {
    const players: Player[] = [];
    this.playerLinkedList.each((node) => {
      players.push(node!.value);
    });
    return players;
  }

  // 是否可以跳过(第一次出牌|别人都不要&上一次是我出牌)
  public get isSkipable(): boolean {
    if (!this.lastPutRecord) {
      return false;
    }
    if (this.lastPutRecord.player.id === this.activePlayer.id) {
      return false;
    }
    return true;
  }

  // 初始化
  public init() {
    this.initPokers();
    this.initPlayers();
  }

  // 初始化扑克牌信息
  public initPokers() {
    this.pokers = initPokers();
  }

  // 初始化玩家信息
  public initPlayers(): void {
    const playersData = [
      {
        id: 1001,
        name: '王二狗',
      },
      {
        id: 1002,
        name: '周扒皮',
      },
      {
        id: 1003,
        name: '李三刀',
      },
    ];
    for (let i = 0, len = this.playerTotal; i < len; i++) {
      const { id, name } = playersData[i];
      const player = new Player(id, name);
      this.playerLinkedList.append(player);
    }
  }

  // 开始游戏
  public startGame() {
    this.init();
    this.shuffle();
    this.dividePoker();
    globalThis.gameMgr = this;
  }

  // 重新开始游戏
  public restartGame() {
    setTimeout(() => {
      alert('重新开始游戏');
      window.location.reload();
    }, 300);
  }

  // 洗牌
  public shuffle() {
    this.pokers.sort(() => Math.random() - 0.5);
  }

  // 发牌
  public dividePoker() {
    this.takeOutLandlordPokers();
    const chunks = chunk(this.pokers, this.pokers.length / this.playerTotal);
    this.playerLinkedList.each((node, index) => {
      node!.value.takePokers(chunks[index]);
    });
  }

  // 拿走地主的底牌
  public takeOutLandlordPokers() {
    for (let i = 0, len = this.landlordPokerTotal; i < len; i++) {
      this.landlordPokers[i] = this.pokers.pop()!;
    }
  }

  // 获取: 当前可以出牌的玩家, 默认是所有玩家的第一个
  private __currentPlayer?: Player;
  public get activePlayer(): Player {
    if (this.__currentPlayer) {
      return this.__currentPlayer;
    } else {
      return this.playerLinkedList.head!.value;
    }
  }

  // 设置当前可以出牌的玩家
  public set activePlayer(player: Player) {
    this.__currentPlayer = player;
  }

  // 抢地主
  public fightForLandlord(player: Player, isFight: boolean): void {
    if (this.isLandlordReady) {
      return;
    }
    this.operateTimes++; // 不管抢不抢地主, 操作次数加 1
    const playerId = player.id;
    const playerNode = this.findNodeByPId(playerId);
    const totalPlayers = this.playerLinkedList.length;

    isFight && this.fightedPIds.push(playerId);

    if (this.operateTimes < totalPlayers) {
      // 1.不足一轮, 不管抢还是不抢都需要让下一个玩家操作
      this.next(playerNode.next!.value, true);
    } else if (this.operateTimes === totalPlayers) {
      // 2.刚好一轮(所有人都操作了一次, 不管抢还是放弃)
      //   2.1. 如果没有人抢, 那么就重新开始
      //   2.2. 如果只有一个人抢, 那么这个抢的人就是地主
      //   2.3. 如果有多个人抢, 那么就开启第二轮
      const handlers = {
        0: this.restartGame,
        1: this.setLastToLandlord,
      };
      const handler = handlers[this.fightedPIds.length];
      if (typeof handler === 'function') {
        handler();
        return;
      }

      // 2.3 开启新的一轮(下一步时忽略第一轮没抢的人)
      let nextNode = playerNode.next!;
      while (true) {
        if (this.fightedPIds.includes(nextNode.value.id)) {
          break;
        }
        nextNode = nextNode.next!;
      }
      this.next(nextNode.value, true);
    } else {
      // 3. 第二轮(有多个人抢才会有第二轮)
      //   3.1. 如果这个玩家抢了两次(那么直接将地主分配给这个玩家)
      //   3.2. 如果这个玩家第二轮不抢(那么直接地主分配给上一轮最后一个抢的玩家)
      this.setLastToLandlord();
    }
  }

  // 将最后一个抢地主的 玩家ID(对应的玩家) 为设置地主 将地主牌给这个玩家
  public setLastToLandlord(): void {
    const pid = this.fightedPIds.pop();
    const player = this.findNodeByPId(pid!).value;
    this.activePlayer = player;
    this.landlordPlayer = player;
    this.isLandlordReady = true;
    this.landlordPlayer!.takePokers(this.landlordPokers, true);
  }

  // 下一步(出完一次牌轮到下一玩家出牌)
  public next(player: Player, isNextPlayer: boolean = false): void {
    if (isNextPlayer) {
      this.activePlayer = player;
      return;
    }
    const playerNode = this.findNodeByPId(player.id);
    this.activePlayer = playerNode.next!.value;
  }

  // 要不起(跳过并继续)
  public skip(): void {
    if (!this.isSkipable) {
      alert('你不能跳过本回合');
      return;
    }
    this.next(this.activePlayer);
  }

  // 根据玩家 ID 遍历所有玩家找到对应的节点
  public findNodeByPId(pid: number): LinkedNode<Player> {
    let node: LinkedNode<Player>;
    this.playerLinkedList.each((item) => {
      if (item.value.id === pid) {
        node = item;
        return false;
      }
    });
    return node!;
  }

  // 选牌
  public selectPoker(player: Player, poker: Poker) {
    if (player.id !== this.activePlayer.id) {
      return;
    }
    this.activePlayer.selectPoker(poker.id);
  }

  // 出牌
  public putPokers(): void {
    const selected = this.activePlayer.getSelectedPokers();
    if (selected.length === 0) {
      alert('请选择要出的牌');
      return;
    }

    const currPutRecord = getPutPokerRecord(this.activePlayer, selected);
    const prevPutRecord = this.lastPutRecord;
    if (currPutRecord.type === RecordType.INVALID) {
      alert('请按照规则出牌');
      return;
    }

    if (!this.lastPutRecord || this.lastPutRecord.player.id === this.activePlayer.id) {
      // 第一次出牌 && 最后记录出牌的人是我
      this.activePlayer.putPokers(selected);
      this.lastPutRecord = currPutRecord;
      if (this.activePlayer.isWin()) {
        this.restartGame();
      } else {
        this.next(this.activePlayer);
      }
      return;
    }

    if (!compareRecord(prevPutRecord!, currPutRecord)) {
      // 比牌的规则大小
      alert('请按照规则出牌');
      return;
    }

    this.activePlayer.putPokers(selected);
    this.lastPutRecord = currPutRecord;
    this.next(this.activePlayer);
  }
}

// useGame hooks
export const useGame = () => reactive(new GameMgr());
