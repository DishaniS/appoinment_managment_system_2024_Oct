import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  optometrist: { type: mongoose.Schema.Types.ObjectId, ref: 'Optometrist', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // Example: "10:00 AM - 11:00 AM"
  subject: { type: String, required: true },
  status: { type: String, default: 'Pending' },
}, {
  timestamps: true,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
