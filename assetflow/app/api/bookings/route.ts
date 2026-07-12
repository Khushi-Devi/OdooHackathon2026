import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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

    const start = new Date(startTs);
    const end = new Date(endTs);

    if (start >= end) {
      return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
    }

    // Check overlap with any booking of the same asset that is not Cancelled
    const overlap = await prisma.booking.findFirst({
      where: {
        assetId,
        status: { not: 'Cancelled' },
        startTs: { lt: end },
        endTs: { gt: start }
      },
      include: {
        employee: true
      }
    });

    if (overlap) {
      return NextResponse.json({
        error: `Conflict: This asset is already booked by ${overlap.employee.name} from ${overlap.startTs.toLocaleString()} to ${overlap.endTs.toLocaleString()}.`
      }, { status: 409 });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        assetId,
        employeeId: session.id,
        startTs: start,
        endTs: end,
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
