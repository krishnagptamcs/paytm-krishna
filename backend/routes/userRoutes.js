const express = require("express");
const zod = require("zod");
const User = require("../schema/user"); //schema's
const Account = require("../schema/bank"); //schema's
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const router = express.Router();

//Signup schema , validate through zod
const signupSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

//Routes handler for signup
router.post("/signup", async (req, res) => {
  const body = req.body;

  const { success } = signupSchema.safeParse(body);
  s;

  if (!success) {
    return res.status(411).json({
      success: false,
      message: "Invalid Input",
    });
  }

  const user = User.findOne({
    username: body.username,
  });

  if (user._id) {
    return res.status(411).json({
      sucess: false,
      message: "Email Already exsist , Pls use diffrent email address",
    });
  }

  const dbUser = await User.create(body);
  // After creating the entry inn db of user ,
  // create an account of it

  //--- Creating a new Accoount for user and initlising the balance----//

  await Account.create({
    userId: dbUser._id,
    balance: 1 + Math.random() * 10000,
  });

  //---------//
  const token = jwt.sign(
    {
      userId: dbUser._id,
    },
    JWT_SECRET
  );

  res.json({
    success: true,
    message: "User created successfully",
    token: token,
  });
});

//SignIn schema , validation through zod
const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

//Routes handler for sigin
router.post("/sigin", async (req, res) => {
  //checking the type/ validating the input
  const { success } = signinBody.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      success: false,
      message: "Error ! Invalid credentials",
    });
  }

  //find the user throught incoming req, in user db
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  //if user found , then send the jwt token
  if (user) {
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    return res.status(200).json({
      success: true,
      message: "Sign in successfully",
      token: token,
    });
  }

  return res.status(411).json({
    success: false,
    message: "Error while login ",
  });
});

//update Schema , validation through zod
const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional,
  lastName: zod.string().optional,
});

//Route Handler to updting the user detals
router.put("/", authMiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      success: false,
      message: "invalid input",
    });
  }

  await User.updateOne(req.body, {
    id: req.userId,
  });

  res.success(200).json({
    success: true,
    message: "User details update successfully",
  });
});

//Route handler to return the user list accroding to its query
//suppose the user pass "kri" , only in the query , thenn
//we have to return the row whose name contain these three charcater

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  //Since in other db like sql , postgress
  //there is an query , "LIKE..." , which automaticaaly return the row whose contain this
  //but inn mongodb , there is diffrent case , there is no such query
  //so we have to  use $or , whose behave like a "LIKE" .. query
  //*****IMPORTANT ONE */
  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  //after gettign the row list , iterate through it and return to the user
  return res.status(200).json({
    sucess: true,
    user: users.map((item) => ({
      username: item.username,
      firstName: item.firstName,
      lastName: item.lastName,
      _id: item._id,
    })),
  });
});

module.exports = router;
