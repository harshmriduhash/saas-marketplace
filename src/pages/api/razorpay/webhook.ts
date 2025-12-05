import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';
import { prisma } from '~/server/db';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const buffer = async (req: NextApiRequest) => {
  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(500).send('No webhook secret configured');

    const buf = await buffer(req);
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    if (!signature) return res.status(400).send('Missing signature');

    const expected = crypto.createHmac('sha256', secret).update(buf).digest('hex');

    if (expected !== signature) {
      console.warn('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const body = JSON.parse(buf.toString());

    const event = body.event;

    // handle payment captured events
    if (event === 'payment.captured' || event === 'payment.authorized' || event === 'order.paid') {
      const orderId = body?.payload?.payment?.entity?.order_id ?? body?.payload?.order?.entity?.id;
      if (!orderId) {
        return res.status(200).send('No order id');
      }

      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      if (!key_id || !key_secret) return res.status(500).send('Razorpay not configured');

      const razorpay = new Razorpay({ key_id, key_secret });
      const order = await razorpay.orders.fetch(orderId as string);
      const receipt: string = order.receipt as string;

      // receipt format: listing_<listingId>_featured_<ts>
      const parts = receipt?.split('_') ?? [];
      const listingId = parts?.[1];

      if (!listingId) {
        return res.status(200).send('No listing in receipt');
      }

      const featuredDays = parseInt(process.env.FEATURED_DAYS ?? '7', 10);
      const featuredUntil = new Date(Date.now() + featuredDays * 24 * 60 * 60 * 1000);

      try {
        await prisma.listing.update({
          where: { id: listingId },
          data: { isFeatured: true, featuredUntil, paid: true },
        });
      } catch (err) {
        console.error('Could not update listing for featured payment', err);
      }
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('webhook error', err);
    return res.status(500).send('error');
  }
};

export default handler;
