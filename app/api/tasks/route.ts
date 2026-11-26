import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin.ts';
import {
  getOrCreateUser,
  getWalletTasks,
  updateWalletTasks,
} from '@/src/db/users.ts';

async function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    await getOrCreateUser(decoded.uid, decoded.email || 'developer@zenith.network');
    return decoded;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid authentication token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const wallet = (searchParams.get('wallet') || 'default_wallet').trim().toLowerCase();

    const tasks = await getWalletTasks(user.uid, wallet);
    return NextResponse.json({ tasks });
  } catch (error: unknown) {
    console.error('GET /api/tasks failed:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to load developer progress';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid authentication token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const wallet = (
      typeof body.walletAddress === 'string' && body.walletAddress.trim()
        ? body.walletAddress.trim()
        : 'default_wallet'
    ).toLowerCase();

    const updated = await updateWalletTasks(user.uid, wallet, {
      task1SwitchNetwork:
        typeof body.task1SwitchNetwork === 'boolean'
          ? body.task1SwitchNetwork
          : undefined,
      task2GetFaucet:
        typeof body.task2GetFaucet === 'boolean' ? body.task2GetFaucet : undefined,
      task3DeployContract:
        typeof body.task3DeployContract === 'boolean'
          ? body.task3DeployContract
          : undefined,
      task4AnalyzeContract:
        typeof body.task4AnalyzeContract === 'boolean'
          ? body.task4AnalyzeContract
          : undefined,
      deployedContractAddress:
        typeof body.deployedContractAddress === 'string'
          ? body.deployedContractAddress.trim()
          : undefined,
    });

    return NextResponse.json({ tasks: updated });
  } catch (error: unknown) {
    console.error('POST /api/tasks failed:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to update developer progress';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
