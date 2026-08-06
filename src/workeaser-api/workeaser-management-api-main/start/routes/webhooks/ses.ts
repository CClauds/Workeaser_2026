/**
 * SES SNS webhook route — Sprint C (HF-SPRINT-C-09).
 * AWS envia POST aqui com SubscriptionConfirmation OU Notification (Bounce/Complaint/Delivery).
 */
import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.post('/', 'Webhooks/SesController.store');
}).prefix('api/webhooks/ses');
