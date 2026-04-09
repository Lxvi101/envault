use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{
    crypto::{decrypt, encrypt, EncryptedPayload},
    storage::{read_vault_file, write_vault_file, EncryptedVaultFile},
};

// ── Domain types ────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EnvVariable {
    pub id: String,
    pub key: String,
    pub value: String,
    pub is_secret: bool,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Environment {
    pub id: String,
    pub name: String,
    pub variables: Vec<EnvVariable>,
    pub notes: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VaultProject {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub category: String,
    pub environments: Vec<Environment>,
    pub tags: Vec<String>,
    pub is_favorite: bool,
    pub created_at: String,
    pub modified_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VaultData {
    pub projects: Vec<VaultProject>,
}

// ── Demo data ───────────────────────────────────────────────────────────────

fn create_demo_data() -> Vec<VaultProject> {
    let now = Utc::now().to_rfc3339();

    vec![
        VaultProject {
            id: Uuid::new_v4().to_string(),
            name: "Production API Keys".to_string(),
            description: "Core API keys and secrets for production services".to_string(),
            icon: "aws".to_string(),
            category: "api".to_string(),
            tags: vec!["production".to_string(), "critical".to_string(), "aws".to_string()],
            is_favorite: true,
            created_at: now.clone(),
            modified_at: now.clone(),
            environments: vec![
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "production".to_string(),
                    notes: "Live production credentials - handle with extreme care".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "AWS_ACCESS_KEY_ID".to_string(),
                            value: "<your-aws-access-key-id>".to_string(),
                            is_secret: true,
                            description: "AWS IAM access key for production S3 and Lambda".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "AWS_SECRET_ACCESS_KEY".to_string(),
                            value: "<your-aws-secret-access-key>".to_string(),
                            is_secret: true,
                            description: "AWS IAM secret key paired with access key".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "STRIPE_SECRET_KEY".to_string(),
                            value: "<your-stripe-live-secret-key>".to_string(),
                            is_secret: true,
                            description: "Stripe live secret key for payment processing".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "SENDGRID_API_KEY".to_string(),
                            value: "<your-sendgrid-api-key>".to_string(),
                            is_secret: true,
                            description: "SendGrid API key for transactional emails".to_string(),
                        },
                    ],
                },
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "staging".to_string(),
                    notes: "Staging environment keys - mirrors production setup".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "AWS_ACCESS_KEY_ID".to_string(),
                            value: "<your-aws-staging-access-key-id>".to_string(),
                            is_secret: true,
                            description: "AWS staging access key".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "AWS_SECRET_ACCESS_KEY".to_string(),
                            value: "<your-aws-staging-secret-key>".to_string(),
                            is_secret: true,
                            description: "AWS staging secret key".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "STRIPE_SECRET_KEY".to_string(),
                            value: "<your-stripe-test-secret-key>".to_string(),
                            is_secret: true,
                            description: "Stripe test secret key for staging".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "SENDGRID_API_KEY".to_string(),
                            value: "<your-sendgrid-staging-api-key>".to_string(),
                            is_secret: true,
                            description: "SendGrid staging API key".to_string(),
                        },
                    ],
                },
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "development".to_string(),
                    notes: "Local development keys - safe to use for testing".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "AWS_ACCESS_KEY_ID".to_string(),
                            value: "<your-aws-dev-access-key-id>".to_string(),
                            is_secret: false,
                            description: "AWS dev access key (localstack compatible)".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "AWS_SECRET_ACCESS_KEY".to_string(),
                            value: "<your-aws-dev-secret-key>".to_string(),
                            is_secret: false,
                            description: "AWS dev secret key".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "STRIPE_SECRET_KEY".to_string(),
                            value: "<your-stripe-dev-test-key>".to_string(),
                            is_secret: false,
                            description: "Stripe test key for development".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "SENDGRID_API_KEY".to_string(),
                            value: "<your-sendgrid-dev-api-key>".to_string(),
                            is_secret: false,
                            description: "SendGrid dev sandbox key".to_string(),
                        },
                    ],
                },
            ],
        },
        VaultProject {
            id: Uuid::new_v4().to_string(),
            name: "Frontend App".to_string(),
            description: "Next.js frontend application environment variables".to_string(),
            icon: "vercel".to_string(),
            category: "web-app".to_string(),
            tags: vec!["frontend".to_string(), "nextjs".to_string(), "vercel".to_string()],
            is_favorite: true,
            created_at: now.clone(),
            modified_at: now.clone(),
            environments: vec![
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "production".to_string(),
                    notes: "Production environment deployed on Vercel".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "NEXT_PUBLIC_API_URL".to_string(),
                            value: "https://api.myapp.com/v1".to_string(),
                            is_secret: false,
                            description: "Public API base URL for the frontend".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "NEXT_PUBLIC_STRIPE_KEY".to_string(),
                            value: "<your-stripe-live-publishable-key>".to_string(),
                            is_secret: false,
                            description: "Stripe publishable key (public, safe for client)".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "SENTRY_DSN".to_string(),
                            value: "https://placeholder@o0.ingest.sentry.io/0".to_string(),
                            is_secret: true,
                            description: "Sentry DSN for error tracking".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "ANALYTICS_ID".to_string(),
                            value: "G-XXXXXXXXXX".to_string(),
                            is_secret: false,
                            description: "Google Analytics measurement ID".to_string(),
                        },
                    ],
                },
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "staging".to_string(),
                    notes: "Staging preview deployments on Vercel".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "NEXT_PUBLIC_API_URL".to_string(),
                            value: "https://staging-api.myapp.com/v1".to_string(),
                            is_secret: false,
                            description: "Staging API base URL".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "NEXT_PUBLIC_STRIPE_KEY".to_string(),
                            value: "<your-stripe-test-publishable-key>".to_string(),
                            is_secret: false,
                            description: "Stripe test publishable key".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "SENTRY_DSN".to_string(),
                            value: "https://stagingPublicKey@o0.ingest.sentry.io/1".to_string(),
                            is_secret: true,
                            description: "Sentry DSN for staging error tracking".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "ANALYTICS_ID".to_string(),
                            value: "G-STAGINGXXXX".to_string(),
                            is_secret: false,
                            description: "Staging analytics ID".to_string(),
                        },
                    ],
                },
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "development".to_string(),
                    notes: "Local development environment".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "NEXT_PUBLIC_API_URL".to_string(),
                            value: "http://localhost:3001/v1".to_string(),
                            is_secret: false,
                            description: "Local API URL".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "NEXT_PUBLIC_STRIPE_KEY".to_string(),
                            value: "<your-stripe-dev-publishable-key>".to_string(),
                            is_secret: false,
                            description: "Stripe dev publishable key".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "SENTRY_DSN".to_string(),
                            value: String::new(),
                            is_secret: false,
                            description: "Sentry disabled in development".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "ANALYTICS_ID".to_string(),
                            value: String::new(),
                            is_secret: false,
                            description: "Analytics disabled in development".to_string(),
                        },
                    ],
                },
            ],
        },
        VaultProject {
            id: Uuid::new_v4().to_string(),
            name: "Database Cluster".to_string(),
            description: "Database connection strings and credentials".to_string(),
            icon: "supabase".to_string(),
            category: "database".to_string(),
            tags: vec!["database".to_string(), "postgres".to_string(), "redis".to_string()],
            is_favorite: false,
            created_at: now.clone(),
            modified_at: now.clone(),
            environments: vec![
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "production".to_string(),
                    notes: "Production database cluster - read replicas enabled".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "DATABASE_URL".to_string(),
                            value: "postgresql://prod_user:s3cur3P@ssw0rd@db.myapp.com:5432/myapp_prod?sslmode=require".to_string(),
                            is_secret: true,
                            description: "Primary PostgreSQL connection string".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "REDIS_URL".to_string(),
                            value: "rediss://default:r3d1sP@ss@redis.myapp.com:6380/0".to_string(),
                            is_secret: true,
                            description: "Redis connection URL with TLS".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "MONGO_URI".to_string(),
                            value: "mongodb+srv://prod_admin:m0ng0S3cr3t@cluster0.example.mongodb.net/myapp?retryWrites=true".to_string(),
                            is_secret: true,
                            description: "MongoDB Atlas connection string".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "DB_PASSWORD".to_string(),
                            value: "s3cur3P@ssw0rd_pr0d_2024!".to_string(),
                            is_secret: true,
                            description: "Master database password".to_string(),
                        },
                    ],
                },
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "staging".to_string(),
                    notes: "Staging database - refreshed weekly from production snapshot".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "DATABASE_URL".to_string(),
                            value: "postgresql://staging_user:stgP@ss123@staging-db.myapp.com:5432/myapp_staging".to_string(),
                            is_secret: true,
                            description: "Staging PostgreSQL connection string".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "REDIS_URL".to_string(),
                            value: "redis://default:r3d1sStg@staging-redis.myapp.com:6379/0".to_string(),
                            is_secret: true,
                            description: "Staging Redis connection URL".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "MONGO_URI".to_string(),
                            value: "mongodb+srv://staging_user:m0ng0Stg@cluster0-staging.example.mongodb.net/myapp_stg".to_string(),
                            is_secret: true,
                            description: "Staging MongoDB connection string".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "DB_PASSWORD".to_string(),
                            value: "stgP@ss123_staging!".to_string(),
                            is_secret: true,
                            description: "Staging database password".to_string(),
                        },
                    ],
                },
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "development".to_string(),
                    notes: "Local Docker Compose databases".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "DATABASE_URL".to_string(),
                            value: "postgresql://postgres:postgres@localhost:5432/myapp_dev".to_string(),
                            is_secret: false,
                            description: "Local PostgreSQL via Docker".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "REDIS_URL".to_string(),
                            value: "redis://localhost:6379/0".to_string(),
                            is_secret: false,
                            description: "Local Redis via Docker".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "MONGO_URI".to_string(),
                            value: "mongodb://localhost:27017/myapp_dev".to_string(),
                            is_secret: false,
                            description: "Local MongoDB via Docker".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "DB_PASSWORD".to_string(),
                            value: "postgres".to_string(),
                            is_secret: false,
                            description: "Local database password".to_string(),
                        },
                    ],
                },
            ],
        },
        VaultProject {
            id: Uuid::new_v4().to_string(),
            name: "Staging Environment".to_string(),
            description: "Infrastructure and feature flag configuration for staging".to_string(),
            icon: "docker".to_string(),
            category: "infrastructure".to_string(),
            tags: vec!["staging".to_string(), "docker".to_string(), "infra".to_string()],
            is_favorite: false,
            created_at: now.clone(),
            modified_at: now.clone(),
            environments: vec![
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "production".to_string(),
                    notes: "Production infrastructure settings".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "API_URL".to_string(),
                            value: "https://api.myapp.com".to_string(),
                            is_secret: false,
                            description: "Production API endpoint".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "DEBUG".to_string(),
                            value: "false".to_string(),
                            is_secret: false,
                            description: "Debug mode flag".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "LOG_LEVEL".to_string(),
                            value: "warn".to_string(),
                            is_secret: false,
                            description: "Application log level".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "FEATURE_FLAGS".to_string(),
                            value: r#"{"darkMode":true,"betaFeatures":false,"newCheckout":true,"aiAssistant":false}"#.to_string(),
                            is_secret: false,
                            description: "JSON feature flag configuration".to_string(),
                        },
                    ],
                },
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "staging".to_string(),
                    notes: "Staging infrastructure with debug enabled".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "API_URL".to_string(),
                            value: "https://staging-api.myapp.com".to_string(),
                            is_secret: false,
                            description: "Staging API endpoint".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "DEBUG".to_string(),
                            value: "true".to_string(),
                            is_secret: false,
                            description: "Debug mode enabled for staging".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "LOG_LEVEL".to_string(),
                            value: "debug".to_string(),
                            is_secret: false,
                            description: "Verbose logging for staging".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "FEATURE_FLAGS".to_string(),
                            value: r#"{"darkMode":true,"betaFeatures":true,"newCheckout":true,"aiAssistant":true}"#.to_string(),
                            is_secret: false,
                            description: "All features enabled for staging testing".to_string(),
                        },
                    ],
                },
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "development".to_string(),
                    notes: "Local development infrastructure settings".to_string(),
                    variables: vec![
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "API_URL".to_string(),
                            value: "http://localhost:3001".to_string(),
                            is_secret: false,
                            description: "Local development API URL".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "DEBUG".to_string(),
                            value: "true".to_string(),
                            is_secret: false,
                            description: "Debug mode for development".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "LOG_LEVEL".to_string(),
                            value: "trace".to_string(),
                            is_secret: false,
                            description: "Maximum verbosity for local development".to_string(),
                        },
                        EnvVariable {
                            id: Uuid::new_v4().to_string(),
                            key: "FEATURE_FLAGS".to_string(),
                            value: r#"{"darkMode":true,"betaFeatures":true,"newCheckout":true,"aiAssistant":true}"#.to_string(),
                            is_secret: false,
                            description: "All features enabled for development".to_string(),
                        },
                    ],
                },
            ],
        },
    ]
}

