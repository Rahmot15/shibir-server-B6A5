import { z } from 'zod';

const noteContentSchema = z
  .union([z.record(z.string(), z.unknown()), z.array(z.unknown())])
  .refine((val) => val !== null && val !== undefined, {
    message: 'Content is required',
  });

const createNoteZodSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required'),
    content: noteContentSchema,
  }),
});




const updateNoteZodSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').optional(),
    content: noteContentSchema.optional(),
  }),
});


export const NoteValidation = {
  createNoteZodSchema,
  updateNoteZodSchema,
};
