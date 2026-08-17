const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function updateProfile(req, res, next) {
  try {
    const { name: rawName, avatarBase64 } = req.body;
    const name = rawName?.trim();
    if (!name) return res.status(400).json({ message: "A profile name is required." });
    
    const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    const updateData = { name, avatarInitials: initials };
    if (avatarBase64 !== undefined) updateData.avatarBase64 = avatarBase64;
    
    const user = await User.findByIdAndUpdate(req.userId, updateData, { returnDocument: 'after' });
    return res.json({ user: { id: user.id, name: user.name, email: user.email, avatarInitials: user.avatarInitials, avatarBase64: user.avatarBase64, isPro: user.isPro, rewardsPoints: user.rewardsPoints } });
  } catch (error) { return next(error); }
}

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Current password and a new 8-character password are required." });
    }
    const user = await User.findById(req.userId).select("+passwordHash");
    if (!user) return res.status(404).json({ message: "User not found." });
    
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({ message: "Incorrect current password." });
    }
    
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.json({ message: "Password updated successfully." });
  } catch (error) { return next(error); }
}

async function deleteAccount(req, res, next) {
  try {
    const LearningContent = require("../models/LearningContent");
    await LearningContent.deleteMany({ user: req.userId });
    await User.findByIdAndDelete(req.userId);
    return res.json({ message: "Account and all associated data successfully deleted." });
  } catch (error) { return next(error); }
}

async function upgradePro(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { isPro: true }, { returnDocument: 'after' });
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ message: "Successfully upgraded to Graspify Pro!", user: { id: user.id, name: user.name, email: user.email, avatarInitials: user.avatarInitials, avatarBase64: user.avatarBase64, isPro: user.isPro, rewardsPoints: user.rewardsPoints } });
  } catch (error) { return next(error); }
}

module.exports = { updateProfile, updatePassword, deleteAccount, upgradePro };
