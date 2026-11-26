import { relations } from 'drizzle-orm';
import { boolean, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const walletTasks = pgTable(
  'wallet_tasks',
  {
    id: serial('id').primaryKey(),
    userUid: text('user_uid')
      .references(() => users.uid)
      .notNull(),
    walletAddress: text('wallet_address').notNull(),
    task1SwitchNetwork: boolean('task_1_switch_network').default(false).notNull(),
    task2GetFaucet: boolean('task_2_get_faucet').default(false).notNull(),
    task3DeployContract: boolean('task_3_deploy_contract').default(false).notNull(),
    task4AnalyzeContract: boolean('task_4_analyze_contract').default(false).notNull(),
    deployedContractAddress: text('deployed_contract_address').default(''),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('user_wallet_unique_idx').on(table.userUid, table.walletAddress),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  walletTasks: many(walletTasks),
}));

export const walletTasksRelations = relations(walletTasks, ({ one }) => ({
  user: one(users, {
    fields: [walletTasks.userUid],
    references: [users.uid],
  }),
}));
