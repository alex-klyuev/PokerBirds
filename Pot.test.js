const { Pot } = require('./Pot');

test('Pot.toString() returns correct string', () => {
  expect(new Pot().toString())
    .toBe(`Pot { open: true, amount: $0, playerCommitment: $0, playerCommitments: {}, potentialWinners: {} }`);
});
