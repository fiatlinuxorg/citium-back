import mongoose from 'mongoose'

const constructionSiteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  country: { type: String, required: true, default: 'Italy' },
  region: { type: String, required: true, default: 'Trentino-Alto Adige' },
  city: { type: String, required: true, default: 'Trento' },
  street: { type: String, required: true },
  number: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  extension_to: { type: Date },
  impacts_road: { type: Boolean, required: true, default: false },
  impacts_sidewalk: { type: Boolean, required: true, default: false },
  impacts_cycling_lane: { type: Boolean, required: true, default: false },
  impacts_public_transport: { type: Boolean, required: true, default: false },
  size: { type: Number, required: true },
})

const ConstructionSite = mongoose.model('ConstructionSite', constructionSiteSchema)

export default ConstructionSite
