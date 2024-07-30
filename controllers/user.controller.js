const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const sendEmail = require("../utils/email")
const { SendSMS } = require("../utils/sms")
const { checkEmpty } = require("../utils/checkEmpty")
const { json } = require("body-parser")
const Posts = require("../models/Posts")

exports.VerifyUserEmail = asyncHandler(async (req, res) => {
    console.log(req.loggedInUser)
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You are Not logged In. Please Login Again" })
    }
    console.log(result)
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { emailCode: otp })
    await sendEmail({ to: result.email, subject: "Verify Email", message: `<h1> your OTP is ${otp}</h1>` })
    res.json({ message: "Verify User Email Success" })
})
exports.VerifyEmailOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body
    console.log(req.loggedInUser)
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You are Not logged In. Please Login Again" })
    }
    if (otp != result.emailCode) {
        return res.status(400).json({ message: "Invalid OTP" })
    }
    const UpdatedUser = await User.findByIdAndUpdate(req.loggedInUser, { emailVerified: true }, { new: true })
    res.json({
        message: "User Email Verifyed Success", result: {
            _id: UpdatedUser._id,
            name: UpdatedUser.name,
            mobile: UpdatedUser.mobile,
            email: UpdatedUser.email,
            avatar: UpdatedUser.avatar,
            emailVerified: UpdatedUser.emailVerified,
            mobileVerified: UpdatedUser.mobileVerified,
        }
    })
})
exports.VerifyMobileOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body
    console.log(req.loggedInUser)
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You are Not logged In. Please Login Again" })
    }
    if (otp != result.mobileCode) {
        return res.status(400).json({ message: "Invalid OTP" })
    }
    const UpdatedUser = await User.findByIdAndUpdate(req.loggedInUser, { mobileVerified: true }, { new: true })
    res.json({
        message: "User Mobile Verifyed Success", result: {
            _id: UpdatedUser._id,
            name: UpdatedUser.name,
            mobile: UpdatedUser.mobile,
            email: UpdatedUser.email,
            avatar: UpdatedUser.avatar,
            emailVerified: UpdatedUser.emailVerified,
            mobileVerified: UpdatedUser.mobileVerified,
        }
    })
})

exports.VerifyUserMobile = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { mobileCode: otp })
    await SendSMS({
        message: `WelCome to OLX-Clone, You'r OTP is ${otp}, Plsease Don't Send This Code To Anyone`,
        numbers: `${result.mobile}`
    })
    res.json({ message: "Verification Code Send Success" })
})





exports.addPost = asyncHandler(async (req, res) => {
    const { title, desc, price, images, location, category } = req.body
    const { error, isError } = checkEmpty({ title, desc, price, images, location, category })
    if (isError) {
        return res.status(400).json({ message: "All Fields Required" })
    }

    await Posts.create({ title, desc, price, images, location, user: req.loggedInUser, category })
    res.json({ message: "Post Create Successs" })
})