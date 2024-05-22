import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../../../DB/models/user.js";
import { sendEmail } from "../../../service/sendEmail.js";
import { asyncHandler } from "../../../service/errorHandling.js";
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import dotenv from 'dotenv'
dotenv.config()



import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";



export const signUp = asyncHandler(async (req, res) => {
  try {
    const { email, password, userName} = req.body;
    const user = await userModel.findOne({ email }).select("email");
    if (user) {
      res.status(400).json({ message: "Email exists" });
    } else {
      const hashPassword = await bcrypt.hash(
        password,
        parseInt(process.env.saltRound)
      );

      const customer = await stripe.customers.create({
        email,
      });

      const newUser = new userModel({
        email,
        password: hashPassword,
        userName,
        stripe_customer_id: customer.id,
        
      });

      const saveduser = await newUser.save();
      const token = jwt.sign(
        { id: saveduser._id },
        process.env.confirmEmailToken,
        // { expiresIn: year }
      );
      console.log(token);
      const rfToken = jwt.sign(
        { id: saveduser._id },
        process.env.confirmEmailToken
      );
      const emailMessage = `<a href='${req.protocol}://${req.headers.host}${process.env.baseURL}/auth/confirmEmail/${token}'> Follow me to confirm your account</a> 
            <br>
<a href='${req.protocol}://${req.headers.host}${process.env.baseURL}/auth/requestRfToken/${rfToken}'> Request new link</a>`;
      sendEmail(saveduser.email, "Confirm Email", emailMessage);
      saveduser
        ? res.status(201).json({ message: "Done", emailMessage })
        : res.status(400).json({ message: "Failed to add new user" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error", error });
    console.log(error);
  }
});



export const confirmEmail = asyncHandler( async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.confirmEmailToken);
    const user = await userModel.updateOne(
      { _id: decoded.id, confirmEmail: false },
      { confirmEmail: true }
    );
    user.modifiedCount
      ? res.status(201).json({ message: "Email confirmed plz login " })
      : res.status(400).json({
          message: "eathir email already confirmed or in-valid email ",
        });
  } catch (error) {
    res.status(500).json({ message: "catch error", error });
  }
});



export const requestRefToken = asyncHandler( async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.confirmEmailToken);
    if (!decoded?.id) {
      res.status(400).json({ message: "In-valid token payload" });
    } else {
      const user = await userModel.findById(decoded.id);
      if (user?.confirmEmail) {
        res.json({ message: "Already confirmed" });
      } else {
        const token = jwt.sign(
          { id: user._id },
          process.env.confirmEmailToken,
          {
            expiresIn: 60 *60*60*60* 2,
          }
        );
        const emailMessage = `<a href='${req.protocol}://${req.headers.host}${process.env.baseURL}/auth/confirmEmail/${token}'>
              Follow me to confrim Your account</a> `;
        sendEmail(user.email, "Confirm-Email", emailMessage);
        res.status(201).json({ message: "Done" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Catch error", error });
  }
});

export const signIn = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Invalid account" });
    } else {
      if (!user.confirmEmail) {
        res.json({ message: "Please confirm your email first" });
      } else {
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          res.status(400).json({ message: "Invalid password" });
        } else {
          const token = jwt.sign(
            { id: user._id, isLoggedIn: true },
            process.env.TOKENSIGNATURE,
            { expiresIn: '3h' }
          );

          console.log(token);
          await userModel.updateOne({ _id: user._id }, { online: true });

          res.status(StatusCodes.OK).json({
            message: `loggedIn as ${user.role}`,
            token,
            role: user.role,
            username: user.userName,
            statusCode: getReasonPhrase(StatusCodes.OK),
          });
        }
      }
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Catch error", error });
  }
});


export const sendCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await userModel
    .findOne({ email })
    .select("email blocked isDeleted");
  if (user?.isDeleted || user?.blocked) {
    res.status(400).json({
      message: "Can't send code to not register account or blocked",
    });
  } else {
    const code = generateNumericCode(6); // Generate a 6-digit numerical code
    await userModel.updateOne({ _id: user._id }, { code });
    sendEmail(
      user.email,
      "forget password",
      `<h1> Please use this code: ${code} to reset your password</h1>`
    );
    res.status(201).json({ message: "Done" });
  }
});

function generateNumericCode(length) {
  let code = '';
  const digits = '0123456789';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    code += digits[randomIndex];
  }
  return code;
}


export const forgetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    res.json({ message: "Not registered account" });
  } else {
    if (user.code !== code || code === null) {
      res.status(400).json({ message: "Invalid Code" });
    } else {
      const isSamePassword = await bcrypt.compare(password, user.password);

      if (isSamePassword) {
        res.json({ message: "Please enter a new password" });
      } else {
        const hashPassword = await bcrypt.hash(
          password,
          parseInt(process.env.SaltRound)
        );

        await userModel.updateOne(
          { _id: user._id },
          { password: hashPassword, code: null }
        );

        res.status(201).json({ message: "Password updated successfully" });
      }
    }
  }
});

// Logout

export const logOut = asyncHandler(async (req, res) => {
  const user = await userModel.findOneAndUpdate(
    { _id: req.user._id, online: true }, // Update the condition to check for online: true
    { online: false, lastSeen: new Date() }, // Set online to false
    { new: true }
  ).select("firstName lastName email lastSeen age");

  if (user) {
    // If the user is found and updated successfully
    res.status(201).json({ message: "Done", user });
  } else {
    // If the user is not found or the token is invalid or expired
    res.status(400).json({ message: "Invalid user token or this token expired" });
  }
});


// export const deleteUser = asyncHandler(async (req, res) => {
//   // Find the user by ID and delete it
//   const deletedUser = await userModel.findOneAndDelete({ _id: req.user._id });

//   if (deletedUser) {
//     // If the user is found and deleted successfully
//     res.status(200).json({ message: "User deleted successfully", user: deletedUser });
//   } else {
//     // If the user is not found
//     res.status(404).json({ message: "User not found" });
//   }
// });

export const deleteUser = asyncHandler(async (req, res) => {
  // Update the user's isDeleted field to true before deleting
  const updatedUser = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    { isDeleted: true },
    { new: true }
  );

  // Find the user by ID and delete it
  const deletedUser = await userModel.findOneAndDelete({ _id: req.user._id });

  if (deletedUser) {
    // If the user is found and deleted successfully
    res.status(200).json({ message: "User deleted successfully", user: updatedUser });
  } else {
    // If the user is not found
    res.status(404).json({ message: "User not found" });
  }
});
