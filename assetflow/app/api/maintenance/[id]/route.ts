import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, context: any) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { status, notes, assignedToId } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Find the request
    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true }
    });

    if (!maintenanceRequest) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = { status };
    let timelineTitle = status;

    if (assignedToId) {
      updateData.assignedToId = assignedToId;
      const emp = await prisma.employee.findUnique({ where: { id: assignedToId } });
      if (emp) {
        timelineTitle = `Technician Assigned`;
        updateData.status = 'Assigned';
      }
    }

    // If status is being updated, log it in Timeline
    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...updateData,
        timeline: {
          create: {
            title: timelineTitle,
            notes: notes || `Workflow status updated to ${updateData.status || status}`,
            status: updateData.status || status
          }
        }
      },
      include: {
        asset: true,
        timeline: true
      }
    });

    // If status is Resolved, update Asset status to Available
    if (status === 'Resolved') {
      await prisma.asset.update({
        where: { id: maintenanceRequest.assetId },
        data: { status: 'Available' }
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update maintenance request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
