const router = require("express").Router();
const { login, me, register } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);

module.exports = router;
