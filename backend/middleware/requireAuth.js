import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";


// Check if user is authenticated
const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "No Authorization token" });
    }
    const token = authorization.split(" ")[1]; // Grab the JWT
    console.log(token);
    
    try {
        const {_id} = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(_id).select("_id"); // adds the user prop to the request
        next(); // Go to next middleware
    } catch (error) {
        console.log(error);
       res.status(401).json({ error: "Request is not authorized" }); 
    }
}

export default requireAuth;