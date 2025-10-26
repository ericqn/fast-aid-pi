import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { messages, conversationId } = body;

    // Validate the request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Format messages for Anthropic API
    // Remove system messages and format for Anthropic's expected structure
    const formattedMessages = messages
      .filter((msg: any) => msg.role !== 'system')
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Create the streaming message
          const messageStream = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 4096,
            system: `You are a helpful healthcare AI assistant. You provide information and support but always remind users to consult with healthcare professionals for medical advice. Be empathetic, clear, and professional.`,
            messages: formattedMessages,
            stream: true,
          });

          // Process the stream
          for await (const event of messageStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              // Send the text chunk to the client
              const text = event.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }

            if (event.type === 'message_stop') {
              // Send completion signal
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            }
          }

          controller.close();
        } catch (error: any) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    // Return the stream with appropriate headers
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
