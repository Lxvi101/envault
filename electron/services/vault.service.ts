import { v4 as uuidv4 } from 'uuid';
import { encrypt, decrypt } from './crypto.service';
import { storageService } from './storage.service';
import { logger } from '../utils/logger';

type ProjectCategory = 'web-app' | 'api' | 'mobile' | 'infrastructure' | 'database' | 'saas' | 'internal' | 'other';

interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  description: string;
}

interface Environment {
  id: string;
  name: string;
  variables: EnvVariable[];
  notes: string;
}

interface VaultProject {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ProjectCategory;
  environments: Environment[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  modifiedAt: string;
}

interface VaultData {
  projects: VaultProject[];
}

function createDemoData(): VaultProject[] {
  const now = new Date().toISOString();

  return [
    {
      id: uuidv4(),
      name: 'Production API Keys',
      description: 'Core API keys and secrets for production services',
      icon: 'aws',
      category: 'api',
      tags: ['production', 'critical', 'aws'],
      isFavorite: true,
      createdAt: now,
      modifiedAt: now,
      environments: [
        {
          id: uuidv4(),
          name: 'production',
          notes: 'Live production credentials - handle with extreme care',
          variables: [
            {
              id: uuidv4(),
              key: 'AWS_ACCESS_KEY_ID',
              value: '<your-aws-access-key-id>',
              isSecret: true,
              description: 'AWS IAM access key for production S3 and Lambda',
            },
            {
              id: uuidv4(),
              key: 'AWS_SECRET_ACCESS_KEY',
              value: '<your-aws-secret-access-key>',
              isSecret: true,
              description: 'AWS IAM secret key paired with access key',
            },
            {
              id: uuidv4(),
              key: 'STRIPE_SECRET_KEY',
              value: '<your-stripe-live-secret-key>',
              isSecret: true,
              description: 'Stripe live secret key for payment processing',
            },
            {
              id: uuidv4(),
              key: 'SENDGRID_API_KEY',
              value: '<your-sendgrid-api-key>',
              isSecret: true,
              description: 'SendGrid API key for transactional emails',
            },
          ],
        },
        {
          id: uuidv4(),
          name: 'staging',
          notes: 'Staging environment keys - mirrors production setup',
          variables: [
            {
              id: uuidv4(),
              key: 'AWS_ACCESS_KEY_ID',
              value: '<your-aws-staging-access-key-id>',
              isSecret: true,
              description: 'AWS staging access key',
            },
            {
              id: uuidv4(),
              key: 'AWS_SECRET_ACCESS_KEY',
              value: '<your-aws-staging-secret-key>',
              isSecret: true,
              description: 'AWS staging secret key',
            },
            {
              id: uuidv4(),
              key: 'STRIPE_SECRET_KEY',
              value: '<your-stripe-test-secret-key>',
              isSecret: true,
              description: 'Stripe test secret key for staging',
            },
            {
              id: uuidv4(),
              key: 'SENDGRID_API_KEY',
              value: '<your-sendgrid-staging-api-key>',
              isSecret: true,
              description: 'SendGrid staging API key',
            },
          ],
        },
        {
          id: uuidv4(),
          name: 'development',
          notes: 'Local development keys - safe to use for testing',
          variables: [
            {
              id: uuidv4(),
              key: 'AWS_ACCESS_KEY_ID',
              value: '<your-aws-dev-access-key-id>',
              isSecret: false,
              description: 'AWS dev access key (localstack compatible)',
            },
            {
              id: uuidv4(),
              key: 'AWS_SECRET_ACCESS_KEY',
              value: '<your-aws-dev-secret-key>',
              isSecret: false,
              description: 'AWS dev secret key',
            },
            {
              id: uuidv4(),
              key: 'STRIPE_SECRET_KEY',
              value: '<your-stripe-dev-test-key>',
              isSecret: false,
              description: 'Stripe test key for development',
            },
            {
              id: uuidv4(),
              key: 'SENDGRID_API_KEY',
              value: '<your-sendgrid-dev-api-key>',
              isSecret: false,
              description: 'SendGrid dev sandbox key',
            },
          ],
        },
      ],
    },
    {
      id: uuidv4(),
      name: 'Frontend App',
      description: 'Next.js frontend application environment variables',
      icon: 'vercel',
      category: 'web-app',
      tags: ['frontend', 'nextjs', 'vercel'],
      isFavorite: true,
      createdAt: now,
      modifiedAt: now,
      environments: [
        {
          id: uuidv4(),
          name: 'production',
          notes: 'Production environment deployed on Vercel',
          variables: [
            {
              id: uuidv4(),
              key: 'NEXT_PUBLIC_API_URL',
              value: 'https://api.myapp.com/v1',
              isSecret: false,
              description: 'Public API base URL for the frontend',
            },
            {
              id: uuidv4(),
              key: 'NEXT_PUBLIC_STRIPE_KEY',
              value: '<your-stripe-live-publishable-key>',
              isSecret: false,
              description: 'Stripe publishable key (public, safe for client)',
            },
            {
              id: uuidv4(),
              key: 'SENTRY_DSN',
              value: 'https://placeholder@o0.ingest.sentry.io/0',
              isSecret: true,
              description: 'Sentry DSN for error tracking',
            },
            {
              id: uuidv4(),
              key: 'ANALYTICS_ID',
              value: 'G-XXXXXXXXXX',
              isSecret: false,
              description: 'Google Analytics measurement ID',
            },
          ],
        },
        {
          id: uuidv4(),
          name: 'staging',
          notes: 'Staging preview deployments on Vercel',
          variables: [
            {
              id: uuidv4(),
              key: 'NEXT_PUBLIC_API_URL',
              value: 'https://staging-api.myapp.com/v1',
              isSecret: false,
              description: 'Staging API base URL',
            },
            {
              id: uuidv4(),
              key: 'NEXT_PUBLIC_STRIPE_KEY',
              value: '<your-stripe-test-publishable-key>',
              isSecret: false,
              description: 'Stripe test publishable key',
            },
            {
              id: uuidv4(),
              key: 'SENTRY_DSN',
              value: 'https://stagingPublicKey@o0.ingest.sentry.io/1',
              isSecret: true,
              description: 'Sentry DSN for staging error tracking',
            },
            {
              id: uuidv4(),
              key: 'ANALYTICS_ID',
              value: 'G-STAGINGXXXX',
              isSecret: false,
              description: 'Staging analytics ID',
            },
          ],
        },
        {
          id: uuidv4(),
          name: 'development',
          notes: 'Local development environment',
          variables: [
            {
              id: uuidv4(),
              key: 'NEXT_PUBLIC_API_URL',
              value: 'http://localhost:3001/v1',
              isSecret: false,
              description: 'Local API URL',
            },
            {
              id: uuidv4(),
              key: 'NEXT_PUBLIC_STRIPE_KEY',
              value: '<your-stripe-dev-publishable-key>',
              isSecret: false,
              description: 'Stripe dev publishable key',
            },
            {
              id: uuidv4(),
              key: 'SENTRY_DSN',
              value: '',
              isSecret: false,
              description: 'Sentry disabled in development',
            },
            {
              id: uuidv4(),
              key: 'ANALYTICS_ID',
              value: '',
              isSecret: false,
              description: 'Analytics disabled in development',
            },
          ],
        },
      ],
    },
    {
      id: uuidv4(),
      name: 'Database Cluster',
      description: 'Database connection strings and credentials',
      icon: 'supabase',
      category: 'database',
      tags: ['database', 'postgres', 'redis'],
      isFavorite: false,
      createdAt: now,
      modifiedAt: now,
      environments: [
        {
          id: uuidv4(),
          name: 'production',
          notes: 'Production database cluster - read replicas enabled',
          variables: [
            {
              id: uuidv4(),
              key: 'DATABASE_URL',
              value: 'postgresql://prod_user:s3cur3P@ssw0rd@db.myapp.com:5432/myapp_prod?sslmode=require',
              isSecret: true,
              description: 'Primary PostgreSQL connection string',
            },
            {
              id: uuidv4(),
              key: 'REDIS_URL',
              value: 'rediss://default:r3d1sP@ss@redis.myapp.com:6380/0',
              isSecret: true,
              description: 'Redis connection URL with TLS',
            },
            {
              id: uuidv4(),
              key: 'MONGO_URI',
              value: 'mongodb+srv://prod_admin:m0ng0S3cr3t@cluster0.example.mongodb.net/myapp?retryWrites=true',
              isSecret: true,
              description: 'MongoDB Atlas connection string',
            },
            {
              id: uuidv4(),
              key: 'DB_PASSWORD',
              value: 's3cur3P@ssw0rd_pr0d_2024!',
              isSecret: true,
              description: 'Master database password',
            },
          ],
        },
        {
          id: uuidv4(),
          name: 'staging',
          notes: 'Staging database - refreshed weekly from production snapshot',
          variables: [
            {
              id: uuidv4(),
              key: 'DATABASE_URL',
              value: 'postgresql://staging_user:stgP@ss123@staging-db.myapp.com:5432/myapp_staging',
              isSecret: true,
              description: 'Staging PostgreSQL connection string',
            },
            {
              id: uuidv4(),
              key: 'REDIS_URL',
              value: 'redis://default:r3d1sStg@staging-redis.myapp.com:6379/0',
              isSecret: true,
              description: 'Staging Redis connection URL',
            },
            {
              id: uuidv4(),
              key: 'MONGO_URI',
              value: 'mongodb+srv://staging_user:m0ng0Stg@cluster0-staging.example.mongodb.net/myapp_stg',
              isSecret: true,
              description: 'Staging MongoDB connection string',
            },
            {
              id: uuidv4(),
              key: 'DB_PASSWORD',
              value: 'stgP@ss123_staging!',
              isSecret: true,
              description: 'Staging database password',
            },
          ],
        },
        {
          id: uuidv4(),
          name: 'development',
          notes: 'Local Docker Compose databases',
          variables: [
            {
              id: uuidv4(),
              key: 'DATABASE_URL',
              value: 'postgresql://postgres:postgres@localhost:5432/myapp_dev',
              isSecret: false,
              description: 'Local PostgreSQL via Docker',
            },
            {
              id: uuidv4(),
              key: 'REDIS_URL',
              value: 'redis://localhost:6379/0',
              isSecret: false,
              description: 'Local Redis via Docker',
            },
            {
              id: uuidv4(),
              key: 'MONGO_URI',
              value: 'mongodb://localhost:27017/myapp_dev',
              isSecret: false,
              description: 'Local MongoDB via Docker',
            },
            {
              id: uuidv4(),
              key: 'DB_PASSWORD',
              value: 'postgres',
              isSecret: false,
              description: 'Local database password',
            },
          ],
        },
      ],
    },
    {
      id: uuidv4(),
      name: 'Staging Environment',
      description: 'Infrastructure and feature flag configuration for staging',
      icon: 'docker',
      category: 'infrastructure',
      tags: ['staging', 'docker', 'infra'],
      isFavorite: false,
      createdAt: now,
      modifiedAt: now,
      environments: [
        {
          id: uuidv4(),
          name: 'production',
          notes: 'Production infrastructure settings',
          variables: [
            {
              id: uuidv4(),
              key: 'API_URL',
              value: 'https://api.myapp.com',
              isSecret: false,
              description: 'Production API endpoint',
            },
            {
              id: uuidv4(),
              key: 'DEBUG',
              value: 'false',
              isSecret: false,
              description: 'Debug mode flag',
            },
            {
              id: uuidv4(),
              key: 'LOG_LEVEL',
              value: 'warn',
              isSecret: false,
              description: 'Application log level',
            },
            {
              id: uuidv4(),
              key: 'FEATURE_FLAGS',
              value: '{"darkMode":true,"betaFeatures":false,"newCheckout":true,"aiAssistant":false}',
              isSecret: false,
              description: 'JSON feature flag configuration',
            },
          ],
        },
        {
          id: uuidv4(),
          name: 'staging',
          notes: 'Staging infrastructure with debug enabled',
          variables: [
            {
              id: uuidv4(),
              key: 'API_URL',
              value: 'https://staging-api.myapp.com',
              isSecret: false,
              description: 'Staging API endpoint',
            },
            {
              id: uuidv4(),
              key: 'DEBUG',
              value: 'true',
              isSecret: false,
              description: 'Debug mode enabled for staging',
            },
            {
              id: uuidv4(),
              key: 'LOG_LEVEL',
              value: 'debug',
              isSecret: false,
              description: 'Verbose logging for staging',
            },
            {
              id: uuidv4(),
              key: 'FEATURE_FLAGS',
              value: '{"darkMode":true,"betaFeatures":true,"newCheckout":true,"aiAssistant":true}',
              isSecret: false,
              description: 'All features enabled for staging testing',
            },
          ],
        },
        {
          id: uuidv4(),
          name: 'development',
          notes: 'Local development infrastructure settings',
          variables: [
            {
              id: uuidv4(),
              key: 'API_URL',
              value: 'http://localhost:3001',
              isSecret: false,
              description: 'Local development API URL',
            },
            {
              id: uuidv4(),
              key: 'DEBUG',
              value: 'true',
              isSecret: false,
              description: 'Debug mode for development',
            },
            {
              id: uuidv4(),
              key: 'LOG_LEVEL',
              value: 'trace',
              isSecret: false,
              description: 'Maximum verbosity for local development',
            },
            {
              id: uuidv4(),
              key: 'FEATURE_FLAGS',
              value: '{"darkMode":true,"betaFeatures":true,"newCheckout":true,"aiAssistant":true}',
              isSecret: false,
              description: 'All features enabled for development',
            },
          ],
        },
      ],
    },
  ];
}

class VaultService {
  private static instance: VaultService;
  private decryptedData: VaultData | null = null;
  private currentPassword: string | null = null;

