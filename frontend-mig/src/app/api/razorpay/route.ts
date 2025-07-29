import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST() {
  try {
    const options = {
      amount: 50000, // 500 INR in paise
      currency: 'INR',
      receipt: 'coffee_' + Date.now(),
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Razorpay error:', error);
    return NextResponse.json(
      { error: 'Error creating Razorpay order' },
      { status: 500 }
    );
  }
}