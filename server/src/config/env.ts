import dotenv from 'dotenv'
dotenv.config()

export const env = {
  port: parseInt(process.env.PORT || '4000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Razorpay
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',

  // Digio KYC
  digioClientId: process.env.DIGIO_CLIENT_ID || '',
  digioClientSecret: process.env.DIGIO_CLIENT_SECRET || '',
  digioBaseUrl: process.env.DIGIO_BASE_URL || 'https://api.digio.in',

  // Leegality eSign
  leegalityApiKey: process.env.LEEGALITY_API_KEY || '',
  leegalityBaseUrl: process.env.LEEGALITY_BASE_URL || 'https://api.leegality.com',

  // AWS S3
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  s3Bucket: process.env.S3_BUCKET || 'localstake-uploads',

  // Resend
  resendApiKey: process.env.RESEND_API_KEY || '',
}
