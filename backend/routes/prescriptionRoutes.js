import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Prescription from '../models/prescriptionModel.js';
import Optometrist from '../models/optometristModel.js';
import { isAuth, isAdmin } from '../utils.js';

const prescriptionRouter = express.Router();

// CREATE Prescription
prescriptionRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { patientName, optometrist, prescriptionDetails, dateIssued } = req.body;
    const optometristExists = await Optometrist.findById(optometrist);
    if (!optometristExists) {
      return res.status(404).send({ message: 'Optometrist Not Found' });
    }
    const newPrescription = new Prescription({
      patientName,
      optometrist,
      prescriptionDetails,
      dateIssued,
    });
    const prescription = await newPrescription.save();
    res.status(201).send({ message: 'Prescription Created', prescription });
  })
);

// READ all Prescriptions
prescriptionRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const prescriptions = await Prescription.find().populate('optometrist', 'name');
    res.send(prescriptions);
  })
);

// READ single Prescription by ID
prescriptionRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const prescription = await Prescription.findById(req.params.id).populate('optometrist', 'name');
    if (prescription) {
      res.send(prescription);
    } else {
      res.status(404).send({ message: 'Prescription Not Found' });
    }
  })
);

// UPDATE Prescription
prescriptionRouter.put(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const prescription = await Prescription.findById(req.params.id);
    if (prescription) {
      prescription.patientName = req.body.patientName || prescription.patientName;
      prescription.optometrist = req.body.optometrist || prescription.optometrist;
      prescription.prescriptionDetails = req.body.prescriptionDetails || prescription.prescriptionDetails;
      prescription.dateIssued = req.body.dateIssued || prescription.dateIssued;
      
      try {
        const updatedPrescription = await prescription.save();
        res.send({ message: 'Prescription Updated', prescription: updatedPrescription });
      } catch (error) {
        res.status(500).send({ message: 'Error updating prescription', error: error.message });
      }
    } else {
      res.status(404).send({ message: 'Prescription Not Found' });
    }
  })
);


// DELETE Prescription
prescriptionRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const prescription = await Prescription.findById(req.params.id);
    if (prescription) {
      await prescription.remove();
      res.send({ message: 'Prescription Deleted' });
    } else {
      res.status(404).send({ message: 'Prescription Not Found' });
    }
  })
);

export default prescriptionRouter;
