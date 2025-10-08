import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { code, language, version, stdin, args } = await request.json();
    
    if (!code || !language) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const response = await fetch('https://emkc.org/api/v3/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        version: version || '*',
        files: [{
          name: `main.${language}`,  // Simple filename
          content: code,
        }],
        stdin: stdin || '',
        args: args || [],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Piston API error:', error);
      return NextResponse.json(
        { error: 'Failed to execute code', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
