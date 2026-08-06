import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .email("Informe um endereço de e-mail válido."),
  password: z
    .string()
    .min(6, "A senha deve conter no mínimo 6 caracteres."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nome: z
      .string()
      .min(2, "O nome completo deve conter no mínimo 2 caracteres."),
    email: z
      .string()
      .min(1, "E-mail é obrigatório.")
      .email("Informe um endereço de e-mail válido."),
    password: z
      .string()
      .min(6, "A senha deve conter no mínimo 6 caracteres."),
    confirmPassword: z
      .string()
      .min(1, "Confirmação de senha é obrigatória."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const editProfileSchema = z.object({
  nome: z
    .string()
    .min(2, "O nome deve conter no mínimo 2 caracteres."),
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .email("Informe um e-mail válido."),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
