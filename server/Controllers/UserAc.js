const CompanyJob = require('../models/CompanyJob');
const Application = require('../models/PostEnroll');
const User = require('../models/User');

// Helper to validate degree duration
const isValidDuration = (degree, startYear, endYear) => {
    if (!startYear || !endYear) return true;
    
    const start = parseInt(startYear);
    const end = parseInt(endYear);
    if (isNaN(start) || isNaN(end) || start >= end) return false;
    
    const duration = end - start;
    const deg = (degree || "").toLowerCase();
    
    if (deg.includes("b.tech") || deg.includes("b.e") || deg.includes("bachelor of engineering") || deg.includes("bachelor of technology")) {
        return duration === 4;
    }
    if (deg.includes("m.tech") || deg.includes("m.e") || deg.includes("mba") || deg.includes("m.sc") || deg.includes("ma") || deg.includes("m.com") || deg.includes("intermediate") || deg.includes("12th") || deg.includes("pu")) {
        return duration === 2;
    }
    if (deg.includes("b.sc") || deg.includes("b.com") || deg.includes("bba") || deg.includes("bca") || deg.includes("ba")) {
        return duration === 3;
    }
    if (deg.includes("phd") || deg.includes("doctorate")) {
        return duration >= 3 && duration <= 7;
    }
    
    return duration >= 2 && duration <= 5;
};

// User applies for a job
const JobApply = async (req, res) => {
  const jobId = req.params.id;
  try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.isStudentVerified) {
          return res.status(403).json({ message: "Student ID verification required to apply for jobs. Please upload your student ID in the dashboard." });
      }

      const job = await CompanyJob.findById(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      // 1. Check constraints before allowing application
      if (job.status === 'Closed') {
          return res.status(400).json({ message: "This role is no longer accepting applications." });
      }

      if (job.endDate && new Date() > new Date(job.endDate)) {
          return res.status(400).json({ message: "The deadline for this job has passed." });
      }

      // Check if user has already applied
      const alreadyApplied = await Application.findOne({ job: jobId, user: req.user._id });
      if (alreadyApplied) {
          return res.status(400).json({ message: "You already applied for this job" });
      }

      // 2. Process Application
      const application = new Application({ job: jobId, user: req.user._id });
      await application.save();

      // 3. Update Job Counters & enforce Max caps automatically
      job.appliedCount = (job.appliedCount || 0) + 1;
      
      if (job.maxApplicants && job.appliedCount >= job.maxApplicants) {
          job.status = 'Closed';
      }

      await job.save();

      res.json({ message: "Applied successfully", application });
  } catch (err) {
      res.status(500).json({ message: "Internal server error applying for job" });
  }
};

// Get all jobs (for user dashboard)
const GetAllJobs = async (req, res) => {
  const jobs = await CompanyJob.find().populate('company', 'name location');
  res.json(jobs);
};

// Get applications of a user (for My Applications page)
const GetUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await Application.find({ user: userId })
      .populate("job", "title")
      .populate({ path: "job", populate: { path: "company", select: "name" } });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// Get single job details for user view
const GetJobDetails = async (req, res) => {
  try {
    const job = await CompanyJob.findById(req.params.id).populate('company', 'name email location');
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Error fetching job details" });
  }
};

// Get current user profile (for skills matching)
const GetProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Upload student ID card and verify student
const UploadStudentId = async (req, res) => {
  try {
    const { graduationYear } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "Student ID card file is required" });
    }

    if (!graduationYear) {
      return res.status(400).json({ message: "Graduation year is required" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const savedEndYear = existingUser.education && existingUser.education.length > 0 ? existingUser.education[0].endYear : null;
    
    if (savedEndYear && savedEndYear !== graduationYear) {
      return res.status(400).json({ message: `The graduation year provided (${graduationYear}) does not match your profile's ending year (${savedEndYear}).` });
    }

    const studentIdCardUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        studentIdCardUrl,
        graduationYear,
        isStudentVerified: true, // Mocking verification for now
        profileCompletion: 100
      },
      { new: true }
    );

    res.json({
      message: "Student ID uploaded and verified successfully!",
      user: {
        isStudentVerified: user.isStudentVerified,
        profileCompletion: user.profileCompletion,
        studentIdCardUrl: user.studentIdCardUrl
      }
    });
  } catch (err) {
    console.error("Error uploading student ID:", err);
    res.status(500).json({ message: "Internal server error uploading student ID" });
  }
};

// Update user profile
const UpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, phone, location, skills, portfolioLinks, preferences, education } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    
    // Handle resume upload
    if (req.file) {
      updateData.resumeUrl = `/uploads/${req.file.filename}`;
    }

    // Parse JSON fields if they are strings (from FormData)
    if (skills) {
      updateData.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    }
    if (portfolioLinks) {
      updateData.portfolioLinks = typeof portfolioLinks === 'string' ? JSON.parse(portfolioLinks) : portfolioLinks;
    }
    if (preferences) {
      updateData.preferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
    }

    if (education) {
      const parsedEdu = typeof education === 'string' ? JSON.parse(education) : education;
      const existingUser = await User.findById(userId);
      let currentEdu = existingUser.education && existingUser.education.length > 0 ? existingUser.education[0] : {};
      
      const updatedEdu = {
        ...currentEdu.toObject ? currentEdu.toObject() : currentEdu,
        ...parsedEdu[0] // Merge new fields (startYear, endYear, degree, stream)
      };

      if (!isValidDuration(updatedEdu.degree, updatedEdu.startYear, updatedEdu.endYear)) {
          return res.status(400).json({ 
              message: `Invalid graduation duration. The difference between Start Year (${updatedEdu.startYear}) and End Year (${updatedEdu.endYear}) is not mathematically valid for the degree (${updatedEdu.degree || 'provided course'}).` 
          });
      }

      updateData.education = [updatedEdu];
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully!", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Internal server error updating profile" });
  }
};

module.exports = { JobApply, GetAllJobs, GetUserApplications, GetJobDetails, GetProfile, UploadStudentId, UpdateProfile };
