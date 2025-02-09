import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  construction_site_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConstructionSite',
    required: true,
  },
  created_at: { type: Date, required: true, default: Date.now },
})

const Subscription = mongoose.model('Subscription', subscriptionSchema)

export default Subscription
