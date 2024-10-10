import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Optometrist from '../models/optometristModel.js';
import { isAuth, isAdmin } from '../utils.js';

const optometristRouter = express.Router();

// CREATE Optometrist
optometristRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { name, specialty, contact } = req.body;
    const newOptometrist = new Optometrist({ name, specialty, contact });
    const optometrist = await newOptometrist.save();
    res.status(201).send({ message: 'Optometrist Created', optometrist });
  })
);

// READ all Optometrists
optometristRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const optometrists = await Optometrist.find();
    res.send(optometrists);
  })
);

// READ single Optometrist by ID
optometristRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const optometrist = await Optometrist.findById(req.params.id);
    if (optometrist) {
      res.send(optometrist);
    } else {
      res.status(404).send({ message: 'Optometrist Not Found' });
    }
  })
);

// UPDATE Optometrist
optometristRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const optometrist = await Optometrist.findById(req.params.id);
    if (optometrist) {
      optometrist.name = req.body.name || optometrist.name;
      optometrist.specialty = req.body.specialty || optometrist.specialty;
      optometrist.contact = req.body.contact || optometrist.contact;
      const updatedOptometrist = await optometrist.save();
      res.send({ message: 'Optometrist Updated', optometrist: updatedOptometrist });
    } else {
      res.status(404).send({ message: 'Optometrist Not Found' });
    }
  })
);

// DELETE Optometrist
optometristRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const optometrist = await Optometrist.findById(req.params.id);
    if (optometrist) {
      await optometrist.remove();
      res.send({ message: 'Optometrist Deleted' });
    } else {
      res.status(404).send({ message: 'Optometrist Not Found' });
    }
  })
);

export default optometristRouter;
