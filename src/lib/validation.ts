import { z } from "zod";

// ── EnvVariable ────────────────────────────────────────────────────────────

export const envVariableSchema = z.object({
  id: z.string().uuid(),
  key: z
    .string()
    .min(1, "Variable key is required")
    .regex(
      /^[A-Za-z_][A-Za-z0-9_]*$/,
      "Key must start with a letter or underscore and contain only letters, digits, and underscores",
    ),
  value: z.string(),
  isSecret: z.boolean(),
  description: z.string(),
});

export const envVariableCreateSchema = envVariableSchema.partial({
  id: true,
  isSecret: true,
  description: true,
});

// ── Environment ────────────────────────────────────────────────────────────

export const environmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Environment name is required").max(50, "Name must be 50 characters or less"),
  variables: z.array(envVariableSchema),
  notes: z.string(),
});

export const environmentCreateSchema = environmentSchema.partial({
  id: true,
  variables: true,
  notes: true,
});

// ── VaultProject ───────────────────────────────────────────────────────────

export const projectCategorySchema = z.enum([
  "web-app",
  "api",
  "mobile",
  "infrastructure",
  "database",
  "saas",
  "internal",
  "other",
]);

export const vaultProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Project name is required").max(80, "Name must be 80 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less"),
  icon: z.string(),
  category: projectCategorySchema,
  environments: z.array(environmentSchema),
  tags: z.array(z.string().max(30)),
  isFavorite: z.boolean(),
  createdAt: z.string().datetime(),
  modifiedAt: z.string().datetime(),
});

export const vaultProjectCreateSchema = vaultProjectSchema.partial({
  id: true,
  description: true,
  icon: true,
  environments: true,
  tags: true,
  isFavorite: true,
  createdAt: true,
  modifiedAt: true,
});

// ── Vault (the top-level encrypted structure) ──────────────────────────────

export const vaultSchema = z.object({
  version: z.number().int().positive(),
  projects: z.array(vaultProjectSchema),
  favorites: z.array(z.string().uuid()),
  lastAccessed: z.string().datetime(),
});

// ── Password validation ────────────────────────────────────────────────────

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be 128 characters or less");

export const setupPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

// ── Type inference helpers ─────────────────────────────────────────────────

export type ValidatedEnvVariable = z.infer<typeof envVariableSchema>;
export type ValidatedEnvironment = z.infer<typeof environmentSchema>;
export type ValidatedVaultProject = z.infer<typeof vaultProjectSchema>;
export type ValidatedVault = z.infer<typeof vaultSchema>;

// ── Validation helpers ─────────────────────────────────────────────────────

/**
 * Validate a value against a Zod schema and return a typed result.
 * Throws a formatted error string on failure.
 */
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const messages = result.error.issues.map((issue) => {
    const path = issue.path.length ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });

  throw new Error(messages.join("; "));
}

/**
 * Validate and return either the data or an array of error messages.
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((issue) => {
    const path = issue.path.length ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });

  return { success: false, errors };
}
