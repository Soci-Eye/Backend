
import { Schema, model } from "mongoose";

// const subscriptionSchema = new Schema(
//   {
//     subscriptionId: String,
//     startDate: Date,
//     // Add any other relevant subscription fields
//   },
//   { _id: false }
// );

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmEmail: { type: Boolean, default: false },
    age: Number,
    phone: String,
    address: String,
    gender: { type: String, default: "Male", enum: ["Male", "Female"] },
    online: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    role: { type: String, default: "free", enum: ["free", "vip"] },
    stripe_customer_id: String,
    // subscriptions: [subscriptionSchema],
    subscriptions: [{ subscriptionId: String, startDate: Date }],
    code: String,
    lastSeen:{
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

export const userModel = model("User", userSchema);
