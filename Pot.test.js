const { Pot } = require('./Pot');

test('Pot.toString() returns correct string', () => {
  expect(new Pot().toString())
    .toBe(`Pot { open: true, currARAmount: $0, prevARsAmount: $0, playerCommitment: $0, history: {}, potentialWinners: {} }`);
});
