import jwt from "jsonwebtoken";

const generateToken = (id, extraPayload = {}) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    { id, ...extraPayload }, // include optional claims
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d", // configurable expiry
    }
  );
};

export default generateToken;

