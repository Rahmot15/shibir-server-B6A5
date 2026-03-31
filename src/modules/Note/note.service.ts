import { Note, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';


const createNote = async (userId: string, data: Prisma.NoteCreateInput): Promise<Note> => {
  const result = await prisma.note.create({
    data: {
      ...data,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
  return result;
};

const getAllNotes = async (userId: string): Promise<Note[]> => {
  const result = await prisma.note.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  return result;
};

const getSingleNote = async (userId: string, id: string): Promise<Note | null> => {
  const result = await prisma.note.findUnique({
    where: {
      id,
      userId, // Ensure ownership
    },
  });
  return result;
};

const updateNote = async (
  userId: string,
  id: string,
  data: Prisma.NoteUpdateInput
): Promise<Note> => {
  const result = await prisma.note.update({
    where: {
      id,
      userId, // Ensure ownership
    },
    data,
  });
  return result;
};

const deleteNote = async (userId: string, id: string): Promise<Note> => {
  const result = await prisma.note.delete({
    where: {
      id,
      userId, // Ensure ownership
    },
  });
  return result;
};

export const NoteService = {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
};
