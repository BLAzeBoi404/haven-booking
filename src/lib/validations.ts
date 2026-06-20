import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Імʼя занадто коротке").max(80, "Максимум 80 символів"),
    email: z.string().email("Невірний формат email"),
    password: z.string().min(6, "Мінімум 6 символів").max(100),
    role: z.enum(["CLIENT", "PROVIDER"]),
    country: z.string().max(60).optional(),
    city: z.string().max(60).optional(),
    legalType: z.string().max(40).optional(),
    taxId: z.string().max(40).optional(),
  })
  .refine(
    (d) => d.role !== "PROVIDER" || (d.country && d.city ? true : false),
    { message: "Вкажіть країну та місто", path: ["city"] },
  );

export const loginSchema = z.object({
  email: z.string().email("Невірний формат email"),
  password: z.string().min(1, "Введіть пароль"),
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  providerId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Невірний формат дати"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Невірний формат часу"),
  comment: z.string().max(600).optional().or(z.literal("")),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(3, "Мінімум 3 символи").max(80, "Максимум 80 символів"),
  description: z.string().trim().min(10, "Мінімум 10 символів").max(600, "Максимум 600 символів"),
  priceUSD: z.coerce.number().min(1, "Мінімальна ціна 1").max(100000),
  images: z.array(z.string().min(1)).max(10).default([]),
  category: z.string().min(1),
});

export const reviewSchema = z.object({
  serviceId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(5, "Мінімум 5 символів").max(1000),
});

export const providerProfileSchema = z.object({
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  specialization: z.string().max(80).optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[\d\s+()-]{6,20}$|^$/, "Невірний формат телефону")
    .optional()
    .or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
