const router = require("express").Router();
const { updateProfile, updatePassword, deleteAccount, upgradePro } = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.patch("/profile", requireAuth, updateProfile);
router.patch("/profile/password", requireAuth, updatePassword);
router.delete("/profile", requireAuth, deleteAccount);
router.post("/upgrade", requireAuth, upgradePro);

module.exports = router;