  private constructor() {}

  static getInstance(): VaultService {
    if (!VaultService.instance) {
      VaultService.instance = new VaultService();
    }
    return VaultService.instance;
  }

  async unlock(password: string): Promise<{ success: boolean; projects?: VaultProject[] }> {
    try {
      const vaultFile = storageService.readVaultFile();
      if (!vaultFile) {
        return { success: false };
      }

      const decrypted = decrypt(
        {
          ciphertext: vaultFile.ciphertext,
          iv: vaultFile.iv,
          authTag: vaultFile.authTag,
          salt: vaultFile.salt,
        },
        password,
      );

      this.decryptedData = JSON.parse(decrypted) as VaultData;
      this.currentPassword = password;

      logger.info(`Vault unlocked with ${this.decryptedData.projects.length} projects`);
      return { success: true, projects: this.decryptedData.projects };
    } catch (error) {
      logger.error('Failed to unlock vault:', error);
      this.decryptedData = null;
      this.currentPassword = null;
      return { success: false };
    }
  }

  lock(): void {
    if (this.currentPassword) {
      const passLength = this.currentPassword.length;
      this.currentPassword = '\0'.repeat(passLength);
      this.currentPassword = null;
    }
    this.decryptedData = null;
    logger.info('Vault locked, memory cleared');
  }

