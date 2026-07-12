import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const employees = await prisma.employee.findMany({
      include: {
        department: true
      },
      orderBy: { name: 'asc' }
    });

    // Strip password hashes
    const sanitized = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      status: emp.status,
      departmentName: emp.department?.name || 'Unassigned'
    }));

    return NextResponse.json(sanitized);
  } catch (error: any) {
    console.error('Fetch employees error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { employeeId, newRole } = await request.json();

    if (!employeeId || !newRole) {
      return NextResponse.json({ error: 'Employee ID and new role are required' }, { status: 400 });
    }

    const validRoles = ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role value' }, { status: 400 });
    }

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: { role: newRole as any }
    });

    return NextResponse.json({
      success: true,
      message: `Employee promoted to ${newRole}`,
      employee: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role
      }
    });
  } catch (error: any) {
    console.error('Update employee role error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
