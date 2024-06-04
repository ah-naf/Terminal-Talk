# Terminal Talk

Terminal Talk is a simple chat application built using Node.js and the `net` module.
It allows users to chat with each other, block and unblock users, and see the list of currently active users.

## Features

- View the list of currently active users.
- Send and receive messages in real-time.
- Block and unblock users.
- View the list of blocked users.

## Requirements

- Node.js

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/ah-naf/terminal-talk.git
cd terminal-talk
```

### Start the Server

Run the server in a terminal:

```bash
node server.js
```

### Start the Client

Run the client in a separate terminal:

```bash
node client.js
```

## Usage

Once the client is started, you will be prompted to enter a username. After entering a username, you can use the following commands:

### Commands

1. **View Active Users**:

   ```plaintext
   \users
   ```

   Display the list of currently active users.

2. **Block a User**:

   ```plaintext
   \block {username}
   ```

   Block a user. The blocked user will no longer be able to see your messages, and you will not see theirs.

3. **Unblock a User**:

   ```plaintext
   \unblock {username}
   ```

   Unblock a user. The unblocked user will be able to see your messages again, and you will see theirs.

4. **View Blocked Users**:
   ```plaintext
   \blocked
   ```
   Display the list of users you have blocked.

### Chatting

To send a message to all users, simply type your message and press Enter. Your message will be broadcasted to all users who have not blocked you and whom you have not blocked.

## Join the Server

To join the server and start chatting with others, follow these steps:

1. Download the client file from the [repository](https://github.com/ah-naf/terminal-talk).
2. Open the client file and set the following constants:

   ```javascript
   const host = "roundhouse.proxy.rlwy.net";
   const port = 44004;
   ```

3. Run the client file.
4. Enter a username when prompted.
5. Start chatting and enjoy!

Feel free to join and interact with other users on the server!

