import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId') || '';

    const where: any = {};
    if (assetId) {
      where.assetId = assetId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        asset: {
          include: { category: true }
        },
        employee: true
      },
      orderBy: { startTs: 'asc' }
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId, startTs, endTs } = await request.json();

    if (!assetId || !startTs || !endTs) {
      return NextResponse.json({ error: 'Asset, start date, and end date are required' }, { status: 400 });
    }

    // Check if asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        assetId,
        employeeId: session.id,
        startTs: new Date(startTs),
        endTs: new Date(endTs),
        status: 'Upcoming'
      },
      include: {
        asset: true,
        employee: true
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
