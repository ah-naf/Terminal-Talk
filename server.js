const net = require("net");

const server = net.createServer();

let clients = [];

const COMMANDS = [
  '1. Type "\\exit" to exit Terminal Talk...',
  '2. Type "\\users" to see which users are currently active...',
];

server.on("connection", (socket) => {
  let username;
  console.log("A new connection to the server");

  socket.on("data", (data) => {
    const dataObject = JSON.parse(data.toString("utf-8"));

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
        clients.push({ socket, username });
      }
    } else if (dataObject.type === "message") {
      clients.forEach((client) => {
        client.socket.write(JSON.stringify({ ...dataObject }));
      });
    } else if (dataObject.type === "see_users") {
      const userList = clients
        .map((client) => client.username)
        .filter((client) => client !== username);

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
