const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://krishnagptamcs:sBg3SjvqghRcsbXH@cluster1.9ybmmah.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("DB connected succesfully"))
  .catch((error) => {
    console.log("DB connection failed");
    console.log(error);
    process.exit(1);
  });
