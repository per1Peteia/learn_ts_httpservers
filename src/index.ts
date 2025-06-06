import express from "express";
import path from "path";

const app = express();
const port = 8080;

app.use("/", express.static(path.join(process.cwd(), "src")));

const server = app.listen(port, () => {
	console.log(`listening on localhost:${port}`);
});

