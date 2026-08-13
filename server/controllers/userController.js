const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email role');
  res.json(users);
});

exports.getMyProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

exports.updateMyProfile = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findById(req.user._id);

  if (name !== undefined) user.name = name;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
  }
  await user.save();

  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});