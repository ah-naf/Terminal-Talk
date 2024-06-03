const net = require("net");

const server = net.createServer();

const clients = [];

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
        clients.map((client) =>
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
      clients.map((client) => {
        client.socket.write(JSON.stringify({ ...dataObject }));
      });
    }
  });

  socket.on("end", () => {
    clients.map((client) =>
      client.socket.write(
        JSON.stringify({
          type: "message",
          data: `> 👋 ${username} has left the chat. 😢`,
        })
      )
    );
  });
});

server.listen(3008, "127.0.0.1", () => {
  console.log("Opened server on ", server.address());
});
