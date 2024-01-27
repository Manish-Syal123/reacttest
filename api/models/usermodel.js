const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  verified: {
    type: boolean,
    default: false,
  },
  verificationToken: String,
  addresses: {
    name: String,
    mobileNo: String,
    houseNo: String,
    street: String,
    landmark: String,
    city: String,
    country: String,
    postalCode: String,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Usermodel = mongoose.model("User", userSchema);

module.exports = Usermodel;
