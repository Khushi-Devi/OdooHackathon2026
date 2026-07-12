import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: session.id },
      select: { departmentId: true }
    });
    const deptId = employee?.departmentId;

    if (session.role === 'Employee') {
      // 1. Employee: Own data only
      const myAllocations = await prisma.allocation.findMany({
        where: { employeeId: session.id, status: 'Active' },
        include: { asset: { include: { category: true } } },
        orderBy: { allocatedAt: 'desc' }
      });

      const myBookings = await prisma.booking.findMany({
        where: { employeeId: session.id },
        include: { asset: true },
        orderBy: { startTs: 'asc' },
        take: 5
      });

      const myMaintenance = await prisma.maintenanceRequest.findMany({
        where: { requestedById: session.id },
        include: { asset: true, assignedTo: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      return NextResponse.json({
        role: 'Employee',
        stats: {
          myAssets: myAllocations.length,
          myBookings: myBookings.length,
          myMaintenance: myMaintenance.length
        },
        myAllocations,
        myBookings,
        myMaintenance
      });
    }

    if (session.role === 'DepartmentHead' && deptId) {
      // 2. Department Head: Filtered by department
      const totalDeptAssets = await prisma.asset.count({
        where: {
          allocations: {
            some: {
              employee: { departmentId: deptId },
              status: 'Active'
            }
          }
        }
      });

      const deptBookings = await prisma.booking.count({
        where: {
          employee: { departmentId: deptId },
          status: { in: ['Upcoming', 'Active'] }
        }
      });

      const deptMaintenance = await prisma.maintenanceRequest.count({
        where: {
          requestedBy: { departmentId: deptId },
          status: { in: ['Raised', 'Approved', 'Assigned', 'InProgress'] }
        }
      });

      const recentAllocations = await prisma.allocation.findMany({
        where: {
          employee: { departmentId: deptId }
        },
        take: 5,
        include: { asset: true, employee: true },
        orderBy: { createdAt: 'desc' }
      });

      const activities = recentAllocations.map(alloc => ({
        id: alloc.id,
        title: alloc.status === 'Active' ? `${alloc.asset.name} Deployment` : `${alloc.asset.name} Return`,
        subtitle: `Asset #${alloc.asset.tag}`,
        user: alloc.employee.name,
        time: alloc.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: alloc.status === 'Active' ? 'IN PROGRESS' : 'COMPLETED',
        icon: 'laptop_mac'
      }));

      const maintenanceToday = await prisma.maintenanceRequest.findMany({
        where: {
          requestedBy: { departmentId: deptId },
          status: { in: ['Raised', 'Approved', 'Assigned', 'InProgress'] }
        },
        include: { asset: true, requestedBy: true, assignedTo: true },
        take: 3,
        orderBy: { createdAt: 'desc' }
      });

      const upcomingReturns = await prisma.allocation.findMany({
        where: {
          employee: { departmentId: deptId },
          status: 'Active'
        },
        include: { asset: true, employee: true },
        take: 5,
        orderBy: { expectedReturnDate: 'asc' }
      });

      return NextResponse.json({
        role: 'DepartmentHead',
        stats: {
          total: totalDeptAssets,
          available: 0,
          allocated: totalDeptAssets,
          maintenance: deptMaintenance,
          retired: 0,
          activeBookings: deptBookings
        },
        activities,
        maintenanceToday,
        upcomingReturns
      });
    }

    // 3. Admin / Asset Manager: Global access
    const totalAssets = await prisma.asset.count();
    const availableAssets = await prisma.asset.count({ where: { status: 'Available' } });
    const allocatedAssets = await prisma.asset.count({ where: { status: 'Allocated' } });
    const maintenanceAssets = await prisma.asset.count({ where: { status: 'Maintenance' } });
    const retiredAssets = await prisma.asset.count({ where: { status: 'Retired' } });

    const activeBookings = await prisma.booking.count({
      where: { status: { in: ['Upcoming', 'Active'] } }
    });

    const recentAllocations = await prisma.allocation.findMany({
      take: 5,
      include: { asset: true, employee: true },
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
      where: { status: { in: ['Raised', 'Approved', 'Assigned', 'InProgress'] } },
      include: { asset: true, requestedBy: true, assignedTo: true },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    const upcomingReturns = await prisma.allocation.findMany({
      where: { status: 'Active' },
      include: { asset: true, employee: true },
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
