import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only Admin or Manager can check-in/return assets
    if (session.role !== 'Admin' && session.role !== 'Manager') {
      return NextResponse.json({ error: 'Forbidden: Only Admins or Managers can check in assets' }, { status: 403 });
    }

    const { allocationId } = await request.json();

    if (!allocationId) {
      return NextResponse.json({ error: 'Allocation ID is required' }, { status: 400 });
    }

    // Find the allocation
    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
      include: { asset: true }
    });

    if (!allocation) {
      return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });
    }

    if (allocation.status === 'Returned') {
      return NextResponse.json({ error: 'Asset has already been returned' }, { status: 400 });
    }

    // Update allocation status to Returned
    const updatedAllocation = await prisma.allocation.update({
      where: { id: allocationId },
      data: { status: 'Returned' }
    });

    // Update asset status to Available
    await prisma.asset.update({
      where: { id: allocation.assetId },
      data: { status: 'Available' }
    });

    return NextResponse.json({
      success: true,
      allocation: updatedAllocation
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
