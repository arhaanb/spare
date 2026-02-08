import { NextRequest, NextResponse } from 'next/server';
import { createMerchant, verifyMerchantPassword, getMerchantById } from '@/lib/api/merchants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const merchant = await createMerchant(body.data);
      return NextResponse.json(merchant);
    }

    if (action === 'login') {
      const { email, password } = body;
      const merchant = await verifyMerchantPassword(email, password);
      
      if (!merchant) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(merchant);
    }

    if (action === 'getById') {
      const { merchantId } = body;
      const merchant = await getMerchantById(merchantId);
      
      if (!merchant) {
        return NextResponse.json(
          { error: 'Merchant not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(merchant);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Merchant API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    if (!merchantId) {
      return NextResponse.json(
        { error: 'merchantId required' },
        { status: 400 }
      );
    }

    const merchant = await getMerchantById(merchantId);
    
    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(merchant);
  } catch (error: any) {
    console.error('Merchant API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
