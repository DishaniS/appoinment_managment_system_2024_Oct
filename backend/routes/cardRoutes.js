import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../utils.js';
import Card from '../models/cardModel.js';

const cardRouter = express.Router();

// CREATE a new card (POST)
cardRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { cardHolderName, cardNumber, expiryDate, cvv, cardType } = req.body;

    const newCard = new Card({
      user: req.user._id,
      cardHolderName,
      cardNumber,
      expiryDate,
      cvv,
      cardType,
    });

    const savedCard = await newCard.save();
    res.status(201).send({ message: 'Card Saved', card: savedCard });
  })
);

// READ (GET) all cards for the authenticated user
cardRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const cards = await Card.find({ user: req.user._id });
    res.send(cards);
  })
);

// READ (GET) a single card by ID
cardRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);
    if (card && card.user.toString() === req.user._id.toString()) {
      res.send(card);
    } else {
      res.status(404).send({ message: 'Card Not Found' });
    }
  })
);

// UPDATE a card (PUT)
cardRouter.put(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);
    if (card && card.user.toString() === req.user._id.toString()) {
      card.cardHolderName = req.body.cardHolderName || card.cardHolderName;
      card.cardNumber = req.body.cardNumber || card.cardNumber;
      card.expiryDate = req.body.expiryDate || card.expiryDate;
      card.cvv = req.body.cvv || card.cvv;
      card.cardType = req.body.cardType || card.cardType;

      const updatedCard = await card.save();
      res.send({ message: 'Card Updated', card: updatedCard });
    } else {
      res.status(404).send({ message: 'Card Not Found' });
    }
  })
);

// DELETE a card (DELETE)
cardRouter.delete(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);
    if (card && card.user.toString() === req.user._id.toString()) {
      await card.remove();
      res.send({ message: 'Card Deleted' });
    } else {
      res.status(404).send({ message: 'Card Not Found' });
    }
  })
);

export default cardRouter;
