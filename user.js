class User {
  constructor(name) {
    this.name = name;
    this.messages = []; // Array with messages and their timestamps
  }

  addMessage(message, timestamp) {
    this.messages.push({ message, timestamp });
  }

  getMessages() {
    return this.messages;
  }
}

class UserManager {
  constructor() {
    this.users = new Map(); // Map with usernames as keys and User objects as values
  }

  addUser(username) {
    if (!this.users.has(username)) {
      this.users.set(username, new User(username));
    }
    return this.users.get(username);
  }

  addMessage(username, message, timestamp) {
    const user = this.addUser(username);
    user.addMessage(message, timestamp);
  }

  getUserMessages(username) {
    const user = this.users.get(username);
    return user ? user.getMessages() : [];
  }

  getAllMessages() {
    const allMessages = [];
    this.users.forEach((user) => {
      user.getMessages().forEach((msg) => {
        allMessages.push({ username: user.name, ...msg });
      });
    });
    // Sort messages by timestamp and return the array
    return allMessages.sort((a, b) => a.timestamp - b.timestamp);
  }
}

module.exports = { User, UserManager };
