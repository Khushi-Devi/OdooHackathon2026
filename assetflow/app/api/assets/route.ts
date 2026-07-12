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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tag: { contains: search, mode: 'insensitive' } },
        { condition: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (category && category !== 'All') {
      where.category = {
        name: category
      };
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        category: true,
        allocations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { employee: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(assets);
  } catch (error: any) {
    console.error('Fetch assets error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tag, name, categoryName, condition, isBookable, riskScore } = await request.json();

    if (!tag || !name || !categoryName) {
      return NextResponse.json({ error: 'Tag, Name, and Category are required' }, { status: 400 });
    }

    // Find or create category
    let category = await prisma.assetCategory.findUnique({
      where: { name: categoryName }
    });

    if (!category) {
      category = await prisma.assetCategory.create({
        data: { name: categoryName }
      });
    }

    const asset = await prisma.asset.create({
      data: {
        tag,
        name,
        categoryId: category.id,
        condition: condition || 'Excellent',
        isBookable: isBookable ?? false,
        riskScore: riskScore ? parseFloat(riskScore) : 0,
        status: 'Available'
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    console.error('Create asset error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
