import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    const where: any = {};
    if (assetId) {
      where.assetId = assetId;
    }

    const allocations = await prisma.allocation.findMany({
      where,
      include: {
        asset: {
          include: { category: true }
        },
        employee: {
          include: { department: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(allocations);
  } catch (error: any) {
    console.error('Fetch allocations error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId, employeeName, employeeEmail, expectedReturnDate } = await request.json();

    if (!assetId || (!employeeName && !employeeEmail)) {
      return NextResponse.json({ error: 'Asset and Custodian details are required' }, { status: 400 });
    }

    // Find the employee by email, or name
    let employee = null;
    if (employeeEmail) {
      employee = await prisma.employee.findUnique({
        where: { email: employeeEmail }
      });
    }

    if (!employee && employeeName) {
      employee = await prisma.employee.findFirst({
        where: { name: { contains: employeeName, mode: 'insensitive' } }
      });
    }

    // If still not found, create a mock employee to make it work seamlessly
    if (!employee) {
      const name = employeeName || 'New Employee';
      const email = employeeEmail || `${name.toLowerCase().replace(/\s+/g, '')}@assetflow.com`;
      const passwordHash = await bcrypt.hash('devpass', 10);
      employee = await prisma.employee.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'Employee',
          status: 'Active'
        }
      });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Complete any active allocation for this asset
    await prisma.allocation.updateMany({
      where: {
        assetId,
        status: 'Active'
      },
      data: {
        status: 'Returned'
      }
    });

    // Create new allocation
    const allocation = await prisma.allocation.create({
      data: {
        assetId,
        employeeId: employee.id,
        status: 'Active',
        expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
      },
      include: {
        asset: true,
        employee: true
      }
    });

    // Update asset status to Allocated
    await prisma.asset.update({
      where: { id: assetId },
      data: { status: 'Allocated' }
    });

    return NextResponse.json(allocation, { status: 201 });
  } catch (error: any) {
    console.error('Create allocation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
