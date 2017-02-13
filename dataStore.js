let currentChannelId;
let currentUser;

module.exports = {
  getCurrentChannelId() {
    return currentChannelId;
  },
  setCurrentChannelId(id) {
    currentChannelId = id;
    return currentChannelId;
  },
  getCurrentUser() {
    return currentUser;
  },
  setCurrentUser(user) {
    currentUser = user;
    return currentUser;
  },
};