// ── Vault Service ────────────────────────────────────────────────────────────

pub struct VaultService {
    decrypted_data: Option<VaultData>,
    current_password: Option<String>,
}

impl VaultService {
    pub fn new() -> Self {
        Self {
            decrypted_data: None,
            current_password: None,
        }
    }

    pub fn unlock(&mut self, password: &str) -> Result<Vec<VaultProject>, String> {
        let vault_file = read_vault_file().ok_or("Vault file not found")?;

        let payload = EncryptedPayload {
            ciphertext: vault_file.ciphertext,
            iv: vault_file.iv,
            auth_tag: vault_file.auth_tag,
            salt: vault_file.salt,
        };

        let decrypted = decrypt(&payload, password)?;
        let data: VaultData = serde_json::from_str(&decrypted)
            .map_err(|e| format!("Failed to parse vault data: {e}"))?;

        let projects = data.projects.clone();
        self.decrypted_data = Some(data);
        self.current_password = Some(password.to_string());

        Ok(projects)
    }

    pub fn lock(&mut self) {
        // Zero out the password before dropping
        if let Some(ref mut p) = self.current_password {
            // Overwrite memory before dropping
            unsafe {
                std::ptr::write_bytes(p.as_mut_ptr(), 0, p.len());
            }
        }
        self.current_password = None;
        self.decrypted_data = None;
    }

