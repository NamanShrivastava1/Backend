import mongoose from "mongoose";
import { config } from "./config.js";

function connectToDB() {
  mongoose
    .connect(config.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
      console.log("Error in Db", error);
      process.exit(1);
    });
}

export default connectToDB;
