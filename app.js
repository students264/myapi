const express=require('express') 
const path=require('path')
const helmet=require('helmet')
const app=express()
const port=4000
const mongoose=require('mongoose')
const cookieparser=require('cookie-parser')
const bcrypt=require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const {Authentication}=require("./middleware")
app.use(express.urlencoded({extended:true}))
app.use(cookieparser())
app.use(helmet())
mongoose.connect("mongodb://127.0.0.1:27017/api-data")
.then(()=>console.log("mongodb conected"))
.catch((err)=>console.log("mongodb error",err))
const userSchema = new mongoose.Schema({
    name:String,
    email: String,
    password: String
  },{timestamps:true})
  const User = mongoose.model('User', userSchema);
  const Schema = new mongoose.Schema({
    name:String,
    course:String,
    section:String,
    country:String,
  },{timestamps:true})
  const data = mongoose.model('data', Schema);
app.set('view engine','ejs')
app.set('views',path.resolve(__dirname,'views'))
app.get('/api/user',(req,res)=>{
    return res.render("register")
})
app.get('/api/signin',(req,res)=>{
    return res.render("login")
})
app.get("/api/users/data",Authentication,async(req,res)=>{
    const result=await data.find({})
    return res.json({result})
})
app.post('/api/register', async (req, res) => {
    const { name,email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).send("Email already in use.");
    }
    const saltRounds = 10; 
  bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error registering user.');
    }
    const newUser = new User({
      name:name,
      email: email,
      password: hashedPassword,
    });
    console.log(newUser)
    res.redirect("/api/user")
})
})
app.post("/api/login",async(req,res)=>{
    const {email, password } = req.body;
    const result=await User.findOne({email:email})
    if(result){
        bcrypt.compare(password,result.password,(err,match)=>{
            if(match){
                const secret=uuid()
                res.cookie("user",secret,{ maxAge: 60 * 60 * 1000, httpOnly: true })
                return res.redirect("/api/user")
            }
            else{
                return res.render("Found")
            }
        })
    }
    else{
        return res.render("login")
    }
}) 
app.listen(port,(err)=>{
    if(err){
        console.log("error",err)
    }
    else{
        console.log(`server start on port ${port}`)
    }
})