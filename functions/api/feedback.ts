interface Env {
  DISCORD_WEBHOOK_URL?: string;
}

interface PagesFunctionContext<E = Record<string, unknown>> {
  request: Request;
  env: E;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}

export const onRequestPost = async (context: PagesFunctionContext<Env>): Promise<Response> => {
  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = (await context.request.json()) as {
      category?: string;
      message?: string;
      email?: string;
      _hp?: string; // Honeypot field for bot trapping
    };

    // Honeypot check: if bot filled this hidden field, silently return success without sending
    if (body._hp) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const message = (body.message || '').trim();
    const category = (body.category || 'General Feedback').trim();
    const email = (body.email || '').trim();

    if (!message || message.length < 3) {
      return new Response(JSON.stringify({ error: 'Message must be at least 3 characters.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (message.length > 1500) {
      return new Response(JSON.stringify({ error: 'Message cannot exceed 1500 characters.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const webhookUrl = context.env.DISCORD_WEBHOOK_URL;

    // If webhook is not configured yet, succeed gracefully
    if (!webhookUrl) {
      console.warn('DISCORD_WEBHOOK_URL environment variable is not configured in Cloudflare Pages.');
      return new Response(
        JSON.stringify({
          success: true,
          note: 'DISCORD_WEBHOOK_URL not configured yet, feedback acknowledged.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Color code based on category
    let embedColor = 0x10b981; // Emerald green
    if (category.includes('Bug')) embedColor = 0xf43f5e; // Rose red
    else if (category.includes('Feature')) embedColor = 0x06b6d4; // Cyan
    else if (category.includes('Peptide')) embedColor = 0x8b5cf6; // Purple

    const discordPayload = {
      username: 'PepPlotter User Voice',
      avatar_url: 'https://pepplotter.com/apple-icon',
      embeds: [
        {
          title: `💬 [${category}] New Feedback Received`,
          description: message,
          color: embedColor,
          fields: [
            {
              name: 'Category',
              value: category,
              inline: true,
            },
            {
              name: 'Contact Email',
              value: email ? `\`${email}\`` : '*(Anonymous — No email provided)*',
              inline: true,
            },
            {
              name: 'Submitted At',
              value: new Date().toUTCString(),
              inline: false,
            },
          ],
          footer: {
            text: 'PepPlotter Feedback Hub • Independent Harm Reduction',
          },
        },
      ],
    };

    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      console.error('Discord webhook responded with error:', discordRes.status, errText);
      return new Response(JSON.stringify({ error: 'Failed to deliver message to Discord.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
