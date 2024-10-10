import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import DigitalLibrary from '../models/digitalLibraryModel.js';
import { isAuth, isAdmin } from '../utils.js';

const digitalLibraryRouter = express.Router();

// CREATE a digital library resource
digitalLibraryRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { title, description, author, image, resourceFile, datePublished } = req.body;

    // Extract URLs if image and resourceFile are objects (e.g., from Cloudinary response)
    const imageUrl = typeof image === 'object' ? image.secure_url || image.url : image;
    const resourceFileUrl = typeof resourceFile === 'object' ? resourceFile.secure_url || resourceFile.url : resourceFile;

    const newResource = new DigitalLibrary({
      title,
      description,
      author,
      image: imageUrl,
      resourceFile: resourceFileUrl,
      datePublished,
    });

    const resource = await newResource.save();
    res.status(201).send({ message: 'Digital Library Resource Created', resource });
  })
);

// READ all digital library resources
digitalLibraryRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const resources = await DigitalLibrary.find();
    res.send(resources);
  })
);

// READ a single digital library resource by ID
digitalLibraryRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const resource = await DigitalLibrary.findById(req.params.id);
    if (resource) {
      res.send(resource);
    } else {
      res.status(404).send({ message: 'Resource Not Found' });
    }
  })
);

// UPDATE a digital library resource
digitalLibraryRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const resource = await DigitalLibrary.findById(req.params.id);
    if (resource) {
      resource.title = req.body.title || resource.title;
      resource.description = req.body.description || resource.description;
      resource.author = req.body.author || resource.author;
      resource.image = typeof req.body.image === 'object' ? req.body.image.secure_url || req.body.image.url : req.body.image || resource.image;
      resource.resourceFile = typeof req.body.resourceFile === 'object' ? req.body.resourceFile.secure_url || req.body.resourceFile.url : req.body.resourceFile || resource.resourceFile;
      resource.datePublished = req.body.datePublished || resource.datePublished;

      const updatedResource = await resource.save();
      res.send({ message: 'Digital Library Resource Updated', resource: updatedResource });
    } else {
      res.status(404).send({ message: 'Resource Not Found' });
    }
  })
);

// DELETE a digital library resource
digitalLibraryRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const resource = await DigitalLibrary.findById(req.params.id);
    if (resource) {
      await resource.remove();
      res.send({ message: 'Digital Library Resource Deleted' });
    } else {
      res.status(404).send({ message: 'Resource Not Found' });
    }
  })
);

export default digitalLibraryRouter;
