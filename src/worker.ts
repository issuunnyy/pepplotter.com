interface Env {
  ASSETS: {
    fetch: (request: Request | string, init?: RequestInit) => Promise<Response>;
  };
  DISCORD_WEBHOOK_URL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Only intercept /api/feedback POST requests
    if (url.pathname === '/api/feedback' && request.method === 'POST') {
      try {
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const body = (await request.json()) as {
          category?: string;
          message?: string;
          email?: string;
          _hp?: string; // Honeypot
        };

        // Trap spam bots
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

        const webhookUrl = env.DISCORD_WEBHOOK_URL;

        if (!webhookUrl) {
          console.warn('DISCORD_WEBHOOK_URL not configured yet.');
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

        let embedColor = 0x10b981; // Emerald green
        if (category.includes('Bug')) embedColor = 0xf43f5e;
        else if (category.includes('Feature')) embedColor = 0x06b6d4;
        else if (category.includes('Peptide')) embedColor = 0x8b5cf6;

        const discordPayload = {
          username: 'PepPlotter User Voice',
          avatar_url: 'https://pepplotter.com/apple-icon',
          embeds: [
            {
              title: `💬 [${category}] New Feedback Received`,
              description: message,
              color: embedColor,
              fields: [
                { name: 'Category', value: category, "inline": true },
                { name: 'Contact Email', value: email ? `\`${email}\`` : '*(Anonymous — No email provided)*', "inline": true },
                { name: 'Submitted At', value: new Date().toUTCString(), "inline": false },
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
          console.error('Discord webhook error:', discordRes.status, errText);
          return new Response(JSON.stringify({ error: 'Failed to deliver to Discord.' }), {
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
    }

    // Pass all other requests to static assets in ./out
    return env.ASSETS.fetch(request);
  },
};
