require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((error) => console.log("MongoDB error:", error.message));

  const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Authentication server is working!");
});


app.post("/signup", async (req,res) => {
    try {
    const { email, password} =req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
        });
    }

    if (typeof email !== "string" || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "enter a valid email and a password of at least 8 characters",
      });
    }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return res.status(400).json({
    message: "Please enter a valid email address",
  });
}

        const existingUser = await User.findOne({ 
          email: email.toLocaleLowerCase().trim(),
        });

if (existingUser) {
  return res.status(409).json({
    message: "Email already registered",
  });
}
    
    const hashedPassword = await bcrypt.hash(password, 12);
     await User.create({
        email: email.toLocaleLowerCase().trim(),
        password: hashedPassword,
     });

    res.status(201).json({
      message: "Account created successfully!",
    });

  } catch (error) {
    console.log("Signup error:", error.message);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.post("/login" , async (req, res) => {
  try{
    const { email, password} = req.body;

    if( !email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (typeof email !== "string" || typeof password !=="string"){
      return res.status(400).json({
        message:"Email and password must be text",
      });
    }
      const user= await User.findOne({
        email: email.toLocaleLowerCase().trim(),
      });

      if (!user){
        return res.status(401).json({
          message: "Invalid email or password",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h"}

    );
      res.status(200).json({
        message: "Login successful!",
        token: token,
      });

  } catch (error){
    console.log("Login error:", error.message);

    res.status(500).json({
      message: "Something went wrong",
    });
  }

});

app.get("/profile", (req,res) => {
  const token= req.headers.authorization?.split(" ")[1];

  if (!token){
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      message: "Welcome to your protected profile!",
      userId: decoded.userId,
    });
  } catch (error){
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});