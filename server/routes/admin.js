const {GetallCompanys,GetallUsers,UpdateUser,UpdateCompany,DeleteCompany,DeleteUser,CreateCompany,CreateUser}=require("../Controllers/admin")
const{adminAuth,VerifyAdmin}=require("../middlewares/auth")
const express=require("express");
const upload = require("../middlewares/upload");
const router=express.Router();

router.get('/users',adminAuth,GetallUsers)
router.get('/company',adminAuth,GetallCompanys)
router.post('/createuser', adminAuth, upload.single('resume'), CreateUser)
router.post('/createcompany',adminAuth,CreateCompany)
router.post('/updateuser',adminAuth,UpdateUser)
router.post('/updatecompany',adminAuth,UpdateCompany)
router.post('/deleteuser',adminAuth,DeleteUser)
router.post('/deletecompany',adminAuth,DeleteCompany)
module.exports=router;