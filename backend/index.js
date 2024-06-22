const express = require("express");
const cors = require("cors");

const app = express();
// to communicate backend and frontedn when they are on diffrent port
app.use(cors());
// body parser middleware
//Since we have to support the JSON body in post requests, add the express body parser
app.use(express.json());

const mainRouter = require("./routes/index");

app.use("/api/v1", mainRouter);

app.listen(3000, () => {
  console.log("App is running on port 3000");
});
