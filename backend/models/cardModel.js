import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardHolderName: { type: String, required: true },
    cardNumber: { type: String, required: true },
    expiryDate: { type: String, required: true }, // format MM/YY
    cvv: { type: String, required: true },
    cardType: { type: String, required: true }, // e.g., Visa, MasterCard, etc.
  },
  {
    timestamps: true,
  }
);

const Card = mongoose.model('Card', cardSchema);
export default Card;
