import app from "./src/app.js";
import connectToDB from "./src/config/db.js";


const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
    process.exit(1);
  }
};
startServer();
