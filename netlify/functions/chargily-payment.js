export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const order = JSON.parse(event.body);

    if (!order || !order.total || order.total <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid order" })
      };
    }

    const response = await fetch(
      "https://pay.chargily.net/test/api/v2/checkouts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CHARGILY_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: order.total,
          currency: "DZD",
          success_url: "https://heartfelt-faun-7773bd.netlify.app/products.html?payment=success",
          cancel_url: "https://heartfelt-faun-7773bd.netlify.app/products.html?payment=cancel",
          metadata: order
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify(data)
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ checkout_url: data.checkout_url })
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
}
