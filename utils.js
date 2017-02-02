// generates ids for messages
const getNextId = (() => {
  let id = 0;
  return () => {
    id += 1;
    return id;
  };
})();

module.exports = {
  getNextId,
};
