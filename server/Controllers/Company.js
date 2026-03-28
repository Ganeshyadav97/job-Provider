const express=require("express")
const Application=require("../models/PostEnroll")
const CompanyJob=require("../models/CompanyJob")
const PostJob = async (req, res) => {
    console.log("--- New Job Posting Request ---");
    console.log("Body:", req.body);
    console.log("Company from token:", req.company?._id, req.company?.name);

    const { 
        title, location, description, instructions, startDate, endDate, vacantSlots, maxApplicants, roleCompanyName,
        employmentType, locationType, stipend, githubRequired, portfolioRequired
    } = req.body;
    
    // Title and description are still mandatory
    if (!title || !description) {
        console.log("Validation failed: Title or Description missing");
        return res.status(400).json({ message: "enter the proper details: title and description are required" });
    }

    try {
        const companyjob = new CompanyJob({
            title,
            // Use provided location, otherwise fallback to company's registered location
            location: location || req.company.location,
            // Use provided roleCompanyName, otherwise fallback to company's registered name
            roleCompanyName: roleCompanyName || req.company.name,
            description,
            instructions,
            employmentType,
            locationType,
            stipend,
            githubRequired: githubRequired === true || githubRequired === 'true',
            portfolioRequired: portfolioRequired === true || portfolioRequired === 'true',
            startDate,
            endDate,
            vacantSlots: parseInt(vacantSlots) || 1,
            maxApplicants: maxApplicants ? parseInt(maxApplicants) : null,
            company: req.company._id,
            status: "Open",
            appliedCount: 0
        });
        await companyjob.save();
        console.log("Job saved successfully:", companyjob._id);
        res.status(201).json({ message: "added job", job: companyjob });
    } catch (err) {
        console.error("Error posting job:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const GetAllJobs = async (req, res) => {
    try {
        const jobs = await CompanyJob.find({ company: req.company._id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching jobs" });
    }
};

const DeleteJob = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await CompanyJob.findOne({ _id: id, company: req.company._id });
        if (!job) {
            return res.status(404).json({ message: "no job found" });
        }
        await CompanyJob.findByIdAndDelete(id);
        res.json({ message: "deleted sucessfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting job" });
    }
};

const UpdateJob = async (req, res) => {
    try {
        const job = await CompanyJob.findOne({ _id: req.params.id, company: req.company._id });
        if (!job) return res.status(404).json({ message: "Job not found" });

        // Update fields if provided
        if (req.body.title) job.title = req.body.title;
        if (req.body.location) job.location = req.body.location;
        if (req.body.description) job.description = req.body.description;
        if (req.body.instructions) job.instructions = req.body.instructions;
        if (req.body.employmentType) job.employmentType = req.body.employmentType;
        if (req.body.locationType) job.locationType = req.body.locationType;
        if (req.body.stipend !== undefined) job.stipend = req.body.stipend;
        if (req.body.githubRequired !== undefined) job.githubRequired = req.body.githubRequired;
        if (req.body.portfolioRequired !== undefined) job.portfolioRequired = req.body.portfolioRequired;
        if (req.body.startDate) job.startDate = req.body.startDate;
        if (req.body.endDate) job.endDate = req.body.endDate;
        if (req.body.vacantSlots !== undefined) job.vacantSlots = req.body.vacantSlots;
        if (req.body.maxApplicants !== undefined) job.maxApplicants = req.body.maxApplicants;
        if (req.body.status) job.status = req.body.status;

        await job.save();
        res.json({ message: "Job updated successfully", job });
    } catch (err) {
        res.status(500).json({ message: "Error updating job" });
    }
};

const AcceptorRej = async (req, res) => {
    try {
        const appli = req.params.id;
        const { status } = req.body;
        const application = await Application.findById(appli);
        if (!application) return res.status(404).json({ message: "Application not found" });
        
        application.status = status;
        await application.save();  
        res.json({ message: "application updated" });
    } catch (err) {
        res.status(500).json({ message: "Error updating application" });
    }
};

// Fetch all applications for a specific job
const GetAllApplications = async (req, res) => {
  try {
    const jobId = req.params.id;
    // Deeply populate the user object to provide the Company with resume/skills data
    const applications = await Application.find({ job: jobId })
      .populate("user", "firstName lastName email phone location education skills internships resumeUrl portfolioLinks")
      .populate("job", "title");

    if (!applications.length) {
      return res.status(404).json({ message: "No applications found" });
    }

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications" });
  }
};

const GetCompanyProfile = async (req, res) => {
    try {
        res.json(req.company);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
};

module.exports = { GetAllJobs, PostJob, DeleteJob, UpdateJob, AcceptorRej, GetAllApplications, GetCompanyProfile };
