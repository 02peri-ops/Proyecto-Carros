const bcrypt = require("bcrypt");

async function run() {
  const password = "Carros123";
  const hash = await bcrypt.hash(password, 10);
  console.log("HASH:");
  console.log(hash);
}

run();