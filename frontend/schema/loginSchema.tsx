import { z } from "zod";

const loginSchema = z.object({
    email: z
        .string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Por favor, insira um email válido." })
        .nonempty({ message: "O email é obrigatório." }),
    password: z
        .string()
        .nonempty({ message: "A senha é obrigatória." })
        .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
export { LoginFormValues, loginSchema };