    pub fn is_unlocked(&self) -> bool {
        self.decrypted_data.is_some() && self.current_password.is_some()
    }

    pub fn get_all_projects(&self) -> Result<Vec<VaultProject>, String> {
        let data = self.decrypted_data.as_ref().ok_or("Vault is locked")?;
        Ok(data.projects.clone())
    }

    pub fn create_project(
        &mut self,
        name: String,
        description: String,
        icon: String,
        category: String,
        tags: Vec<String>,
        environments: Option<Vec<Environment>>,
    ) -> Result<VaultProject, String> {
        let data = self.decrypted_data.as_mut().ok_or("Vault is locked")?;
        let now = Utc::now().to_rfc3339();

        let default_envs = environments.unwrap_or_else(|| {
            vec![
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "production".to_string(),
                    variables: vec![],
                    notes: String::new(),
                },
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "staging".to_string(),
                    variables: vec![],
                    notes: String::new(),
                },
                Environment {
                    id: Uuid::new_v4().to_string(),
                    name: "development".to_string(),
                    variables: vec![],
                    notes: String::new(),
                },
            ]
        });

        let project = VaultProject {
            id: Uuid::new_v4().to_string(),
            name,
            description,
            icon,
            category,
            environments: default_envs,
            tags,
            is_favorite: false,
            created_at: now.clone(),
            modified_at: now,
        };

        data.projects.push(project.clone());
        self.save_vault()?;

        Ok(project)
    }

    pub fn update_project(
        &mut self,
        id: &str,
        name: Option<String>,
        description: Option<String>,
        icon: Option<String>,
        category: Option<String>,
        tags: Option<Vec<String>>,
        environments: Option<Vec<Environment>>,
    ) -> Result<VaultProject, String> {
        let data = self.decrypted_data.as_mut().ok_or("Vault is locked")?;

        let project = data
            .projects
            .iter_mut()
            .find(|p| p.id == id)
            .ok_or("Project not found")?;

        if let Some(v) = name {
            project.name = v;
        }
        if let Some(v) = description {
            project.description = v;
        }
        if let Some(v) = icon {
            project.icon = v;
        }
        if let Some(v) = category {
            project.category = v;
        }
        if let Some(v) = tags {
            project.tags = v;
        }
        if let Some(v) = environments {
            project.environments = v;
        }
        project.modified_at = Utc::now().to_rfc3339();

        let updated = project.clone();
        self.save_vault()?;

        Ok(updated)
    }

    pub fn delete_project(&mut self, id: &str) -> Result<(), String> {
        let data = self.decrypted_data.as_mut().ok_or("Vault is locked")?;

        let pos = data
            .projects
            .iter()
            .position(|p| p.id == id)
            .ok_or("Project not found")?;

        data.projects.remove(pos);
        self.save_vault()?;

        Ok(())
    }

    pub fn toggle_favorite(&mut self, id: &str) -> Result<VaultProject, String> {
        let data = self.decrypted_data.as_mut().ok_or("Vault is locked")?;

        let project = data
            .projects
            .iter_mut()
            .find(|p| p.id == id)
            .ok_or("Project not found")?;

        project.is_favorite = !project.is_favorite;
        project.modified_at = Utc::now().to_rfc3339();

        let updated = project.clone();
        self.save_vault()?;

        Ok(updated)
    }

    pub fn add_variable(
        &mut self,
        project_id: &str,
        env_id: &str,
        key: String,
        value: String,
        is_secret: bool,
        description: String,
    ) -> Result<EnvVariable, String> {
        let data = self.decrypted_data.as_mut().ok_or("Vault is locked")?;

        let project = data
            .projects
            .iter_mut()
            .find(|p| p.id == project_id)
            .ok_or("Project not found")?;

        let env = project
            .environments
            .iter_mut()
            .find(|e| e.id == env_id)
            .ok_or("Environment not found")?;

        let variable = EnvVariable {
            id: Uuid::new_v4().to_string(),
            key,
            value,
            is_secret,
            description,
        };

        env.variables.push(variable.clone());
        project.modified_at = Utc::now().to_rfc3339();
        self.save_vault()?;

        Ok(variable)
    }

    pub fn update_variable(
        &mut self,
        project_id: &str,
        env_id: &str,
        var_id: &str,
        key: Option<String>,
        value: Option<String>,
        is_secret: Option<bool>,
        description: Option<String>,
    ) -> Result<EnvVariable, String> {
        let data = self.decrypted_data.as_mut().ok_or("Vault is locked")?;

        let project = data
            .projects
            .iter_mut()
            .find(|p| p.id == project_id)
            .ok_or("Project not found")?;

        let env = project
            .environments
            .iter_mut()
            .find(|e| e.id == env_id)
            .ok_or("Environment not found")?;

        let variable = env
            .variables
            .iter_mut()
            .find(|v| v.id == var_id)
            .ok_or("Variable not found")?;

        if let Some(v) = key {
            variable.key = v;
        }
        if let Some(v) = value {
            variable.value = v;
        }
        if let Some(v) = is_secret {
            variable.is_secret = v;
        }
        if let Some(v) = description {
            variable.description = v;
        }

        let updated = variable.clone();
        project.modified_at = Utc::now().to_rfc3339();
        self.save_vault()?;

        Ok(updated)
    }

    pub fn delete_variable(
        &mut self,
        project_id: &str,
        env_id: &str,
        var_id: &str,
    ) -> Result<(), String> {
        let data = self.decrypted_data.as_mut().ok_or("Vault is locked")?;

        let project = data
            .projects
            .iter_mut()
            .find(|p| p.id == project_id)
            .ok_or("Project not found")?;

        let env = project
            .environments
            .iter_mut()
            .find(|e| e.id == env_id)
            .ok_or("Environment not found")?;

        let pos = env
            .variables
            .iter()
            .position(|v| v.id == var_id)
            .ok_or("Variable not found")?;

        env.variables.remove(pos);
        project.modified_at = Utc::now().to_rfc3339();
        self.save_vault()?;

        Ok(())
    }

    pub fn export_env(&self, project_id: &str, env_id: &str) -> Result<String, String> {
        let data = self.decrypted_data.as_ref().ok_or("Vault is locked")?;

        let project = data
            .projects
            .iter()
            .find(|p| p.id == project_id)
            .ok_or("Project not found")?;

        let env = project
            .environments
            .iter()
            .find(|e| e.id == env_id)
            .ok_or("Environment not found")?;

        let mut lines: Vec<String> = vec![
            format!("# {} - {}", project.name, env.name),
            format!("# Generated by EnVault on {}", Utc::now().to_rfc3339()),
            String::new(),
        ];

        for var in &env.variables {
            if !var.description.is_empty() {
                lines.push(format!("# {}", var.description));
            }
            let value = if var.value.contains(' ') || var.value.contains('"') {
                format!("\"{}\"", var.value.replace('"', "\\\""))
            } else {
                var.value.clone()
            };
            lines.push(format!("{}={}", var.key, value));
        }

        lines.push(String::new());
        Ok(lines.join("\n"))
    }

    pub fn import_env(
        &mut self,
        content: &str,
        project_id: &str,
        env_id: &str,
    ) -> Result<Vec<EnvVariable>, String> {
        let data = self.decrypted_data.as_mut().ok_or("Vault is locked")?;

        let project = data
            .projects
            .iter_mut()
            .find(|p| p.id == project_id)
            .ok_or("Project not found")?;

        let env = project
            .environments
            .iter_mut()
            .find(|e| e.id == env_id)
            .ok_or("Environment not found")?;

        let mut imported: Vec<EnvVariable> = vec![];
        let mut current_description = String::new();

        for raw_line in content.lines() {
            let line = raw_line.trim();

            if line.is_empty() {
                current_description.clear();
                continue;
            }

            if let Some(comment) = line.strip_prefix('#') {
                current_description = comment.trim().to_string();
                continue;
            }

            let Some(eq_pos) = line.find('=') else {
                continue;
            };

            let key = line[..eq_pos].trim().to_string();
            let mut value = line[eq_pos + 1..].trim().to_string();

            if (value.starts_with('"') && value.ends_with('"'))
                || (value.starts_with('\'') && value.ends_with('\''))
            {
                value = value[1..value.len() - 1].to_string();
            }

            if key.is_empty() || key.contains(char::is_whitespace) {
                continue;
            }

            let lower_key = key.to_lowercase();
            let is_secret = lower_key.contains("secret")
                || lower_key.contains("password")
                || lower_key.contains("key")
                || lower_key.contains("token");

            let variable = if let Some(pos) = env.variables.iter().position(|v| v.key == key) {
                let existing_id = env.variables[pos].id.clone();
                let var = EnvVariable {
                    id: existing_id,
                    key,
                    value,
                    is_secret,
                    description: current_description.clone(),
                };
                env.variables[pos] = var.clone();
                var
            } else {
                let var = EnvVariable {
                    id: Uuid::new_v4().to_string(),
                    key,
                    value,
                    is_secret,
                    description: current_description.clone(),
                };
                env.variables.push(var.clone());
                var
            };

            imported.push(variable);
            current_description.clear();
        }

        project.modified_at = Utc::now().to_rfc3339();
        self.save_vault()?;

        Ok(imported)
    }

    pub fn initialize_with_demo_data(&mut self, password: &str) -> Result<Vec<VaultProject>, String> {
        let projects = create_demo_data();
        self.decrypted_data = Some(VaultData {
            projects: projects.clone(),
        });
        self.current_password = Some(password.to_string());
        self.save_vault()?;
        Ok(projects)
    }

    fn save_vault(&self) -> Result<(), String> {
        let data = self
            .decrypted_data
            .as_ref()
            .ok_or("Vault is locked, cannot save")?;
        let password = self
            .current_password
            .as_ref()
            .ok_or("No password, cannot save")?;

        let json = serde_json::to_string(data)
            .map_err(|e| format!("Failed to serialize vault: {e}"))?;

        let encrypted = encrypt(&json, password)?;

        let existing = read_vault_file();
        let now = Utc::now().to_rfc3339();

        write_vault_file(&EncryptedVaultFile {
            version: 1,
            salt: encrypted.salt,
            iv: encrypted.iv,
            auth_tag: encrypted.auth_tag,
            ciphertext: encrypted.ciphertext,
            created_at: existing.as_ref().map(|f| f.created_at.clone()).unwrap_or_else(|| now.clone()),
            modified_at: now,
        })?;

        Ok(())
    }
}
