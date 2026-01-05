export async function handler(event) {
  try {
    // السماح فقط بـ POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed"
      };
    }

    // قراءة الطلب
    const order = JSON.parse(event.body);

    // تحقق بسيط
    if (!order || !order.total || order.total <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid order data" })
      };
    }

    // طلب إنشاء Checkout من Chargily (TEST MODE)
    const response = await fetch(
      "https://pay.chargily.net/test/api/v2/checkouts",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CHARGILY_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: order.total,
          currency: "DZD",

          // روابط موقعك
          success_url: "https://heartfelt-faun-7773bd.netlify.app/products.html?payment=success",
          cancel_url: "https://heartfelt-faun-7773bd.netlify.app/products.html?payment=cancel",

          metadata: {
            customer_name: order.customer?.name || "",
            customer_phone: order.customer?.phone || "",
            items: order.items || []
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Chargily error",
          details: data
        })
      };
    }

    // رجوع رابط الدفع
    return {
      statusCode: 200,
      body: JSON.stringify({
        checkout_url: data.checkout_url
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error",
        message: err.message
      })
    };
  }
}
