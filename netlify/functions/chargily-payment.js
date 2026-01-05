export async function handler(event) {
  const order = JSON.parse(event.body);

  const response = await fetch("https://pay.chargily.net/test/api/v2/checkouts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.CHARGILY_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: order.total,
      currency: "DZD",
      success_url: "https://your-site.netlify.app/success",
      cancel_url: "https://your-site.netlify.app/cancel"
    })
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ checkout_url: data.checkout_url })
  };
}
