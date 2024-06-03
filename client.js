const net = require("net");
const readline = require("readline/promises");
const {
  clearConsole,
  welcomeMessage,
  askForUsername,
  showSpinner,
  writeMessage,
} = require("./util");

const host = "127.0.0.1";
const port = 3008;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async function () {
  welcomeMessage();

  let username = await askForUsername(rl);

  const socket = net.createConnection({ host, port }, async () => {
    const checkUsername = (username) => {
      return new Promise((resolve) => {
        const message = `Checking if username "${username}" exists`;
        const spinner = showSpinner(message);

        socket.write(JSON.stringify({ type: "new_connection", username }));

        socket.once("data", (data) => {
          clearInterval(spinner);
          process.stdout.write("\r"); // Clear the spinner
          const dataObject = JSON.parse(data.toString("utf-8"));
          resolve(dataObject.data);
        });
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

    console.log("\nConnected to the server");
    console.log(`Your username is "${username}". Enjoy Terminal Talk...`);
    console.log('Type "\\exit" to exit Terminal Talk...\n');

    socket.on("data", async (data) => {
      const dataObject = JSON.parse(data.toString("utf-8"));
      if (dataObject.type === "message") {
        console.log();
        await clearConsole();
        console.log(dataObject.data);
        const message = await writeMessage(username, rl);
        if (message === "\\exit") {
          socket.end();
          process.exit(0);
        } else
          socket.write(
            JSON.stringify({
              type: "message",
              data: `> ${username} : ${message}`,
            })
          );
      }
    });

    const message = await writeMessage(username, rl);
    if (message === "\\exit") {
      socket.end();
      process.exit(0);
    } else
      socket.write(
        JSON.stringify({
          type: "message",
          data: `> ${username} : ${message}`,
        })
      );
  });
})();
