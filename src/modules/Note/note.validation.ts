import { z } from 'zod';

const createNoteZodSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.any().refine((val) => val !== undefined && val !== null, {
      message: 'Content is required',
    }),
  }),
});




const updateNoteZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.any().optional(),
  }),
});


export const NoteValidation = {
  createNoteZodSchema,
  updateNoteZodSchema,
};
