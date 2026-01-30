import express from "express";
import mongoose from "mongoose";
import userRoutes from "./component/user/index.js";
import path from "path";
import config from "../config/index.js";

const PORT = config.PORT;

const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));


process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);

});


process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
  process.exit(1);
});

const mongoconnect = async() => {
    try{
await mongoose.connect(config.MONGO_URI);
        console.log("database connection sucess");
    }
    catch(error){
        console.error('Error to connect database:', error.message);
        process.exit(1);
    }
};

const startServer = async () => {
    await mongoconnect();
    
const router = express.Router();
app.use("/api", userRoutes(router));
    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();





