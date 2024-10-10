import mongoose from 'mongoose';

const optometristSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  contact: { type: String, required: true },
}, {
  timestamps: true,
});

const Optometrist = mongoose.model('Optometrist', optometristSchema);
export default Optometrist;
