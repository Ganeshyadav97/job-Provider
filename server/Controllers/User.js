const User=require("../models/User");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const Company = require("../models/Company");
const SignUp=async(req,res)=>{
        const { email, password } = req.body;
        console.log(email,password)
        //check if email or password is missing
        if (!email || !password) {
            return res.status(400).json({ message: "all fields are required" });
        }
    
        //check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "user already exists" });
        }
    
        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        //saving into db
        const user = new User({
            email,
            password: hashedPassword
        });
        await user.save(); // <-- fixed missing parentheses
    
        res.status(201).json({ message: "user registered successfully" });
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
