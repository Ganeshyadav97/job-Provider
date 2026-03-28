const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    // Authentication details (kept as-is)
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    
    // Personal Details
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },

    // Education Details (B.Tech etc.)
    education: [{
        college: { type: String },
        degree: { type: String }, // e.g., B.Tech, B.E.
        stream: { type: String }, // e.g., Computer Science
        startYear: { type: String },
        endYear: { type: String },
        performanceScale: { type: String }, // e.g., CGPA or Percentage
        performance: { type: String }
    }],

    // Internships / Work Experience
    internships: [{
        profile: { type: String }, // e.g., "Software Developer Intern"
        organization: { type: String },
        location: { type: String },
        workFromHome: { type: Boolean, default: false },
        startDate: { type: Date },
        endDate: { type: Date },
        currentlyWorking: { type: Boolean, default: false },
        description: { type: String }
    }],

    // Skills
    skills: [{
        type: String,
        trim: true
    }],

    // Resume / Document upload
    resumeUrl: {
        type: String, // Path or URL to the uploaded resume
        trim: true
    },
    
    // Additional Portfolio links (GitHub, LinkedIn, etc.)
    portfolioLinks: {
        github: { type: String },
        linkedin: { type: String },
        portfolio: { type: String }
    },

    // Student Verification
    isStudentVerified: {
        type: Boolean,
        default: false
    },
    studentIdCardUrl: {
        type: String,
        trim: true
    },
    graduationYear: {
        type: String,
        trim: true
    },
    profileCompletion: {
        type: Number,
        default: 90
    },
    // User Preferences / Interests
    preferences: {
        employmentType: { type: String, enum: ['Full-time', 'Internship', 'Both'], default: 'Both' },
        locationType: { type: String, enum: ['Remote', 'Office', 'Hybrid', 'Any'], default: 'Any' }
    }
}, { timestamps: true })
module.exports=mongoose.model('User',userSchema);