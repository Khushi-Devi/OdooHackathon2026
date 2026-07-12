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

    // Role check: Only Admin or Manager can allocate assets
    if (session.role !== 'Admin' && session.role !== 'Manager') {
      return NextResponse.json({ error: 'Forbidden: Only Admins or Managers can allocate assets' }, { status: 403 });
    }

    const { assetId, employeeName, employeeEmail, expectedReturnDate } = await request.json();

    if (!assetId || (!employeeName && !employeeEmail)) {
      return NextResponse.json({ error: 'Asset and Custodian details are required' }, { status: 400 });
    }

    // Find the employee/department by email or name
    let employee = null;
    if (employeeEmail) {
      employee = await prisma.employee.findUnique({
        where: { email: employeeEmail }
      });
    }

    if (!employee && employeeName) {
      employee = await prisma.employee.findFirst({
        where: { name: { equals: employeeName, mode: 'insensitive' } }
      });
      
      // If still not found, check if it matches a department name, and get the first employee of that department
      if (!employee) {
        const dept = await prisma.department.findFirst({
          where: { name: { equals: employeeName, mode: 'insensitive' } },
          include: { employees: true }
        });
        if (dept && dept.employees.length > 0) {
          employee = dept.employees[0];
        }
      }
    }

    if (!employee) {
      return NextResponse.json({ error: 'Custodian employee or department not found' }, { status: 404 });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Check if asset already has an active allocation (Double-allocation prevention)
    const activeAllocation = await prisma.allocation.findFirst({
      where: {
        assetId,
        status: 'Active'
      },
      include: {
        employee: true
      }
    });

    if (activeAllocation) {
      return NextResponse.json({
        error: `Conflict: Asset is already allocated to ${activeAllocation.employee.name} (${activeAllocation.employee.email}).`
      }, { status: 409 });
    }

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
