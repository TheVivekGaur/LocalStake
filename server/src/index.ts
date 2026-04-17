import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'

// Routes
import authRoutes from './routes/auth'
import kycRoutes from './routes/kyc'
import listingRoutes from './routes/listings'
import businessRoutes from './routes/businesses'
import investmentRoutes from './routes/investments'
import payoutRoutes from './routes/payouts'
import adminRoutes from './routes/admin'
import documentRoutes from './routes/documents'
import notificationRoutes from './routes/notifications'
import webhookRoutes from './routes/webhooks'

const app = express()

// ─── Middleware ───────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}))
app.use(morgan('dev'))
app.use(cookieParser())

// Webhooks need raw body for signature verification
app.use('/api/webhooks', express.json({ limit: '1mb' }))

// Regular JSON parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Static file serving for uploads
app.use('/uploads', express.static('uploads'))

// ─── Health check ────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── API Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/kyc', kycRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/businesses', businessRoutes)
app.use('/api/investments', investmentRoutes)
app.use('/api/payouts', payoutRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/webhooks', webhookRoutes)

// ─── Error handler ───────────────────────────────────────
app.use(errorHandler)

// ─── Start server ────────────────────────────────────────
app.listen(env.port, () => {
  console.log(`🚀 LocalStake API running on http://localhost:${env.port}`)
  console.log(`📋 Environment: ${env.nodeEnv}`)
})

export default app