  isUnlocked(): boolean {
    return this.decryptedData !== null && this.currentPassword !== null;
  }

  getAllProjects(): VaultProject[] {
    if (!this.decryptedData) {
      throw new Error('Vault is locked');
    }
    return this.decryptedData.projects;
  }

  async createProject(data: Record<string, unknown>): Promise<VaultProject> {
    if (!this.decryptedData || !this.currentPassword) {
      throw new Error('Vault is locked');
    }

    const now = new Date().toISOString();
    const defaultEnvs: Environment[] = [
      { id: uuidv4(), name: 'production', variables: [], notes: '' },
      { id: uuidv4(), name: 'staging', variables: [], notes: '' },
      { id: uuidv4(), name: 'development', variables: [], notes: '' },
    ];

    const project: VaultProject = {
      id: uuidv4(),
      name: (data.name as string) || 'Untitled Project',
      description: (data.description as string) || '',
      icon: (data.icon as string) || 'folder',
      category: (data.category as ProjectCategory) || 'other',
      environments: (data.environments as Environment[]) || defaultEnvs,
      tags: (data.tags as string[]) || [],
      isFavorite: false,
      createdAt: now,
      modifiedAt: now,
    };

    this.decryptedData.projects.push(project);
    await this.saveVault();

    logger.info('Project created:', project.name);
    return project;
  }

