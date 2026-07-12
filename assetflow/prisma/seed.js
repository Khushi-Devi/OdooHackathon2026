const { PrismaClient, UserRole, EmployeeStatus, DepartmentStatus, AssetStatus, AllocationStatus, BookingStatus, MaintenancePriority, MaintenanceStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Clean DB
  await prisma.timelineEvent.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.allocation.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.assetCategory.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.department.deleteMany({});

  // 1. Departments
  const engineering = await prisma.department.create({
    data: { name: 'Engineering', status: DepartmentStatus.Active }
  });
  const itInfra = await prisma.department.create({
    data: { name: 'IT Infra', status: DepartmentStatus.Active }
  });
  const operations = await prisma.department.create({
    data: { name: 'Operations', status: DepartmentStatus.Active }
  });
  const sales = await prisma.department.create({
    data: { name: 'Sales', status: DepartmentStatus.Active }
  });
  const productDesign = await prisma.department.create({
    data: { name: 'Product Design', status: DepartmentStatus.Active }
  });

  console.log('Seeded departments.');

  // Hash password
  const passwordHash = await bcrypt.hash('devpass', 10);

  // 2. Employees
  const sarah = await prisma.employee.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@assetflow.com',
      passwordHash,
      role: UserRole.DepartmentHead,
      status: EmployeeStatus.Active,
      departmentId: productDesign.id
    }
  });

  const alex = await prisma.employee.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@assetflow.com',
      passwordHash,
      role: UserRole.Employee,
      status: EmployeeStatus.Active,
      departmentId: engineering.id
    }
  });

  const tom = await prisma.employee.create({
    data: {
      name: 'Tom Wilson',
      email: 'tom@assetflow.com',
      passwordHash,
      role: UserRole.AssetManager,
      status: EmployeeStatus.Active,
      departmentId: itInfra.id
    }
  });

  const marcus = await prisma.employee.create({
    data: {
      name: 'Marcus Knight',
      email: 'marcus@assetflow.com',
      passwordHash,
      role: UserRole.Employee,
      status: EmployeeStatus.Active,
      departmentId: engineering.id
    }
  });

  const admin = await prisma.employee.create({
    data: {
      name: 'Admin User',
      email: 'admin@assetflow.com',
      passwordHash,
      role: UserRole.Admin,
      status: EmployeeStatus.Active,
      departmentId: itInfra.id
    }
  });

  console.log('Seeded employees.');

  // 3. Asset Categories
  const computing = await prisma.assetCategory.create({ data: { name: 'Computing' } });
  const networking = await prisma.assetCategory.create({ data: { name: 'Networking' } });
  const furniture = await prisma.assetCategory.create({ data: { name: 'Furniture' } });
  const avEquipment = await prisma.assetCategory.create({ data: { name: 'AV Equipment' } });
  const facilities = await prisma.assetCategory.create({ data: { name: 'Facilities' } });

  console.log('Seeded asset categories.');

  // 4. Assets
  const macbook1 = await prisma.asset.create({
    data: {
      tag: 'AF-2024-001',
      name: 'MacBook Pro M3 Max',
      status: AssetStatus.Available,
      condition: 'Excellent',
      isBookable: true,
      riskScore: 1.2,
      categoryId: computing.id
    }
  });

  const router = await prisma.asset.create({
    data: {
      tag: 'AF-2024-042',
      name: 'Enterprise Core Router',
      status: AssetStatus.Available,
      condition: 'Good',
      isBookable: false,
      riskScore: 2.5,
      categoryId: networking.id
    }
  });

  const chair = await prisma.asset.create({
    data: {
      tag: 'AF-2023-912',
      name: 'Herman Miller Aeron',
      status: AssetStatus.Maintenance,
      condition: 'Fair',
      isBookable: false,
      riskScore: 0.5,
      categoryId: furniture.id
    }
  });

  const rallybar = await prisma.asset.create({
    data: {
      tag: 'AF-2024-115',
      name: 'Logitech Rally Bar',
      status: AssetStatus.Available,
      condition: 'Excellent',
      isBookable: true,
      riskScore: 0.8,
      categoryId: avEquipment.id
    }
  });

  const gpu = await prisma.asset.create({
    data: {
      tag: 'AF-2024-089',
      name: 'Nvidia RTX 4090 TI',
      status: AssetStatus.Available,
      condition: 'Excellent',
      isBookable: false,
      riskScore: 3.1,
      categoryId: computing.id
    }
  });

  const macbook2 = await prisma.asset.create({
    data: {
      tag: 'AST-99201',
      name: 'MacBook Pro 16" (2023)',
      status: AssetStatus.Allocated,
      condition: 'Excellent',
      isBookable: true,
      riskScore: 1.5,
      categoryId: computing.id
    }
  });

  const hvac = await prisma.asset.create({
    data: {
      tag: 'AST-4092',
      name: 'HVAC Spindle Compressor',
      status: AssetStatus.Maintenance,
      condition: 'Damaged',
      isBookable: false,
      riskScore: 8.5,
      categoryId: facilities.id
    }
  });

  console.log('Seeded assets.');

  // 5. Allocations
  // Current active allocation
  await prisma.allocation.create({
    data: {
      assetId: macbook2.id,
      employeeId: sarah.id,
      status: AllocationStatus.Active,
      allocatedAt: new Date('2024-01-12T09:00:00Z'),
      expectedReturnDate: new Date('2026-10-12T17:00:00Z')
    }
  });

  // Historical returned allocation
  await prisma.allocation.create({
    data: {
      assetId: macbook2.id,
      employeeId: marcus.id,
      status: AllocationStatus.Returned,
      allocatedAt: new Date('2023-10-05T09:00:00Z'),
      expectedReturnDate: new Date('2024-01-11T17:00:00Z'),
      createdAt: new Date('2023-10-05T09:00:00Z'),
      updatedAt: new Date('2024-01-11T17:00:00Z')
    }
  });

  console.log('Seeded allocations.');

  // 6. Bookings
  // Completed past booking
  await prisma.booking.create({
    data: {
      assetId: rallybar.id,
      employeeId: sarah.id,
      startTs: new Date('2026-07-13T09:00:00Z'),
      endTs: new Date('2026-07-13T10:30:00Z'),
      status: BookingStatus.Completed
    }
  });

  // Upcoming booking
  await prisma.booking.create({
    data: {
      assetId: macbook2.id,
      employeeId: sarah.id,
      startTs: new Date('2026-07-15T10:00:00Z'),
      endTs: new Date('2026-07-15T12:00:00Z'),
      status: BookingStatus.Upcoming
    }
  });

  console.log('Seeded bookings.');

  // 7. Maintenance Request
  const request = await prisma.maintenanceRequest.create({
    data: {
      assetId: hvac.id,
      title: 'HVAC Compressor Failure',
      description: 'Primary compressor in HVAC unit 4-B has stopped cycling. Temperature in the north wing has risen by 4.2°C in the last hour. Multiple staff reports of discomfort. Maintenance sensors confirm zero RPM on main spindle.',
      priority: MaintenancePriority.Critical,
      status: MaintenanceStatus.InProgress,
      requestedById: alex.id,
      assignedToId: tom.id
    }
  });

  // Timeline events for the request
  await prisma.timelineEvent.create({
    data: {
      requestId: request.id,
      title: 'Request Raised',
      notes: 'Ticket initialized via automated alert',
      status: 'Raised',
      timestamp: new Date('2026-07-12T08:30:00Z')
    }
  });

  await prisma.timelineEvent.create({
    data: {
      requestId: request.id,
      title: 'Approved',
      notes: 'Budget authorized by Facility Manager',
      status: 'Approved',
      timestamp: new Date('2026-07-12T09:12:00Z')
    }
  });

  await prisma.timelineEvent.create({
    data: {
      requestId: request.id,
      title: 'Technician Assigned',
      notes: 'Assigned to Alex Rivera',
      status: 'Assigned',
      timestamp: new Date('2026-07-12T10:45:00Z')
    }
  });

  await prisma.timelineEvent.create({
    data: {
      requestId: request.id,
      title: 'In Progress',
      notes: 'Technician performing spindle alignment.',
      status: 'InProgress',
      timestamp: new Date('2026-07-12T11:00:00Z')
    }
  });

  console.log('Seeded maintenance request.');

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
