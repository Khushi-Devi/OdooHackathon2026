import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Counts
    const totalAssets = await prisma.asset.count();
    const availableAssets = await prisma.asset.count({ where: { status: 'Available' } });
    const allocatedAssets = await prisma.asset.count({ where: { status: 'Allocated' } });
    const maintenanceAssets = await prisma.asset.count({ where: { status: 'Maintenance' } });
    const retiredAssets = await prisma.asset.count({ where: { status: 'Retired' } });

    // Active Bookings
    const activeBookings = await prisma.booking.count({
      where: {
        status: { in: ['Upcoming', 'Active'] }
      }
    });

    // Recent Allocations
    const recentAllocations = await prisma.allocation.findMany({
      take: 5,
      include: {
        asset: true,
        employee: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Construct a list of activities
    const activities = recentAllocations.map(alloc => ({
      id: alloc.id,
      title: alloc.status === 'Active' ? `${alloc.asset.name} Deployment` : `${alloc.asset.name} Return`,
      subtitle: `Asset #${alloc.asset.tag}`,
      user: alloc.employee.name,
      time: alloc.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: alloc.status === 'Active' ? 'IN PROGRESS' : 'COMPLETED',
      icon: alloc.asset.tag.includes('Router') || alloc.asset.name.includes('Router') ? 'router' : 'laptop_mac'
    }));

    // Maintenance today requests
    const maintenanceToday = await prisma.maintenanceRequest.findMany({
      where: {
        status: { in: ['Raised', 'Approved', 'Assigned', 'InProgress'] }
      },
      include: {
        asset: true,
        requestedBy: true,
        assignedTo: true
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    // Upcoming returns
    const upcomingReturns = await prisma.allocation.findMany({
      where: {
        status: 'Active'
      },
      include: {
        asset: true,
        employee: true
      },
      take: 5,
      orderBy: { expectedReturnDate: 'asc' }
    });

    return NextResponse.json({
      stats: {
        total: totalAssets,
        available: availableAssets,
        allocated: allocatedAssets,
        maintenance: maintenanceAssets,
        retired: retiredAssets,
        activeBookings
      },
      activities,
      maintenanceToday,
      upcomingReturns
    });
  } catch (error: any) {
    console.error('Fetch dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
