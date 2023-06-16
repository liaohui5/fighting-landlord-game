export interface LinkedNode<T> {
  value: T;
  next: LinkedNode<T> | null;
}

// 环形单链表
export class RingLinkedList<T> {
  head: LinkedNode<T> | null;
  tail: LinkedNode<T> | null;
  length: number = 0;

  // 创建节点
  public createNode<T>(value: T): LinkedNode<T> {
    return {
      value,
      next: null,
    };
  }

  // 遍历节点
  public each(handler: (item: LinkedNode<T>, index: number) => false | void): void {
    let item = this.head!;
    for (let i = 0, len = this.length; i < len; i++) {
      const result = handler(item, i);
      if (Object.is(result, false)) {
        break;
      }
      item = item!.next!;
    }
  }

  // 追加节点
  public append(value: T) {
    const node = this.createNode(value);
    if (this.length === 0) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail!.next = node;
      this.tail = node;
      node.next = this.head;
    }
    this.length++;
    return this;
  }
}
