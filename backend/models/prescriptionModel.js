import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  optometrist: { type: mongoose.Schema.Types.ObjectId, ref: 'Optometrist', required: true },
  prescriptionDetails: { type: String, required: true },
  dateIssued: { type: Date, required: true },
}, {
  timestamps: true,
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
