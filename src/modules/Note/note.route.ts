import express from 'express';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { NoteController } from './note.controller.js';
import { NoteValidation } from './note.validation.js';
import { Role } from '@prisma/client';


const router = express.Router();

router.post(
  '/',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  validateRequest(NoteValidation.createNoteZodSchema),
  NoteController.createNote
);

router.get(
  '/',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  NoteController.getAllNotes
);

router.get(
  '/:id',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  NoteController.getSingleNote
);

router.patch(
  '/:id',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  validateRequest(NoteValidation.updateNoteZodSchema),
  NoteController.updateNote
);

router.delete(
  '/:id',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  NoteController.deleteNote
);

export const NoteRoutes = router;

