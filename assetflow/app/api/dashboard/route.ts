import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'Employee') {
      // 1. My Allocated Assets count
      const myAllocatedCount = await prisma.allocation.count({
        where: {
          employeeId: session.id,
          status: 'Active'
        }
      });

      // 2. My Upcoming Bookings count
      const myBookingsCount = await prisma.booking.count({
        where: {
          employeeId: session.id,
          status: { in: ['Upcoming', 'Active'] }
        }
      });

      // 3. My Open Maintenance Requests count
      const myMaintenanceCount = await prisma.maintenanceRequest.count({
        where: {
          requestedById: session.id,
          status: { in: ['Raised', 'Approved', 'Assigned', 'InProgress'] }
        }
      });

      // 4. My Active Allocations (Assets currently held)
      const myAllocations = await prisma.allocation.findMany({
        where: {
          employeeId: session.id,
          status: 'Active'
        },
        include: {
          asset: {
            include: { category: true }
          }
        },
        orderBy: { allocatedAt: 'desc' }
      });

      // 5. My Bookings (upcoming & past)
      const myBookings = await prisma.booking.findMany({
        where: {
          employeeId: session.id
        },
        include: {
          asset: true
        },
        orderBy: { startTs: 'asc' }
      });

      // 6. My Maintenance requests
      const myMaintenance = await prisma.maintenanceRequest.findMany({
        where: {
          requestedById: session.id
        },
        include: {
          asset: true,
          assignedTo: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        role: 'Employee',
        stats: {
          myAllocated: myAllocatedCount,
          myBookings: myBookingsCount,
          myMaintenance: myMaintenanceCount
        },
        myAllocations,
        myBookings,
        myMaintenance
      });
    }

    // Admin and Manager Dashboard Data (Enterprise-wide)
    const totalAssets = await prisma.asset.count();
    const availableAssets = await prisma.asset.count({ where: { status: 'Available' } });
    const allocatedAssets = await prisma.asset.count({ where: { status: 'Allocated' } });
    const maintenanceAssets = await prisma.asset.count({ where: { status: 'Maintenance' } });
    const retiredAssets = await prisma.asset.count({ where: { status: 'Retired' } });

    const activeBookings = await prisma.booking.count({
      where: {
        status: { in: ['Upcoming', 'Active'] }
      }
    });

    const recentAllocations = await prisma.allocation.findMany({
      take: 5,
      include: {
        asset: true,
        employee: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const activities = recentAllocations.map(alloc => ({
      id: alloc.id,
      title: alloc.status === 'Active' ? `${alloc.asset.name} Deployment` : `${alloc.asset.name} Return`,
      subtitle: `Asset #${alloc.asset.tag}`,
      user: alloc.employee.name,
      time: alloc.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: alloc.status === 'Active' ? 'IN PROGRESS' : 'COMPLETED',
      icon: alloc.asset.tag.includes('Router') || alloc.asset.name.includes('Router') ? 'router' : 'laptop_mac'
    }));

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
      role: session.role,
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
