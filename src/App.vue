<template>
  <div class="container">
    <div class="player" v-for="player of game.players" :key="player.id">
      <div class="player-info">
        <div class="player-name">
          <span> {{ player.name }} </span>
          <span v-if="game.landlordPlayer && player.id === game.landlordPlayer.id">(地主)</span>
        </div>

        <!-- 是否可以操作 -->
        <div v-show="game.activePlayer.id === player.id">
          <!-- 抢地主 -->
          <div v-show="!game.isLandlordReady">
            <button @click="game.fightForLandlord(player, true)">抢地主</button>
            <button @click="game.fightForLandlord(player, false)">不抢</button>
          </div>
          <!-- 出牌 -->
          <div class="btns" v-show="game.isLandlordReady">
            <button @click="game.putPokers">出牌</button>
            <button v-show="game.isSkipable" @click="game.skip">要不起</button>
          </div>
        </div>
      </div>
      <ul class="pokers">
        <li
          class="poker-item"
          v-for="poker of player.pokers"
          :key="poker.id"
          :class="{ selected: poker.selected }"
          @click="game.selectPoker(player, poker)"
        >
          {{ poker.label }}
        </li>
      </ul>
    </div>

    <div class="desktop player">
      <p>已出的牌</p>
      <ul class="pokers" v-if="game.lastPutRecord">
        <li class="poker-item" v-for="item of game.lastPutRecord.pokers" :key="item.id">
          {{ item.label }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useGame } from './GameMgr';
const game = useGame();
game.startGame();
</script>
<style lang="scss">
.container {
  .player {
    padding: 0;
    padding-bottom: 30px;
    border-bottom: 1px solid #eee;

    &:last-of-type {
      border: none;
    }

    .player-info {
      padding-bottom: 30px;

      .player-name {
        padding-bottom: 10px;
      }
    }

    .pokers {
      display: flex;
      margin: 0;
      padding: 0;

      .poker-item {
        cursor: pointer;
        width: 75px;
        height: 100px;
        box-sizing: border-box;
        border: 1px solid #c8c8c8;
        list-style: none;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        left: 0;
        bottom: 0;
        margin-right: 1px;

        &.selected {
          border-color: #f00;
          bottom: 15px;
        }
      }
    }
  }
}
</style>
