import dotenv from "dotenv";
dotenv.config();
import * as indexRouter from "./modules/index.router.js";
import express from "express";
import connectDB from "./DB/connection.js";
import cors from "cors"
import compression from "compression";

const app = express();
const port = 3000;
const baseURL = process.env.baseURL;


app.use(express.json());
app.use(`${baseURL}/auth`, indexRouter.authRouter);
app.use(`${baseURL}/user`, indexRouter.subsRouter);
app.use(`${baseURL}/deploy`, indexRouter.depRouter);
app.use(`${baseURL}/free`, indexRouter.freeRouter);
app.use(express.static('flutter_app/build'));
app.use(cors())
app.use(compression())

app.use("*", (req, res) => {
  const url = `${req.protocol}://${req.headers.host} ${process.env.BASEURL}/auth/confirmEmail/12545646547897`;
  res.json({ message: "invalid routing", url });
});


connectDB();
app.listen(port, () => {
  console.log(`server is running on port.......... ${port}`);
});
