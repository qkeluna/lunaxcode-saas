import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: text('role').notNull().default('client'), // 'admin' | 'client'
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Service Types table (must be before projects for foreign key)
export const serviceTypes = sqliteTable('service_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  basePrice: integer('base_price').notNull(),
  features: text('features'), // JSON string
  timeline: text('timeline'), // e.g., "2-3 weeks", "1-2 months"
  popular: integer('popular', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Questions table (dynamic onboarding questions per service type)
export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serviceId: integer('service_id').notNull().references(() => serviceTypes.id, { onDelete: 'cascade' }),
  questionKey: text('question_key').notNull().unique(), // Unique identifier for the question (e.g., 'target_audience', 'design_preferences')
  questionText: text('question_text').notNull(), // The actual question to display
  questionType: text('question_type').notNull(), // 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number'
  required: integer('required', { mode: 'boolean' }).notNull().default(false),
  placeholder: text('placeholder'),
  sortOrder: integer('sort_order').default(0), // For ordering questions in the form
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Question Options table (for select, radio, checkbox question types)
export const questionOptions = sqliteTable('question_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  optionValue: text('option_value').notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Projects table
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  serviceTypeId: integer('service_type_id').notNull().references(() => serviceTypes.id), // Made NOT NULL
  name: text('name').notNull(),
  service: text('service').notNull(), // Keep for backward compatibility, but use serviceTypeId
  description: text('description').notNull(),
  prd: text('prd'), // Generated PRD (nullable until AI generates it)
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  clientPhone: text('client_phone'),
  timeline: integer('timeline'), // days (can be derived from service_types)
  budget: integer('budget'), // Can be derived from service_types basePrice
  price: integer('price').notNull(), // Final calculated price
  paymentStatus: text('payment_status').default('pending'), // 'pending' | 'partially-paid' | 'paid'
  depositAmount: integer('deposit_amount').default(0),
  status: text('status').default('pending'), // 'pending' | 'in-progress' | 'completed' | 'on-hold'
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Project Answers table (stores onboarding question answers for each project)
export const projectAnswers = sqliteTable('project_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  questionId: integer('question_id').notNull().references(() => questions.id),
  questionKey: text('question_key').notNull(), // Denormalized for quick access
  answerValue: text('answer_value').notNull(), // Store as JSON string for arrays/objects
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Tasks table
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  section: text('section').notNull(),
  priority: text('priority').notNull(), // 'low' | 'medium' | 'high'
  status: text('status').default('pending'), // 'pending' (backlog) | 'to-do' | 'in-progress' | 'testing' | 'done'
  estimatedHours: integer('estimated_hours').notNull(),
  dependencies: text('dependencies'),
  order: integer('order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Payments table - Manual bank transfer verification
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(),
  paymentType: text('payment_type').notNull(), // 'deposit' | 'completion' (50% each)
  paymentMethod: text('payment_method').notNull(), // 'gcash' | 'seabank' | 'paymaya' | 'bank_transfer'
  
  // Payment proof details
  proofImageUrl: text('proof_image_url'), // R2 URL or base64 data URL
  referenceNumber: text('reference_number'), // Transaction reference from bank
  senderName: text('sender_name'), // Name of person who sent payment
  senderAccountNumber: text('sender_account_number'), // Last 4 digits or partial account
  
  // Admin verification
  status: text('status').notNull().default('pending'), // 'pending' | 'verified' | 'rejected'
  verifiedBy: text('verified_by'), // Admin user ID who verified
  verifiedAt: integer('verified_at', { mode: 'timestamp' }),
  rejectionReason: text('rejection_reason'),
  adminNotes: text('admin_notes'),
  
  metadata: text('metadata'), // JSON string for additional data
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Files table
export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  filename: text('filename').notNull(),
  filepath: text('filepath').notNull(),
  filesize: integer('filesize').notNull(),
  mimetype: text('mimetype').notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Messages table
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull(),
  senderRole: text('sender_role').notNull().default('client').$type<'client' | 'admin'>(), // 'client' | 'admin'
  content: text('content').notNull(),
  status: text('status').notNull().default('sent').$type<'sent' | 'read'>(), // 'sent' | 'read'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  readAt: integer('read_at', { mode: 'timestamp' }),
});

// Unread counts cache (denormalized for performance)
export const unreadCounts = sqliteTable('unread_counts', {
  userId: text('user_id').primaryKey(),
  totalCount: integer('total_count').notNull().default(0),
  lastUpdated: integer('last_updated', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Message settings per project
export const messageSettings = sqliteTable('message_settings', {
  projectId: integer('project_id').primaryKey().references(() => projects.id, { onDelete: 'cascade' }),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
});

// FAQs table
export const faqs = sqliteTable('faqs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category'),
  order: integer('order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Portfolio table (case studies/project showcase)
export const portfolio = sqliteTable('portfolio', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  client: text('client').notNull(),
  category: text('category').notNull(), // 'web-app' | 'mobile-app' | 'saas' | 'e-commerce'
  imageUrl: text('image_url'),
  liveUrl: text('live_url'),
  technologies: text('technologies'), // JSON string array
  results: text('results'), // JSON string with metrics
  testimonial: text('testimonial'),
  order: integer('order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Process Steps table (how we work section)
export const processSteps = sqliteTable('process_steps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon'), // Icon name or emoji
  order: integer('order').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Features table (landing page features)
export const features = sqliteTable('features', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon'), // Icon name or emoji
  category: text('category'), // 'core' | 'technical' | 'business'
  order: integer('order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Payment Accounts table (admin-managed bank accounts for receiving payments)
export const paymentAccounts = sqliteTable('payment_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountType: text('account_type').notNull(), // 'gcash' | 'seabank' | 'paymaya' | 'bank_transfer'
  accountName: text('account_name').notNull(), // Account holder name
  accountNumber: text('account_number').notNull(), // Phone number for e-wallets, account number for banks
  bankName: text('bank_name'), // Only for bank_transfer type
  instructions: text('instructions'), // Special instructions for this payment method
  qrCodeUrl: text('qr_code_url'), // Optional QR code image for GCash/PayMaya
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  order: integer('order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// NextAuth Session table
export const sessions = sqliteTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// NextAuth Account table
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

// NextAuth Verification Token table
export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type UnreadCount = typeof unreadCounts.$inferSelect;
export type NewUnreadCount = typeof unreadCounts.$inferInsert;

export type MessageSetting = typeof messageSettings.$inferSelect;
export type NewMessageSetting = typeof messageSettings.$inferInsert;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type NewServiceType = typeof serviceTypes.$inferInsert;

export type FAQ = typeof faqs.$inferSelect;
export type NewFAQ = typeof faqs.$inferInsert;

export type Portfolio = typeof portfolio.$inferSelect;
export type NewPortfolio = typeof portfolio.$inferInsert;

export type ProcessStep = typeof processSteps.$inferSelect;
export type NewProcessStep = typeof processSteps.$inferInsert;

export type Feature = typeof features.$inferSelect;
export type NewFeature = typeof features.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type QuestionOption = typeof questionOptions.$inferSelect;
export type NewQuestionOption = typeof questionOptions.$inferInsert;
