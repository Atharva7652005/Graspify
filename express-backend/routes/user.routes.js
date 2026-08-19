const router = require("express").Router();
const { updateProfile, updatePassword, deleteAccount, purchasePlan, switchPlan } = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.patch("/profile", requireAuth, updateProfile);
router.patch("/profile/password", requireAuth, updatePassword);
router.delete("/profile", requireAuth, deleteAccount);
router.post("/plan/purchase", requireAuth, purchasePlan);
router.post("/plan/switch", requireAuth, switchPlan);

module.exports = router;
