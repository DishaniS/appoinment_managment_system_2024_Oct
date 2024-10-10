import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Ticket from '../models/ticketModel.js';
import { isAuth, isAdmin } from '../utils.js';

const ticketRouter = express.Router();

// USER ROUTES

// User can create a new ticket
ticketRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { subject, description, priority } = req.body;
    const newTicket = new Ticket({
      subject,
      description,
      priority,
      user: req.user._id, // Automatically assign the logged-in user
    });
    const ticket = await newTicket.save();
    res.status(201).send({ message: 'Ticket Created', ticket });
  })
);

ticketRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const tickets = await Ticket.find({ user: req.user._id });
    res.send(tickets);
  })
);


// User can view their own tickets
ticketRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // Corrected backend route handler for getting a specific ticket with the user's name populated
    const ticket = await Ticket.findById(req.params.id).populate('user', 'name'); // Corrected to use req.params.id

    // Allow users to view their own tickets or allow admins to view all
    if (ticket && (ticket.user._id.toString() === req.user._id.toString() || req.user.isAdmin)) {
      res.send(ticket);
    } else {
      res.status(404).send({ message: 'Ticket Not Found' });
    }
  })
);



// ADMIN ROUTES

// Admin can view all tickets
ticketRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const tickets = await Ticket.find().populate('user', 'name'); // Populate the 'user' field with the 'name'
    res.send(tickets);
  })
);


// Admin can get details of a specific ticket by ID
ticketRouter.get(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (ticket) {
      res.send(ticket);
    } else {
      res.status(404).send({ message: 'Ticket Not Found' });
    }
  })
);

// Admin can update ticket details
ticketRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (ticket) {
      ticket.subject = req.body.subject || ticket.subject;
      ticket.description = req.body.description || ticket.description;
      ticket.priority = req.body.priority || ticket.priority;
      ticket.status = req.body.status || ticket.status;
      const updatedTicket = await ticket.save();
      res.send({ message: 'Ticket Updated', ticket: updatedTicket });
    } else {
      res.status(404).send({ message: 'Ticket Not Found' });
    }
  })
);

// Admin can delete a ticket
ticketRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (ticket) {
      await ticket.remove();
      res.send({ message: 'Ticket Deleted' });
    } else {
      res.status(404).send({ message: 'Ticket Not Found' });
    }
  })
);

// Add response to a ticket
ticketRouter.post('/:id/responses', isAuth, async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (ticket) {
    const response = {
      responder: req.user.name, // Assuming you have the user's name available
      message: req.body.message,
    };
    ticket.responses.push(response);
    await ticket.save();
    res.status(201).send({ message: 'Response added.' });
  } else {
    res.status(404).send({ message: 'Ticket Not Found' });
  }
});

export default ticketRouter;
