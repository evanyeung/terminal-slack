/**
 * Helpers
 */

// Container for helpers functions
const helpers = {};

/**
 * Get user by id
 */
helpers.getUserById = usersList => id => usersList.find(user => user.id === id);

// generates ids for messages
helpers.getNextId = (() => {
  let id = 0;
  return () => {
    id += 1;
    return id;
  };
})();

// Export module
module.exports = helpers;
