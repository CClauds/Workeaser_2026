/**
 * WhatsApp webhook routes — Sprint C (HF-SPRINT-C-05).
 *  GET  → verify challenge (1x setup)
 *  POST → status updates + mensagens entrantes
 */
import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
  Route.get('/', 'Webhooks/WhatsappController.verify');
  Route.post('/', 'Webhooks/WhatsappController.store');
}).prefix('api/webhooks/whatsapp');
