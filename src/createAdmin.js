const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/user"); // ajusta la ruta si es diferente

mongoose.connect(process.env.DB_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash("Carros123", 10);

    await User.create({
      username: "admin",
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin creado correctamente");
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

