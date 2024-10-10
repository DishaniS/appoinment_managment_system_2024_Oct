import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Appointment from '../models/appointmentModel.js';
import Optometrist from '../models/optometristModel.js';
import { isAuth, isAdmin } from '../utils.js';

const appointmentRouter = express.Router();

// CREATE Appointment
appointmentRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { patientName, optometrist, date, timeSlot, subject } = req.body;

    // Check if the selected optometrist exists
    const optometristExists = await Optometrist.findById(optometrist);
    if (!optometristExists) {
      return res.status(404).send({ message: 'Optometrist Not Found' });
    }

    const newAppointment = new Appointment({
      patientName,
      optometrist: optometristExists._id, // Use the optometrist ID directly
      date,
      timeSlot,
      subject,
      status: 'Pending',
      user: req.user._id, // Assign the user who is creating the appointment
    });

    const appointment = await newAppointment.save();
    res.status(201).send({ message: 'Appointment Created', appointment });
  })
);

// READ Appointments - Admin can view all, patients can view only their appointments
appointmentRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    let appointments;
    if (req.user.isAdmin) {
      appointments = await Appointment.find().populate('optometrist', 'name');
    } else {
      appointments = await Appointment.find({ user: req.user._id }).populate('optometrist', 'name');
    }
    res.send(appointments);
  })
);

// READ single Appointment by ID
appointmentRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ message: 'Invalid Appointment ID' });
    }

    const appointment = await Appointment.findById(req.params.id).populate('optometrist', 'name');

    // Allow patients to view their own appointments or allow admins to view all
    if (appointment && (appointment.user && appointment.user.toString() === req.user._id.toString() || req.user.isAdmin)) {
      res.send(appointment);
    } else {
      res.status(404).send({ message: 'Appointment Not Found' });
    }
  })
);

// UPDATE Appointment (Admin Only)
appointmentRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ message: 'Invalid Appointment ID' });
    }

    const appointment = await Appointment.findById(req.params.id).populate('optometrist');
    if (appointment) {
      appointment.patientName = req.body.patientName || appointment.patientName;
      appointment.optometrist = req.body.optometrist || appointment.optometrist._id; // Handle optometrist update
      appointment.date = req.body.date || appointment.date;
      appointment.timeSlot = req.body.timeSlot || appointment.timeSlot;
      appointment.subject = req.body.subject || appointment.subject;
      appointment.status = req.body.status || appointment.status;
      const updatedAppointment = await appointment.save();
      res.send({ message: 'Appointment Updated', appointment: updatedAppointment });
    } else {
      res.status(404).send({ message: 'Appointment Not Found' });
    }
  })
);

// DELETE Appointment (Admin Only)
appointmentRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ message: 'Invalid Appointment ID' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (appointment) {
      await appointment.remove();
      res.send({ message: 'Appointment Deleted' });
    } else {
      res.status(404).send({ message: 'Appointment Not Found' });
    }
  })
);

// User-specific appointments
appointmentRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ user: req.user._id }).populate('optometrist', 'name');
    if (appointments) {
      res.send(appointments);
    } else {
      res.status(404).send({ message: 'No Appointments Found' });
    }
  })
);

export default appointmentRouter;
