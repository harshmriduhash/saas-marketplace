import type { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { listingId, purchaseType } = req.body;

    if (!listingId)
      return res.status(400).json({ error: "listingId is required" });

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({ error: "Razorpay keys not configured" });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const featuredFeeInr = parseInt(process.env.FEATURED_FEE_INR ?? "499", 10);
    const amountPaise = featuredFeeInr * 100; // Razorpay expects paise

    const receipt = `listing_${listingId}_featured_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        listingId: String(listingId),
        purchaseType: purchaseType ?? "featured",
      },
    });

    return res
      .status(200)
      .json({
        orderId: order.id,
        amount: order.amount,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? key_id,
      });
  } catch (err: any) {
    console.error("create-order error", err);
    return res.status(500).json({ error: "Could not create order" });
  }
};

export default handler;
