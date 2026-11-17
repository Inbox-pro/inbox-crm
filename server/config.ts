import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexus_crm',
  jwtSecret: process.env.JWT_SECRET || 'nexus_crm_jwt_super_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  saltRounds: 10,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
};
