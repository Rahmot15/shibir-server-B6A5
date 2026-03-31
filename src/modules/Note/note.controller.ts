import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import { NoteService } from './note.service.js';


const createNote = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await NoteService.createNote(user.id, req.body);

  res.status(status.OK).json({
    success: true,
    message: 'Note created successfully',
    data: result,
  });
});

const getAllNotes = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await NoteService.getAllNotes(user.id);

  res.status(status.OK).json({
    success: true,
    message: 'Notes fetched successfully',
    data: result,
  });
});

const getSingleNote = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await NoteService.getSingleNote(user.id, req.params.id as string);

  res.status(status.OK).json({
    success: true,
    message: 'Note fetched successfully',
    data: result,
  });
});

const updateNote = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await NoteService.updateNote(user.id, req.params.id as string, req.body);

  res.status(status.OK).json({
    success: true,
    message: 'Note updated successfully',
    data: result,
  });
});

const deleteNote = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await NoteService.deleteNote(user.id, req.params.id as string);

  res.status(status.OK).json({
    success: true,
    message: 'Note deleted successfully',
    data: result,
  });
});

export const NoteController = {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
};
