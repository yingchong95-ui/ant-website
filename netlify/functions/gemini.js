exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ debug: 'NO_KEY_IN_ENV' })
    };
  }

  try {
    const body = JSON.parse(event.body);

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const text = await res.text();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        debug: {
          anthropic_status: res.status,
          anthropic_response: text.slice(0, 500),
          key_hint: key.substring(0, 10) + '...' + key.substring(key.length - 4),
          key_length: key.length
        }
      })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        debug: 'FUNCTION_ERROR',
        message: err.message
      })
    };
  }
};
