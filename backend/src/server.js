import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORt || 3000;

// middlewares
app.use(express.json());
app.use(cors);

// routes
app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})

