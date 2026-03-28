const {Login,SignUp, AdminAuth, CompanyAuth}=require("../Controllers/User")
const {authMiddleWare}=require("../middlewares/auth")
const express=require("express");
const upload = require("../middlewares/upload");
const router=express.Router();

router.post('/user/signup', upload.single('resume'), SignUp);
router.post('/user/login',Login);
router.post('/admin/login',AdminAuth)
router.post('/company/login',CompanyAuth)
module.exports=router;