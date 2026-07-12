import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existing = await prisma.employee.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Find default department "Engineering" if it exists, or set to null
    const defaultDept = await prisma.department.findUnique({
      where: { name: 'Engineering' }
    });

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'Employee',
        status: 'Active',
        departmentId: defaultDept ? defaultDept.id : null
      },
    });

    await setSession({
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
    });

    return NextResponse.json({
      success: true,
      user: { id: employee.id, email: employee.email, name: employee.name, role: employee.role }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
