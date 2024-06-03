const clearLine = (dir) => {
  return new Promise((resolve, reject) => {
    process.stdout.clearLine(dir, () => {
      resolve();
    });
  });
};

const moveCursor = (dx, dy) => {
  return new Promise((resolve, reject) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
};

const clearConsole = async () => {
  // Move the cursor one line up
  await moveCursor(0, -1);
  // Clear the current line on terminal
  await clearLine(0);
};

const welcomeMessage = () => {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║                                                ║");
  console.log("║            Welcome to Terminal Talk            ║");
  console.log("║                                                ║");
  console.log("╚════════════════════════════════════════════════╝");
  console.log();
};

const showCommands = () => {
  console.log('1. Type "\\exit" to exit Terminal Talk...');
  console.log('2. Type "\\users" to see which users are currently active...\n');
};

function showSpinner(message) {
  const spinnerChars = ["|", "/", "-", "\\"];
  let i = 0;

  return setInterval(() => {
    process.stdout.write(`\r${message} ${spinnerChars[i++]}`);
    i %= spinnerChars.length;
  }, 150);
}

const validateUsername = (username) => {
  const regex = /^[a-zA-Z0-9-]+$/;
  return regex.test(username);
};

const askForUsername = async (rl) => {
  let username = "";
  while (!username) {
    username = await rl.question("Please enter your username > ");
    if (!validateUsername(username)) {
      console.log(
        "Invalid username. It can only contain letters, numbers, and dashes.\n"
      );
      username = "";
    }
  }
  return username;
};

async function writeMessage(username, rl) {
  const message = await rl.question("Enter a message > ");
  await clearConsole();
  return message;
}

module.exports = {
  clearConsole,
  welcomeMessage,
  askForUsername,
  showSpinner,
  showCommands,
  writeMessage,
};
