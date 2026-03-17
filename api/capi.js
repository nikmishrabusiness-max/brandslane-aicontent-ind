module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event_name, event_id, event_source_url, client_user_agent } = req.body || {};

  if (!event_name || !event_id) {
    return res.status(400).json({ error: 'Missing event_name or event_id' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || (req.socket && req.socket.remoteAddress)
    || '';

  const payload = {
    data: [{
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      action_source: 'website',
      event_source_url: event_source_url || '',
      user_data: {
        client_ip_address: ip,
        client_user_agent: client_user_agent || req.headers['user-agent'] || ''
      }
    }]
  };

  try {
    const response = await fetch(
      'https://graph.facebook.com/v19.0/972598659845311/events?access_token=' + process.env.META_CAPI_TOKEN,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
