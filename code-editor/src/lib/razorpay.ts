// Types for Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: <T = unknown>(event: string, callback: (response: T) => void) => void;
}

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (amount: number, description: string): Promise<void> => {
  try {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error('Failed to load Razorpay');
      }
    }

    // Create order on your server
    const response = await fetch('/api/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const order: { id: string } = await response.json();

    // Open Razorpay checkout
    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Codify',
      description: description,
      order_id: order.id,
      handler: function (response: RazorpayResponse) {
        // Handle successful payment
        alert('Payment successful! Thank you for your support!');
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#2563EB'
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Payment error:', error);
    alert('Error processing payment. Please try again.');
  }
};

export const handleBuyCoffee = () => {
  initiatePayment(500, 'Buy Me a Coffee - Thank you for your support!');
};
