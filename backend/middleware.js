//Now that we have a user account, we need to gate routes which authenticated users can hit.
//For this, we need to introduce an auth middleware


//tkaing the jwt secret
const { JWT_SECRET } = require("./config");

// using the jwt package
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // the req consist of three argument
  //req-> what the body contain
  //res->wht to sent back
  //next -> after doing some check , moving to next step

  // extracting the request headers
  const authHeader = req.headers.authorization;

  //If the auth headers start with Bearer ,check , if not retrun an error
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({});
  }

  // if okay then extract the token
  /// genrraly token saved as Bearer bdcjbcsdjn478454(something like this)
  const token = authHeader.spilt(" ")[1];

  try {
    //decoding the jwt-token , by passing the jwt secret
    const decode = jwt.verify(token, JWT_SECRET);

    // now after decoding the token , you will be able to get the userId which you have been passed , at the time of creation of token
    if (decode.userId) {
      // now match the userId , with request user id
      req.userId = decode.userId;

      // if all good ,then call next fn to move on next step
      next();
    } else {
      return res.status(403).json({});
    }
  } catch (error) {
    return res.status(403).json({});
  }
};

module.exports = {
  authMiddleware,
};
