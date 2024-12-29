import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
    const { email, fullName, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters" });
        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const user = await User.create({
            email,
            fullName,
            password,
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid User Data" });
        }

        generateToken(user._id, res);
        await user.save();

        return res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error while Signing up: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Invalid Credentials!" });
        }

        if (!(await user.isPasswordCorrect(password))) {
            return res.status(401).json({ message: "Incorrect Password!" });
        }

        generateToken(user._id, res);

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error while Signing in: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({ message: "Logged out Successfully!" });
    } catch (error) {
        console.log("Error while Logging out: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile Pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error while Updating Profile Pic: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.log("Error while checking Auth: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};