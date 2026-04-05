export type ProjectCategory =
  | "web-app"
  | "api"
  | "mobile"
  | "infrastructure"
  | "database"
  | "saas"
  | "internal"
  | "other";

export interface VaultProject {
  id: string;
  name: string;
  description: string;
  icon: string; // svgl service name or emoji
  category: ProjectCategory;
  environments: Environment[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvVariable[];
  notes: string;
}

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  description: string;
}

export interface EncryptedVault {
  version: number;
  salt: string;
  iv: string;
  authTag: string;
  ciphertext: string;
  createdAt: string;
  modifiedAt: string;
}

export interface Vault {
  version: number;
  projects: VaultProject[];
  favorites: string[];
  lastAccessed: string;
}

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  "web-app": "Web App",
  api: "API",
  mobile: "Mobile",
  infrastructure: "Infrastructure",
  database: "Database",
  saas: "SaaS",
  internal: "Internal",
  other: "Other",
};

export const CATEGORY_COLORS: Record<ProjectCategory, string> = {
  "web-app": "#3b82f6",
  api: "#8b5cf6",
  mobile: "#f59e0b",
  infrastructure: "#06b6d4",
  database: "#10b981",
  saas: "#ec4899",
  internal: "#6366f1",
  other: "#6b7280",
};
