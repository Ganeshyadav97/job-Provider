const express=require("express");
const { JobApply, GetAllJobs, GetUserApplications, GetJobDetails, GetProfile, UploadStudentId, UpdateProfile } = require("../Controllers/UserAc");
const { authMiddleWare } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const router=express.Router()

router.post("/apply/:id",authMiddleWare,JobApply)
router.get("/applications",authMiddleWare,GetUserApplications)
router.get("/getjobs",authMiddleWare,GetAllJobs)
router.get("/job/:id",authMiddleWare,GetJobDetails)
router.get("/profile",authMiddleWare,GetProfile)
router.post("/upload-id", authMiddleWare, upload.single('idCard'), UploadStudentId)
router.put("/update-profile", authMiddleWare, upload.single('resume'), UpdateProfile)

module.exports=router