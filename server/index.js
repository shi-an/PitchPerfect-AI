import express from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pitchperfect'
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const PORT = process.env.PORT || 4000
const DEV = process.env.NODE_ENV !== 'production'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  plan: { type: String, enum: ['FREE', 'PRO', 'ENTERPRISE'], default: 'FREE' },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
  savedStartups: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true }
  }],
  defaultStartupId: { type: String },
  defaultPersonaId: { type: String }
}, { timestamps: true })

const messageSchema = new mongoose.Schema({
  id: String,
  role: { type: String, enum: ['user', 'model'] },
  text: String,
  interestChange: Number
}, { _id: false })

const reportSchema = new mongoose.Schema({
  score: Number,
  feedback: String,
  funding_decision: { type: String, enum: ['Funded', 'Passed', 'Ghosted'] },
  strengths: [String],
  weaknesses: [String]
}, { _id: false })

const sessionSchema = new mongoose.Schema({
  id: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  startup: {
    name: String,
    description: String
  },
  persona: {
    id: String,
    name: String,
    role: String,
    description: String,
    style: String,
    icon: String,
    color: String
  },
  messages: [messageSchema],
  score: Number,
  interestTrajectory: [Number],
  report: reportSchema,
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
const PitchSession = mongoose.model('PitchSession', sessionSchema)

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'unauthorized' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'unauthorized' })
  }
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'invalid_input' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'email_exists' })
    const passwordHash = await bcrypt.hash(password, 10)
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    const user = await User.create({ name, email, passwordHash, avatar })
    const token = jwt.sign({ id: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar, plan: user.plan } })
  } catch (e) {
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'invalid_input' })
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'invalid_credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
    const token = jwt.sign({ id: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar, plan: user.plan } })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ error: 'not_found' })
  res.json({ id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar, plan: user.plan })
})

app.post('/api/auth/reset/request', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.json({ ok: true })
    const token = crypto.randomBytes(24).toString('hex')
    user.resetToken = token
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000)
    await user.save()
    if (DEV) console.log('Password reset token:', token)
    res.json({ ok: true, token: DEV ? token : undefined })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/auth/reset/confirm', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ error: 'invalid_input' })
    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: new Date() } })
    if (!user) return res.status(400).json({ error: 'invalid_token' })
    user.passwordHash = await bcrypt.hash(password, 10)
    user.resetToken = undefined
    user.resetTokenExpires = undefined
    await user.save()
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/user/config', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'not_found' })
    const defaultStartup = user.savedStartups?.find(s => s.id === user.defaultStartupId) || null
    res.json({ savedStartup: defaultStartup, defaultPersonaId: user.defaultPersonaId || null, defaultStartupId: user.defaultStartupId || null })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/user/config', authMiddleware, async (req, res) => {
  try {
    const { savedStartup, defaultPersonaId } = req.body || {}
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'not_found' })
    if (typeof defaultPersonaId === 'string') {
      user.defaultPersonaId = defaultPersonaId
    }
    if (savedStartup && typeof savedStartup.name === 'string' && typeof savedStartup.description === 'string') {
      const id = crypto.randomBytes(8).toString('hex')
      user.savedStartups = user.savedStartups || []
      user.savedStartups.push({ id, name: savedStartup.name, description: savedStartup.description })
      user.defaultStartupId = id
    }
    await user.save()
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/user/startups', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'not_found' })
    res.json({ items: user.savedStartups || [], defaultStartupId: user.defaultStartupId || null })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/user/startups', authMiddleware, async (req, res) => {
  try {
    const { id, name, description } = req.body || {}
    if (!name || !description) return res.status(400).json({ error: 'invalid_input' })
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'not_found' })
    user.savedStartups = user.savedStartups || []
    if (id) {
      const idx = user.savedStartups.findIndex(s => s.id === id)
      if (idx >= 0) {
        user.savedStartups[idx].name = name
        user.savedStartups[idx].description = description
      } else {
        user.savedStartups.push({ id, name, description })
      }
    } else {
      const newId = crypto.randomBytes(8).toString('hex')
      user.savedStartups.push({ id: newId, name, description })
      user.defaultStartupId = newId
    }
    await user.save()
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

app.delete('/api/user/startups/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'not_found' })
    user.savedStartups = (user.savedStartups || []).filter(s => s.id !== id)
    if (user.defaultStartupId === id) {
      user.defaultStartupId = user.savedStartups[0]?.id || null
    }
    await user.save()
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/user/startups/default', authMiddleware, async (req, res) => {
  try {
    const { id } = req.body || {}
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'not_found' })
    const exists = (user.savedStartups || []).some(s => s.id === id)
    if (!exists) return res.status(400).json({ error: 'invalid_id' })
    user.defaultStartupId = id
    await user.save()
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/sessions', authMiddleware, async (req, res) => {
  const sessions = await PitchSession.find({ userId: req.user.id }).sort({ createdAt: -1 })
  const mapped = sessions.map(s => ({
    id: s.id,
    userId: req.user.id,
    date: s.date,
    startup: s.startup,
    persona: s.persona,
    messages: s.messages,
    score: s.score,
    interestTrajectory: s.interestTrajectory,
    report: s.report,
    isCompleted: !!s.isCompleted
  }))
  res.json(mapped)
})

app.post('/api/sessions', authMiddleware, async (req, res) => {
  const payload = req.body
  const existing = await PitchSession.findOne({ id: payload.id, userId: req.user.id })
  const doc = existing ? Object.assign(existing, payload) : new PitchSession({ ...payload, userId: req.user.id })
  await doc.save()
  res.json({ ok: true })
})

const connectWithTimeout = (ms) => {
  return new Promise((resolve, reject) => {
    let done = false
    mongoose.connect(MONGO_URI).then(() => {
      if (done) return
      done = true
      resolve({ ok: true, uri: MONGO_URI })
    }).catch(err => {
      if (done) return
      done = true
      reject(err)
    })
    setTimeout(() => {
      if (done) return
      done = true
      reject(new Error('timeout'))
    }, ms)
  })
}

const start = async () => {
  let connected = false
  try {
    const result = await connectWithTimeout(2000)
    connected = true
    console.log('Mongo connected:', result.uri)
  } catch {
    try { await mongoose.disconnect() } catch {}
    const mem = await MongoMemoryServer.create()
    const uri = mem.getUri()
    await mongoose.connect(uri)
    connected = true
    console.log('Mongo connected in memory')
  }
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
  })
}

start()
