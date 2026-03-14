import mongoose from 'mongoose'

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/chasequiz'
  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection failed:', err)
    process.exit(1)
  }
}
