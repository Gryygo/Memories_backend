import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";

const app = express();

app.use(
	bodyParser.json({
		limit: "30mb",
		extended: true,
	})
);
app.use(
	bodyParser.urlencoded({
		limit: "30mb",
		extended: true,
	})
);
// app.use((req, res, next) => {
// 	res.setHeader("Access-Control-Allow-Origin", "*");
// 	res.setHeader("Access-Control-Allow-Methods", "*");
// 	res.setHeader("Access-Control-Allow-Headers", "*");
// 	next();
// });
app.use(cors());

app.use("/posts", postRoutes);
app.use("/user", userRoutes);

app.get("/", (req, res, next) => {
	res.send("APP RUNNING");
});

const PORT = process.env.PORT || 5000;

mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
	.catch((err) => console.log(err.message));

//   mongoose.set('useFindAndModify', false);
