import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        asset: {
          include: { category: true }
        },
        requestedBy: true,
        assignedTo: true,
        timeline: {
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Fetch maintenance requests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId, title, description, priority } = await request.json();

    if (!assetId || !title || !description) {
      return NextResponse.json({ error: 'Asset, title, and description are required' }, { status: 400 });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Create the maintenance request and the first timeline event
    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        title,
        description,
        priority: priority || 'Medium',
        status: 'Raised',
        requestedById: session.id,
        timeline: {
          create: {
            title: 'Request Raised',
            notes: 'Ticket initialized via automated alert',
            status: 'Raised'
          }
        }
      },
      include: {
        asset: true,
        timeline: true
      }
    });

    // Update asset status to Maintenance
    await prisma.asset.update({
      where: { id: assetId },
      data: { status: 'Maintenance' }
    });

    return NextResponse.json(maintenanceRequest, { status: 201 });
  } catch (error: any) {
    console.error('Create maintenance request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
