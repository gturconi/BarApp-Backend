import { Request, Response } from 'express';
import mercadopago from 'mercadopago';
import { PreferenceItem } from 'mercadopago/models/preferences/create-payload.model';
import { PreferenceCreateResponse } from 'mercadopago/resources/preferences';

export const createOrder = async (req: Request, res: Response) => {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_API_KEY as string,
  });

  const array: PreferenceItem[] = [
    {
      id: '1',
      title: 'Laptop',
      unit_price: 500,
      currency_id: 'ARS',
      quantity: 1,
      description: 'Laptop',
    },
    {
      id: '2',
      title: 'Keyboard',
      unit_price: 50,
      currency_id: 'ARS',
      quantity: 2,
      description: 'Keyboard',
    },
  ];

  try {
    const result: PreferenceCreateResponse =
      await mercadopago.preferences.create({
        items: array,
        payment_methods: {
          installments: 1,
        },
        payer: {
          name: 'Gonzalo',
          surname: 'Cevallos',
          email: '5LqFP@example.com',
        },

        back_urls: {
          success: `${process.env.FRONT_HOST}/orders/my-orders`,
          pending: `${process.env.FRONT_HOST}/orders/my-orders`,
          failure: `${process.env.FRONT_HOST}/orders/my-orders`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACK_HOST}/api/payment/webhook`,
      });

    res.json(result.body.init_point);
  } catch (error) {
    return res.status(500).json({ message: 'Something goes wrong' });
  }
};

export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const payment: any = req.query;

    console.log(payment);
    if (payment && typeof payment === 'object' && payment.type === 'payment') {
      const data = await mercadopago.payment.findById(
        payment['data.id'] as number
      );
      console.log(data);
      //guardar en DB info:
      /*        
        description, payment
        date_created
        payment_method
        order
        payer
        status
        total_paid_amount
      */
    }

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something goes wrong' });
  }
};
