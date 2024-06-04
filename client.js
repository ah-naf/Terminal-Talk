const net = require("net");
const readline = require("readline/promises");
const {
  clearConsole,
  welcomeMessage,
  askForUsername,
  showSpinner,
  writeMessage,
} = require("./util");
const path = require("path");

const host = "roundhouse.proxy.rlwy.net";
const port = 44004;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const handleMessage = async (socket, username) => {
  const message = await writeMessage(username, rl);
  if (message === "\\exit") {
    socket.end();
    process.exit(0);
  } else if (message === "\\users") {
    socket.write(JSON.stringify({ type: "see_users" }));
  } else if (message === "\\commands") {
    socket.write(JSON.stringify({ type: "show_commands" }));
  } else if (message.includes("\\block ")) {
    username = message.substring(6).trim();
    socket.write(
      JSON.stringify({
        type: "block",
        username,
      })
    );
  } else if (message.includes("\\unblock ")) {
    username = message.substring(8).trim();
    socket.write(
      JSON.stringify({
        type: "unblock",
        username,
      })
    );
  } else if (message === "\\blocked") {
    socket.write(JSON.stringify({ type: "blocked" }));
  } else {
    socket.write(
      JSON.stringify({
        type: "message",
        data: `> ${username} : ${message}`,
      })
    );
  }
};

(async function () {
  welcomeMessage();

  let username = await askForUsername(rl);

  const socket = net.createConnection({ host, port }, async () => {
    const checkUsername = (username) => {
      return new Promise((resolve) => {
        const message = `Checking if username "${username}" exists`;
        const spinner = showSpinner(message);

        setTimeout(() => {
          socket.write(JSON.stringify({ type: "new_connection", username }));

          socket.once("data", async (data) => {
            await clearConsole();
            await clearConsole();
            clearInterval(spinner);
            process.stdout.write("\r"); // Clear the spinner
            const dataObject = JSON.parse(data.toString("utf-8"));
            resolve(dataObject.data);
          });
        }, 1000);
      });
    };

    let usernameExists = await checkUsername(username);

    while (usernameExists) {
      console.log(
        `The username "${username}" already exists. Please choose a different one.\n`
      );
      username = await askForUsername(rl);
      usernameExists = await checkUsername(username);
    }

    console.log("\nConnected to the server.");
    console.log(`Your username is "${username}". Enjoy Terminal Talk...\n`);
    console.log('----> Type "\\exit" to exit Terminal Talk. <----');
    console.log('----> Type "\\commands" to show useful commands <----\n');

    socket.on("data", async (data) => {
      const dataObject = JSON.parse(data.toString("utf-8"));
      if (dataObject.type === "message") {
        console.log();
        await clearConsole();
        console.log(dataObject.data);
        await handleMessage(socket, username);
      }
    });

    await handleMessage(socket, username);
  });
})();
