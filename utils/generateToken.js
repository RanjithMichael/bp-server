import jwt from "jsonwebtoken";

// Generate an access token (short-lived)
 
export const generateAccessToken = (id, extraPayload = {}) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ id, ...extraPayload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m", // short-lived
  });
};

// Generate a refresh token (long-lived)
 
export const generateRefreshToken = (id, extraPayload = {}) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }
  return jwt.sign({ id, ...extraPayload }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d", // long-lived
  });
};

// Utility: generate both tokens together
 
export const generateTokens = (id, extraPayload = {}) => {
  const accessToken = generateAccessToken(id, extraPayload);
  const refreshToken = generateRefreshToken(id, extraPayload);
  return { accessToken, refreshToken };
};
