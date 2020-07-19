const { 
  getHandRank,
  toCents,
  toDollars,
  makeFreqMap,
  NUM_CARDS_IN_DECK,
  RANKS,
} = require('./utils');
const { PokerGame } = require('./PokerGame');
const { Player } = require('./Player');


test('RANKS has the right values', () => {
  expect(RANKS.straightFlush).toBe(8);
  expect(RANKS.fourOfAKind).toBe(7);
  expect(RANKS.fullHouse).toBe(6);
  expect(RANKS.flush).toBe(5);
  expect(RANKS.straight).toBe(4);
  expect(RANKS.threeOfAKind).toBe(3);
  expect(RANKS.twoPair).toBe(2);
  expect(RANKS.pair).toBe(1);
  expect(RANKS.highCard).toBe(0);
});

test('toDollars divides by 100', () => {
  let value1 = 100;
  expect(toDollars(value1)).toBe(1);
  let value2 = 1000;
  expect(toDollars(value2)).toBe(10);
  let value3 = 400000;
  expect(toDollars(value3)).toBe(4000);
});


test('toCents multiplies by 100', () => {
  let value1 = 1;
  expect(toCents(value1)).toBe(100);
  let value2 = 100;
  expect(toCents(value2)).toBe(10000);
  let value3 = 4000;
  expect(toCents(value3)).toBe(400000);
});


test('getHandRank for royal flush', () => {
  let royalFlush = [[9, '♠'], [8, '♠'], [12, '♠'], [11, '♠'], [10, '♠']];
  expect(getHandRank(royalFlush)).toEqual([8, 12, 0, 0, 0, 0])
});


test('getHandRank for wheel straight flush', () => {
  let wheelFlush = [[14, '♠'], [5, '♠'], [4, '♠'], [3, '♠'], [2, '♠']];
  expect(getHandRank(wheelFlush)).toEqual([8, 5, 0, 0, 0, 0]);
});


test('getHandRank for 4 of a kind', () => {
  let fourOfAKind = [[13, '♠'], [13, '♥'], [13, '♦'], [13, '♣'], [8, '♠']];
  expect(getHandRank(fourOfAKind)).toEqual([7, 13, 8, 0, 0, 0]);
});


test('getHandRank for full house', () => {
  let fullHouse = [[12, '♠'], [12, '♥'], [8, '♦'], [8, '♣'], [8, '♠']];
  expect(getHandRank(fullHouse)).toEqual([6, 8, 12, 0, 0, 0]); 
});


test('getHandRank for flush', () => {
  let flush = [[9, '♠'], [4, '♠'], [3, '♠'], [14, '♠'], [8, '♠']];
  expect(getHandRank(flush)).toEqual([5, 14, 9, 8, 4, 3]); 
});


test('getHandRank for straight', () => {
  let broadway = [[14, '♣'], [12, '♦'], [11, '♥'], [13, '♠'], [10, '♠']];
  expect(getHandRank(broadway)).toEqual([4, 14, 0, 0, 0, 0]);
  
  let straightWithHigh9 = [[8, '♣'], [6, '♦'], [7, '♥'], [9, '♠'], [5, '♠']];
  expect(getHandRank(straightWithHigh9)).toEqual([4, 9, 0, 0, 0, 0]); 

  let wheel = [[5, '♣'], [3, '♦'], [14, '♥'], [4, '♠'], [2, '♠']];
  expect(getHandRank(wheel)).toEqual([4, 5, 0, 0, 0, 0]); 
});


test('getHandRank for 3 of a kind', () => {
  let threeOfAKind = [[12, '♠'], [11, '♥'], [11, '♦'], [11, '♣'], [8, '♠']];
  expect(getHandRank(threeOfAKind)).toEqual([3, 11, 12, 8, 0, 0]); 
});


test('getHandRank for two pair', () => {
  let twoPair = [[4, '♠'], [3, '♥'], [10, '♦'], [4, '♣'], [3, '♠']];
  expect(getHandRank(twoPair)).toEqual([2, 4, 3, 10, 0, 0]); 
});


test('getHandRank for pair', () => {
  let pair = [[8, '♠'], [8, '♥'], [14, '♦'], [6, '♣'], [3, '♠']];
  expect(getHandRank(pair)).toEqual([1, 8, 14, 6, 3, 0]);;
});


test('getHandRank for high card', () => {
  let highCard1 = [[4, '♠'], [8, '♥'], [14, '♦'], [6, '♣'], [3, '♠']];
  expect(getHandRank(highCard1)).toEqual([0, 14, 8, 6, 4, 3]);
  let highCard2 = [[5, '♥'], [8, '♥'], [14, '♦'], [6, '♣'], [3, '♠']];
  expect(getHandRank(highCard2)).toEqual([0, 14, 8, 6, 5, 3]);
});