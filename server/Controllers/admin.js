const User=require("../models/User");
const bcrypt=require("bcryptjs");
const Company=require('../models/Company')
const CreateUser=async(req,res)=>{
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
//update User
//get data from params using findbyidandupdate we can update the user

const UpdateUser=async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: 'User updated', updated });
};


//delete the user
const DeleteUser=async(req,res)=>{
    const id=req.params.id;
    const existUser=await User.findById(id);
    if(!existUser){
        res.json({message:"No user exists"})
    }
    User.deleteOne({_id:id})
    res.json({message:"deleted"})
}

//get all user details;

const GetallUsers=async(req,res)=>{
    const user=await User.find();
    res.json(user)
}
/*if(!name||!email||!password||!location){
        req.status(401).json({message:"Provide all the details correctly"})
    } */
const CreateCompany = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    console.log(email, password);

    // Validate all fields
    if (!name || !email || !password || !location) {
      return res.status(400).json({ message: "Provide all the details correctly" });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Save company
    const company = new Company({ name, email, password: hashed, location });
    await company.save();

    res.status(201).json({ message: "Company registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const GetallCompanys=async (req, res)=>{
  const companies = await Company.find();
  res.json(companies);
};
const UpdateCompany= async (req, res) => {
  const updated = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: 'Company updated', updated });
}
const DeleteCompany=async (req, res) => {
  await Company.findByIdAndDelete(req.params.id);
  res.json({ message: 'Company deleted' });
};
module.exports={GetallCompanys,GetallUsers,UpdateUser,UpdateCompany,DeleteCompany,DeleteUser,CreateCompany,CreateUser}
