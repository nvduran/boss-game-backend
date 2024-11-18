const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import Counter from "../models/Counter";
import UserAccount from "../models/UserAccount";// Assuming you have a User model

require("dotenv").config({ path: "../.env" });

// http://localhost:3420/api/user-login/register
router.post("/register", async (req:any, res:any) => {
    try {
      const {
        username,
        password,
        security_question,
        security_answer,
        patreon_email,
        display_name,
      } = req.body;
  
      // Validate required fields
      if (
        !username ||
        !password ||
        !security_question ||
        !security_answer ||
        !display_name
      ) {
        return res.status(400).json({ message: "Please fill in all required fields." });
      }
  
      // Validate display_name length
      if (display_name.length < 3 || display_name.length > 25) {
        return res.status(400).json({
          message: "Display Name must be between 3 and 25 characters.",
        });
      }
  
      // Check if username already exists
      const existingUser = await UserAccount.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists." });
      }
  
      // Check if display_name already exists
      const existingDisplayName = await UserAccount.findOne({ display_name });
      if (existingDisplayName) {
        return res.status(400).json({ message: "Display Name already taken." });
      }
  
      // Hash the password and security answer
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const hashedSecurityAnswer = await bcrypt.hash(security_answer, salt);
  
      // Create a new user
      const newUser = new UserAccount({
        username,
        password: hashedPassword,
        security_question,
        security_answer: hashedSecurityAnswer,
        patreon_email,
        display_name,
        // user_id will be assigned automatically in the pre-save hook
      });
  
      await newUser.save();
  
      res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
      console.error("Error registering user:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

// http://localhost:3420/api/user-login/login
router.post("/login", async (req:any, res:any) => {
        try {
                const { username, password } = req.body;

                // Check if user exists
                const user = await UserAccount.findOne({ username });
                if (!user) {
                        return res.status(400).json({ message: "Invalid username or password." });
                }

                // Compare passwords
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                        return res.status(400).json({ message: "Invalid username or password." });
                }

                // Generate JWT token
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

                res.json({ token, username: user.username, isPaidUser: user.isPaidUser });
        } catch (err) {
                console.error("Error logging in user:", err);
                res.status(500).json({ message: "Internal Server Error" });
        }
});

// http://localhost:3420/api/user-login/security-question
router.get("/security-question", async (req:any, res:any) => {
        console.log("security question");
        try {
                const { username } = req.query;

                // Check if user exists
                const user = await UserAccount.findOne({ username });
                if (!user) {
                        return res.status(400).json({ message: "User not found." });
                }

                // Return the security question
                res.json({ security_question: user.security_question });
        } catch (err) {
                console.error("Error fetching security question:", err);
                res.status(500).json({ message: "Internal Server Error" });
        }
});

// http://localhost:3420/api/user-login/verify-security-answer
router.post("/verify-security-answer", async (req:any, res:any) => {
        try {
                const { username, answer } = req.body;

                // Check if user exists
                const user = await UserAccount.findOne({ username });
                if (!user) {
                        return res.status(400).json({ message: "User not found." });
                }

                // Compare the provided answer with the stored hashed security answer
                const isMatch = await bcrypt.compare(answer, user.security_answer);
                if (isMatch) {
                        res.json({ isCorrect: true, message: "Security answer is correct." });
                } else {
                        res.json({ isCorrect: false, message: "Security answer is incorrect." });
                }
        } catch (err) {
                console.error("Error verifying security answer:", err);
                res.status(500).json({ message: "Internal Server Error" });
        }
});

// http://localhost:3420/api/user-login/reset-password
router.post("/reset-password", async (req:any, res:any) => {
        console.log("reset password");
        try {
                const { username, answer, newPassword } = req.body;

                // Check if user exists
                const user = await UserAccount.findOne({ username });
                if (!user) {
                        return res.status(400).json({ message: "User not found." });
                }

                // Compare the provided answer with the stored hashed security answer
                const isMatch = await bcrypt.compare(answer, user.security_answer);
                if (!isMatch) {
                        return res.status(400).json({ message: "Security answer is incorrect." });
                }

                // Hash the new password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(newPassword, salt);

                // Update the user's password in the database
                user.password = hashedPassword;
                await user.save();

                res.json({ message: "Password reset successfully!" });
        } catch (err) {
                console.error("Error resetting password:", err);
                res.status(500).json({ message: "Internal Server Error" });
        }
});

export default router;
