// lib/validations.ts
import { z } from "zod";

export const BetSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm requis"),
  amount: z.preprocess(
    (val) => Number(val), 
    z.number().min(1, "La mise minimale est de 1 ₪")
  ),
});

export const CreateCourseSchema = z.object({
  subject: z.string().min(2, "Le nom de la matière est requis"),
  professor: z.string().min(2, "Le nom du professeur est requis"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Heure invalide"),
});

export const CreateUserSchema = z.object({
  name: z.string().min(2, "Le nom est trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"), // Ajoute cette ligne
  initialBalance: z.preprocess((val) => Number(val), z.number().min(0, "Le solde doit être positif")),
});