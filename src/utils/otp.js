import crypto from "crypto";
import bcrypt from "bcrypt";

const generateOtp = () => {
    const otp = crypto.randomInt(100000, 999999).toString();    
    return otp;
};

const hashedOtp = async (otp) => {
    return await bcrypt.hash(otp, 10);
};

export { generateOtp, hashedOtp };