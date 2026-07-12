import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Email address not found' }, { status: 404 });
    }

    // Generate a simple 6-character hex token (e.g. F3B49A)
    const token = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset token generated.',
      token // Return the token directly for the demo flow
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
