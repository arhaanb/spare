import { NextRequest, NextResponse } from 'next/server';
import { getLeftoverItemsCollection } from '@/lib/db/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant_id, date, items } = body;

    if (!merchant_id || !date || !items) {
      return NextResponse.json(
        { error: 'merchant_id, date, and items are required' },
        { status: 400 }
      );
    }

    const collection = await getLeftoverItemsCollection();

    // Upsert to MongoDB
    await collection.updateOne(
      { merchant_id, date },
      {
        $set: {
          merchant_id,
          date,
          items,
          updated_at: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Items saved successfully' });
  } catch (error: any) {
    console.error('Leftover items API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
