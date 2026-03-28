const User=require("../models/User");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const Company = require("../models/Company");

// Helper to validate degree duration
const isValidDuration = (degree, startYear, endYear) => {
    if (!startYear || !endYear) return true; // Skip if years are missing
    
    const start = parseInt(startYear);
    const end = parseInt(endYear);
    if (isNaN(start) || isNaN(end) || start >= end) return false;
    
    const duration = end - start;
    const deg = (degree || "").toLowerCase();
    
    // Core duration rules
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
    
    // If degree is unknown or empty but years exist, assume standard 2-4
    return duration >= 2 && duration <= 5;
};

const SignUp = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, location, education, internships, skills, portfolioLinks } = req.body;
        
        console.log("Signup Request Body:", req.body);
        console.log("Uploaded File:", req.file);

        //check if email or password is missing
        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }
    
        //check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "user already exists" });
        }
    
        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Handle path for uploaded resume
        let resumeUrl = "";
        if (req.file) {
            resumeUrl = `/uploads/${req.file.filename}`;
        }
        
        // Parse JSON strings back into arrays/objects (since FormData sends them as strings)
        let parsedEducation = [];
        let parsedInternships = [];
        let parsedSkills = [];
        let parsedPortfolio = {};

        try {
            if (education) parsedEducation = JSON.parse(education);
            if (internships) parsedInternships = JSON.parse(internships);
            if (skills) parsedSkills = JSON.parse(skills);
            if (portfolioLinks) parsedPortfolio = JSON.parse(portfolioLinks);
        } catch (err) {
            console.error("Error parsing JSON fields:", err);
            // Non-critical, we can continue or return error
            // Allow them to be empty if JSON parsing fails
        }

        // Validate graduation duration if education is provided
        if (parsedEducation.length > 0) {
            const edu = parsedEducation[0];
            if (!isValidDuration(edu.degree, edu.startYear, edu.endYear)) {
                return res.status(400).json({ 
                    message: `Invalid graduation duration. The difference between Start Year (${edu.startYear}) and End Year (${edu.endYear}) is not mathematically valid for the specified degree (${edu.degree || 'provided course'}).` 
                });
            }
        }

        //saving into db
        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            location,
            education: parsedEducation,
            internships: parsedInternships,
            skills: parsedSkills,
            resumeUrl,
            portfolioLinks: parsedPortfolio,
            preferences: req.body.preferences ? JSON.parse(req.body.preferences) : {
                employmentType: 'Both',
                locationType: 'Any'
            }
        });
        
        await user.save();
    
        res.status(201).json({ message: "user registered successfully", user: { email: user.email, id: user._id } });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal server error during signup" });
    }
}


//login


const Login=async(req,res)=>{
    const { email, password } = req.body;
    
        //find user by email
        const existUser = await User.findOne({ email }); // <-- fixed missing await
        if (!existUser) {
            return res.status(404).json({ message: "user not found" });
        }
    
        //compare entered password with hashed password in DB
        const isMatch = await bcrypt.compare(password, existUser.password); // <-- fixed await & argument
        if (!isMatch) {
            return res.status(400).json({ message: "invalid password" });
        }
    
        //generate JWT token
        const token = jwt.sign({ userId: existUser._id }, 'MY_SECRET_KEY', { expiresIn: '1h' });
    
        //send token and success message
        res.json({ token, message: "User logged in successfully" });
}

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

const AdminAuth = async (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ email: ADMIN_EMAIL }, "MY_SECRET_KEY", { expiresIn: "1d" });
  res.json({ token, email: ADMIN_EMAIL });
  console.log("Admin Token:", token);
};

const CompanyAuth=async(req,res)=>{
    const {email,password}=req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "all fields are required" });
    }
            //find user by email
        const existCompany = await Company.findOne({ email }); // <-- fixed missing await
        if (!existCompany ) {
            return res.status(404).json({ message: "user not found" });
        }
    
        //compare entered password with hashed password in DB
        const isMatch = await bcrypt.compare(password, existCompany.password); // <-- fixed await & argument
        if (!isMatch) {
            return res.status(400).json({ message: "invalid password" });
        }
    
        //generate JWT token
        const token = jwt.sign({ companyId: existCompany._id }, 'MY_SECRET_KEY', { expiresIn: '1h' });
    
        //send token and success message
        res.json({ token, message: "Company logged in successfully" });

}
module.exports={SignUp,Login,AdminAuth,CompanyAuth}
