import { and, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users, walletTasks } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to get or create user in database:', error);
    throw new Error('Database operation failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function getWalletTasks(uid: string, walletAddress: string) {
  const normalizedAddress = walletAddress.toLowerCase();
  try {
    const existing = await db
      .select()
      .from(walletTasks)
      .where(
        and(
          eq(walletTasks.userUid, uid),
          eq(walletTasks.walletAddress, normalizedAddress)
        )
      );

    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db
      .insert(walletTasks)
      .values({
        userUid: uid,
        walletAddress: normalizedAddress,
        task1SwitchNetwork: false,
        task2GetFaucet: false,
        task3DeployContract: false,
        task4AnalyzeContract: false,
        deployedContractAddress: '',
      })
      .onConflictDoUpdate({
        target: [walletTasks.userUid, walletTasks.walletAddress],
        set: {
          updatedAt: new Date(),
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to query wallet tasks:', error);
    throw new Error('Failed to retrieve developer progress.', { cause: error });
  }
}

export interface UpdateWalletTaskPayload {
  task1SwitchNetwork?: boolean;
  task2GetFaucet?: boolean;
  task3DeployContract?: boolean;
  task4AnalyzeContract?: boolean;
  deployedContractAddress?: string;
}

export async function updateWalletTasks(
  uid: string,
  walletAddress: string,
  payload: UpdateWalletTaskPayload
) {
  const normalizedAddress = walletAddress.toLowerCase();
  try {
    const current = await getWalletTasks(uid, normalizedAddress);

    const updated = await db
      .update(walletTasks)
      .set({
        task1SwitchNetwork:
          payload.task1SwitchNetwork ?? current.task1SwitchNetwork,
        task2GetFaucet: payload.task2GetFaucet ?? current.task2GetFaucet,
        task3DeployContract:
          payload.task3DeployContract ?? current.task3DeployContract,
        task4AnalyzeContract:
          payload.task4AnalyzeContract ?? current.task4AnalyzeContract,
        deployedContractAddress:
          payload.deployedContractAddress ?? current.deployedContractAddress,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(walletTasks.userUid, uid),
          eq(walletTasks.walletAddress, normalizedAddress)
        )
      )
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Failed to update wallet tasks:', error);
    throw new Error('Failed to save developer progress.', { cause: error });
  }
}
