const express = require("express");
const router = express.Router();
const Account = require("../schema/bank");
const { authMiddleware } = require("../middleware");
const { default: mongoose } = require("mongoose");

//Route to get the account balance of the user
router.get("/balance", authMiddleware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId,
  });

  return res.status(200).json({
    success: true,
    message: "Account balance fetch successfully",
    balance: account.balance,
  });
});

//Route to transfer money to another account
router.post("/transfer", async (req, res) => {
  //Session will perfomm all the operation at a time
  // it does not allow a another req. form same frontend at a time
  const session = await mongoose.startSession();

  //Transiction process initiated
  session.startTransaction();

  // extracting amount and sender id from body
  const { amount, to } = req.body;

  //Fetch the account within the transaction
  const account = await Account.findOne({ userId: req.userId }).session(
    session
  );

  if (!account || account.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      success: false,
      message: "Insufficient fund",
    });
  }

  //Fetch the sender account
  const toAccount = await User.findOne({
    userId: to,
  }).session(session);

  if (!toAccount) {
    session.abortTransaction();

    return res.status(400).json({
      success: false,
      message: "Invalid user",
    });
  }

  //MOney transfer logic

  //sedning money from user , then its balance should be - with amount
  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);

  //reciving money to reciver  , then its balance should be + with amount
  await account
    .updateOne(
      {
        userId: to,
      },
      { $inc: { balance: +amount } }
    )
    .session(session);

  //This line show our transaction is now compleete
  await session.commitTransaction();

  return res.status(200).json({
    success: true,
    message: "Transfered Successfulyy",
  });
});

module.exports = router;
