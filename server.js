const net = require("net");
const fs = require("fs");

const server = net.createServer();

let clients = [];

const COMMANDS = [
  '1. Type "\\users" to see which users are currently active...',
  '2. Type "\\block {username}" to block a user...',
  '3. Type "\\unblock {username}" to unblock a user...',
  '4. Type "\\blocked" to see whom you have blocked...',
];

server.on("connection", (socket) => {
  let username;
  console.log("A new connection to the server");

  socket.on("data", (data) => {
    const dataObject = JSON.parse(data.toString("utf-8"));
    // console.log(dataObject);
    if (dataObject.type === "new_connection") {
      const usernameExist = clients.find(
        (client) => client.username === dataObject.username
      );
      if (usernameExist) {
        socket.write(JSON.stringify({ type: "username", data: true }));
      } else {
        username = dataObject.username;
        socket.write(JSON.stringify({ type: "username", data: false }));
        clients.forEach((client) =>
          client.socket.write(
            JSON.stringify({
              type: "message",
              data: `> 📢 ${username} has joined the chat! 🎉`,
            })
          )
        );
        clients.push({ socket, username, blockedUsers: [] });
      }
    } else if (dataObject.type === "message") {
      clients.forEach((client) => {
        const sender = clients.find((c) => c.username === username);
        const receiver = client;

        // Skip sending the message to the sender themselves
        // if (receiver.username !== sender.username) {
        const isBlockedBySender = sender.blockedUsers.includes(
          receiver.username
        );
        const isBlockedByReceiver = receiver.blockedUsers.includes(
          sender.username
        );

        // Only send the message if neither has blocked the other
        if (!isBlockedBySender && !isBlockedByReceiver) {
          receiver.socket.write(JSON.stringify({ ...dataObject }));
        }
        // }
      });
    } else if (dataObject.type === "see_users") {
      const userList = clients
        .filter((client) => {
          const isNotSelf = client.username !== username;
          const isNotBlockedByMe = !client.blockedUsers.includes(username);
          const isNotBlockingMe = !clients
            .find((c) => c.username === username)
            .blockedUsers.includes(client.username);
          return isNotSelf && isNotBlockedByMe && isNotBlockingMe;
        })
        .map((client) => client.username);

      const numberOfUser = userList.length;
      socket.write(
        JSON.stringify({
          type: "message",
          data: `\nTotal ${numberOfUser} users are active\n${userList.join(
            ", "
          )}\n`,
        })
      );
    } else if (dataObject.type === "show_commands") {
      socket.write(
        JSON.stringify({
          type: "message",
          data: "\n" + COMMANDS.join("\n") + "\n",
        })
      );
    } else if (dataObject.type === "block") {
      const userToBlock = dataObject.username;
      if (userToBlock === username) {
        socket.write(
          JSON.stringify({
            type: "message",
            data: `* You can't block your own account.`,
          })
        );
        return;
      }
      // console.log(clients);
      const client = clients.find((client) => client.username === username);
      const userExist = clients.find(
        (client) =>
          client.username === userToBlock &&
          !client.blockedUsers.includes(username)
      );
      // console.log(userExist);
      if (!userExist) {
        socket.write(
          JSON.stringify({
            type: "message",
            data: `* User ${userToBlock} does not exist.`,
          })
        );
      } else if (client) {
        if (!client.blockedUsers.includes(userToBlock)) {
          client.blockedUsers.push(userToBlock);
          socket.write(
            JSON.stringify({
              type: "message",
              data: `* You have blocked ${userToBlock}.`,
            })
          );
        } else {
          socket.write(
            JSON.stringify({
              type: "message",
              data: `* ${userToBlock} is already blocked.`,
            })
          );
        }
      }
    } else if (dataObject.type === "unblock") {
      const userToUnblock = dataObject.username;
      if (userToUnblock === username) {
        socket.write(
          JSON.stringify({
            type: "message",
            data: `* You can't unblock your own account`,
          })
        );
        return;
      }
      const client = clients.find((client) => client.username === username);
      const userExist = clients.find(
        (client) =>
          client.username === userToUnblock &&
          !client.blockedUsers.includes(username)
      );
      if (!userExist) {
        socket.write(
          JSON.stringify({
            type: "message",
            data: `* User ${userToUnblock} does not exist.`,
          })
        );
      } else if (client) {
        if (client.blockedUsers.includes(userToUnblock)) {
          client.blockedUsers = client.blockedUsers.filter(
            (user) => user !== userToUnblock
          );
          socket.write(
            JSON.stringify({
              type: "message",
              data: `* You have unblocked ${userToUnblock}.`,
            })
          );
        } else {
          socket.write(
            JSON.stringify({
              type: "message",
              data: `* User ${userToUnblock} is not blocked.`,
            })
          );
        }
      }
    } else if (dataObject.type === "blocked") {
      const client = clients.find((client) => client.username === username);
      const blockedUsersList = client.blockedUsers.join(", ");

      socket.write(
        JSON.stringify({
          type: "message",
          data: `* You have blocked the following users: ${
            blockedUsersList || "No users blocked"
          }.`,
        })
      );
    }
  });

  socket.on("end", () => {
    clients.forEach((client) =>
      client.socket.write(
        JSON.stringify({
          type: "message",
          data: `> 👋 ${username} has left the chat. 😢`,
        })
      )
    );
    clients = clients.filter((client) => client.username !== username);
  });
});

server.listen(3008, "127.0.0.1", () => {
  console.log("Opened server on ", server.address());
});