  async updateProject(id: string, data: Record<string, unknown>): Promise<VaultProject> {
    if (!this.decryptedData || !this.currentPassword) {
      throw new Error('Vault is locked');
    }

    const index = this.decryptedData.projects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }

    const existing = this.decryptedData.projects[index];
    const updated: VaultProject = {
      ...existing,
      name: (data.name as string) ?? existing.name,
      description: (data.description as string) ?? existing.description,
      icon: (data.icon as string) ?? existing.icon,
      category: (data.category as ProjectCategory) ?? existing.category,
      tags: (data.tags as string[]) ?? existing.tags,
      environments: (data.environments as Environment[]) ?? existing.environments,
      modifiedAt: new Date().toISOString(),
    };

    this.decryptedData.projects[index] = updated;
    await this.saveVault();

    logger.info('Project updated:', updated.name);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.decryptedData || !this.currentPassword) {
      throw new Error('Vault is locked');
    }

    const index = this.decryptedData.projects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }

    const projectName = this.decryptedData.projects[index].name;
    this.decryptedData.projects.splice(index, 1);
    await this.saveVault();

    logger.info('Project deleted:', projectName);
  }

  async toggleFavorite(id: string): Promise<VaultProject> {
    if (!this.decryptedData || !this.currentPassword) {
      throw new Error('Vault is locked');
    }

    const project = this.decryptedData.projects.find((p) => p.id === id);
    if (!project) {
      throw new Error('Project not found');
    }

    project.isFavorite = !project.isFavorite;
    project.modifiedAt = new Date().toISOString();
    await this.saveVault();

    logger.info(`Project "${project.name}" favorite:`, project.isFavorite);
    return project;
  }

  async addVariable(
    projectId: string,
    envId: string,
    variable: Record<string, unknown>,
  ): Promise<EnvVariable> {
    if (!this.decryptedData || !this.currentPassword) {
      throw new Error('Vault is locked');
    }

    const project = this.decryptedData.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const env = project.environments.find((e) => e.id === envId);
    if (!env) {
      throw new Error('Environment not found');
    }

    const newVariable: EnvVariable = {
      id: uuidv4(),
      key: (variable.key as string) || '',
      value: (variable.value as string) || '',
      isSecret: (variable.isSecret as boolean) ?? true,
      description: (variable.description as string) || '',
    };

    env.variables.push(newVariable);
    project.modifiedAt = new Date().toISOString();
    await this.saveVault();

    logger.info(`Variable "${newVariable.key}" added to ${project.name}/${env.name}`);
    return newVariable;
  }

  async updateVariable(
    projectId: string,
    envId: string,
    varId: string,
    data: Record<string, unknown>,
  ): Promise<EnvVariable> {
    if (!this.decryptedData || !this.currentPassword) {
      throw new Error('Vault is locked');
    }

    const project = this.decryptedData.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const env = project.environments.find((e) => e.id === envId);
    if (!env) {
      throw new Error('Environment not found');
    }

    const varIndex = env.variables.findIndex((v) => v.id === varId);
    if (varIndex === -1) {
      throw new Error('Variable not found');
    }

    const existing = env.variables[varIndex];
    const updated: EnvVariable = {
      ...existing,
      key: (data.key as string) ?? existing.key,
      value: (data.value as string) ?? existing.value,
      isSecret: (data.isSecret as boolean) ?? existing.isSecret,
      description: (data.description as string) ?? existing.description,
    };

    env.variables[varIndex] = updated;
    project.modifiedAt = new Date().toISOString();
    await this.saveVault();

    logger.info(`Variable "${updated.key}" updated in ${project.name}/${env.name}`);
    return updated;
  }

  async deleteVariable(projectId: string, envId: string, varId: string): Promise<void> {
    if (!this.decryptedData || !this.currentPassword) {
      throw new Error('Vault is locked');
    }

    const project = this.decryptedData.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const env = project.environments.find((e) => e.id === envId);
    if (!env) {
      throw new Error('Environment not found');
    }

    const varIndex = env.variables.findIndex((v) => v.id === varId);
    if (varIndex === -1) {
      throw new Error('Variable not found');
    }

    const varKey = env.variables[varIndex].key;
    env.variables.splice(varIndex, 1);
    project.modifiedAt = new Date().toISOString();
    await this.saveVault();

    logger.info(`Variable "${varKey}" deleted from ${project.name}/${env.name}`);
  }

  exportEnv(projectId: string, envId: string): string | null {
    if (!this.decryptedData) {
      throw new Error('Vault is locked');
    }

    const project = this.decryptedData.projects.find((p) => p.id === projectId);
    if (!project) {
      return null;
    }

    const env = project.environments.find((e) => e.id === envId);
    if (!env) {
      return null;
    }

    const lines: string[] = [
      `# ${project.name} - ${env.name}`,
      `# Generated by EnVault on ${new Date().toISOString()}`,
      '',
    ];

    for (const variable of env.variables) {
      if (variable.description) {
        lines.push(`# ${variable.description}`);
      }
      const value = variable.value.includes(' ') || variable.value.includes('"')
        ? `"${variable.value.replace(/"/g, '\\"')}"`
        : variable.value;
      lines.push(`${variable.key}=${value}`);
    }

    lines.push('');
    return lines.join('\n');
  }

  async importEnv(
    content: string,
    projectId: string,
    envId: string,
  ): Promise<EnvVariable[]> {
    if (!this.decryptedData || !this.currentPassword) {
      throw new Error('Vault is locked');
    }

    const project = this.decryptedData.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const env = project.environments.find((e) => e.id === envId);
    if (!env) {
      throw new Error('Environment not found');
    }

    const importedVariables: EnvVariable[] = [];
    const lines = content.split('\n');
    let currentDescription = '';

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        currentDescription = '';
        continue;
      }

      if (line.startsWith('#')) {
        currentDescription = line.substring(1).trim();
        continue;
      }

      const equalsIndex = line.indexOf('=');
      if (equalsIndex === -1) {
        continue;
      }

      const key = line.substring(0, equalsIndex).trim();
      let value = line.substring(equalsIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!key || /\s/.test(key)) {
        continue;
      }

      const existingIndex = env.variables.findIndex((v) => v.key === key);
      const newVariable: EnvVariable = {
        id: existingIndex >= 0 ? env.variables[existingIndex].id : uuidv4(),
        key,
        value,
        isSecret: key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('key') ||
          key.toLowerCase().includes('token'),
        description: currentDescription,
      };

      if (existingIndex >= 0) {
        env.variables[existingIndex] = newVariable;
      } else {
        env.variables.push(newVariable);
      }

      importedVariables.push(newVariable);
      currentDescription = '';
    }

    project.modifiedAt = new Date().toISOString();
    await this.saveVault();

    return importedVariables;
  }

  async initializeWithDemoData(password: string): Promise<VaultProject[]> {
    const projects = createDemoData();
    this.decryptedData = { projects };
    this.currentPassword = password;
    await this.saveVault();

    logger.info('Vault initialized with demo data');
    return projects;
  }

  private async saveVault(): Promise<void> {
    if (!this.decryptedData || !this.currentPassword) {
      throw new Error('Vault is locked, cannot save');
    }

    const jsonData = JSON.stringify(this.decryptedData);
    const encrypted = encrypt(jsonData, this.currentPassword);

    const now = new Date().toISOString();
    const vaultFile = storageService.readVaultFile();

    storageService.writeVaultFile({
      version: 1,
      salt: encrypted.salt,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      ciphertext: encrypted.ciphertext,
      createdAt: vaultFile?.createdAt || now,
      modifiedAt: now,
    });
  }
}

export const vaultService = VaultService.getInstance();
