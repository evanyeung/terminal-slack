/**
 * Unit tests
 */

// Dependencies
const assert = require('assert');

const helpers = require('../lib/helpers');

// Conteiner for unit test
const unit = {};

unit['helpers.getNextId should return 3'] = (done) => {
  helpers.getNextId();
  helpers.getNextId();
  assert.equal(helpers.getNextId(), 3);
  done();
};

unit['helpers.getUserById should return correct user'] = (done) => {

  const fakeUsers = [
    {
      id: 0,
      name: 'Fake 0',
    },
    {
      id: 1,
      name: 'Fake 1',
    },
    {
      id: 2,
      name: 'Fake 2',
    }
  ];

  assert.deepEqual(helpers.getUserById(fakeUsers)(1), fakeUsers[1]);

  done();
};

// Export module
module.exports = unit;
