import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: 'Email, token, and new password are required' }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!employee || !employee.resetToken || !employee.resetTokenExpiry) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (employee.resetToken !== token.toUpperCase().trim()) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    if (new Date() > new Date(employee.resetTokenExpiry)) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({ success: true, message: 'Password reset successful' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
