import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Better Auth tables ─────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Email App tables ───────────────────────────────────────────────

export const emailAccounts = pgTable(
  'email_accounts',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    name: text('name').notNull(),
    resendApiKey: text('resend_api_key').notNull(),
    domainId: text('domain_id'),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('email_accounts_user_id_idx').on(t.userId)],
);

export const threads = pgTable(
  'threads',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    accountId: text('account_id')
      .notNull()
      .references(() => emailAccounts.id, { onDelete: 'cascade' }),
    subject: text('subject').notNull(),
    lastMessageAt: timestamp('last_message_at').notNull().defaultNow(),
    messageCount: integer('message_count').notNull().default(0),
    isRead: boolean('is_read').notNull().default(false),
    isStarred: boolean('is_starred').notNull().default(false),
    snippet: text('snippet'),
    aiSummary: text('ai_summary'),
    labels: jsonb('labels').$type<string[]>().default([]),
  },
  (t) => [
    index('threads_account_id_idx').on(t.accountId),
    index('threads_last_message_at_idx').on(t.lastMessageAt),
  ],
);

export const emails = pgTable(
  'emails',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    accountId: text('account_id')
      .notNull()
      .references(() => emailAccounts.id, { onDelete: 'cascade' }),
    threadId: text('thread_id').references(() => threads.id, { onDelete: 'set null' }),
    messageId: text('message_id'),
    direction: text('direction', { enum: ['inbound', 'outbound'] }).notNull(),
    from: text('from').notNull(),
    to: jsonb('to').$type<string[]>().notNull(),
    cc: jsonb('cc').$type<string[]>(),
    bcc: jsonb('bcc').$type<string[]>(),
    subject: text('subject').notNull(),
    bodyHtml: text('body_html'),
    bodyText: text('body_text'),
    snippet: text('snippet'),
    isRead: boolean('is_read').notNull().default(false),
    isStarred: boolean('is_starred').notNull().default(false),
    status: text('status', { enum: ['draft', 'sent', 'delivered', 'failed'] })
      .notNull()
      .default('draft'),
    aiSummary: text('ai_summary'),
    aiCategory: text('ai_category'),
    aiPriority: integer('ai_priority'),
    headers: jsonb('headers').$type<Record<string, string>>(),
    sentAt: timestamp('sent_at'),
    receivedAt: timestamp('received_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('emails_account_id_idx').on(t.accountId),
    index('emails_thread_id_idx').on(t.threadId),
    index('emails_direction_idx').on(t.direction),
    index('emails_received_at_idx').on(t.receivedAt),
    index('emails_is_read_idx').on(t.isRead),
  ],
);

export const labels = pgTable(
  'labels',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    accountId: text('account_id')
      .notNull()
      .references(() => emailAccounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color'),
    type: text('type', { enum: ['system', 'user'] })
      .notNull()
      .default('user'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('labels_account_id_idx').on(t.accountId)],
);

export const emailLabels = pgTable(
  'email_labels',
  {
    emailId: text('email_id')
      .notNull()
      .references(() => emails.id, { onDelete: 'cascade' }),
    labelId: text('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.emailId, t.labelId] })],
);

// ─── BYOK Resend Configuration ──────────────────────────────────────

export const userResendConfigs = pgTable('user_resend_configs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  resendApiKeyEncrypted: text('resend_api_key_encrypted').notNull(),
  resendApiKeyIv: text('resend_api_key_iv').notNull(),
  resendApiKeyTag: text('resend_api_key_tag').notNull(),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userDomains = pgTable(
  'user_domains',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    resendConfigId: text('resend_config_id')
      .notNull()
      .references(() => userResendConfigs.id, { onDelete: 'cascade' }),
    domainName: text('domain_name').notNull(),
    resendDomainId: text('resend_domain_id').notNull(),
    status: text('status', { enum: ['verified', 'pending', 'failed'] }).notNull().default('pending'),
    canSend: boolean('can_send').notNull().default(false),
    canReceive: boolean('can_receive').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('user_domains_user_id_idx').on(t.userId),
    index('user_domains_config_id_idx').on(t.resendConfigId),
  ],
);

export const userEmailAddresses = pgTable(
  'user_email_addresses',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    domainId: text('domain_id')
      .notNull()
      .references(() => userDomains.id, { onDelete: 'cascade' }),
    emailAddress: text('email_address').notNull().unique(),
    displayName: text('display_name'),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('user_email_addresses_user_id_idx').on(t.userId),
    index('user_email_addresses_domain_id_idx').on(t.domainId),
  ],
);

// ─── User Settings ──────────────────────────────────────────────────

export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  displayName: text('display_name'),
  emailSignature: text('email_signature'),
  theme: text('theme', { enum: ['light', 'dark', 'system'] }).notNull().default('light'),
  aiClassification: boolean('ai_classification').notNull().default(true),
  aiReplySuggestions: boolean('ai_reply_suggestions').notNull().default(true),
  aiComposeTone: text('ai_compose_tone', { enum: ['professional', 'casual', 'friendly'] }).notNull().default('professional'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Relations ──────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  emailAccounts: many(emailAccounts),
  settings: one(userSettings),
  resendConfig: one(userResendConfigs),
  domains: many(userDomains),
  emailAddresses: many(userEmailAddresses),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] }),
}));

export const emailAccountsRelations = relations(emailAccounts, ({ one, many }) => ({
  user: one(users, { fields: [emailAccounts.userId], references: [users.id] }),
  emails: many(emails),
  threads: many(threads),
  labels: many(labels),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  account: one(emailAccounts, { fields: [threads.accountId], references: [emailAccounts.id] }),
  emails: many(emails),
}));

export const emailsRelations = relations(emails, ({ one, many }) => ({
  account: one(emailAccounts, { fields: [emails.accountId], references: [emailAccounts.id] }),
  thread: one(threads, { fields: [emails.threadId], references: [threads.id] }),
  emailLabels: many(emailLabels),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  account: one(emailAccounts, { fields: [labels.accountId], references: [emailAccounts.id] }),
  emailLabels: many(emailLabels),
}));

export const emailLabelsRelations = relations(emailLabels, ({ one }) => ({
  email: one(emails, { fields: [emailLabels.emailId], references: [emails.id] }),
  label: one(labels, { fields: [emailLabels.labelId], references: [labels.id] }),
}));

// ─── BYOK Relations ─────────────────────────────────────────────────

export const userResendConfigsRelations = relations(userResendConfigs, ({ one, many }) => ({
  user: one(users, { fields: [userResendConfigs.userId], references: [users.id] }),
  domains: many(userDomains),
}));

export const userDomainsRelations = relations(userDomains, ({ one, many }) => ({
  user: one(users, { fields: [userDomains.userId], references: [users.id] }),
  resendConfig: one(userResendConfigs, { fields: [userDomains.resendConfigId], references: [userResendConfigs.id] }),
  emailAddresses: many(userEmailAddresses),
}));

export const userEmailAddressesRelations = relations(userEmailAddresses, ({ one }) => ({
  user: one(users, { fields: [userEmailAddresses.userId], references: [users.id] }),
  domain: one(userDomains, { fields: [userEmailAddresses.domainId], references: [userDomains.id] }),
}));
