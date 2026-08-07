/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route';

// General
import './routes/auth';
import './routes/documents';
import './routes/healthcheck';
import './routes/infos';
import './routes/me';
import './routes/notifications';
import './routes/photos';
import './routes/publicInvoices';
import './routes/spaces';
import './routes/videos';
import './routes/wallet';

// Cowork
import './routes/cowork/authExchange';
import './routes/cowork/authGoogle';
import './routes/cowork/banking';
import './routes/cowork/boldsign';
import './routes/cowork/bookingsandagenda';
import './routes/cowork/calendarintegrations';
import './routes/cowork/chats';
import './routes/cowork/clients';
import './routes/cowork/clients_v2';
import './routes/cowork/contracts';
import './routes/cowork/dashboard';
import './routes/cowork/daypass';
import './routes/cowork/dealsopportunities';
import './routes/cowork/desks';
import './routes/cowork/employees';
import './routes/cowork/invoices';
import './routes/cowork/locations';
import './routes/cowork/mailbox';
import './routes/cowork/meetrooms';
import './routes/cowork/personasmanagement';
import './routes/cowork/reports';
import './routes/cowork/rooms';
import './routes/cowork/salespipeline';
import './routes/cowork/search';
import './routes/cowork/settings';
import './routes/cowork/status';
import './routes/cowork/stripeconnect';
import './routes/cowork/subscriptions'; // HF-SPRINT-A-07
import './routes/cowork/taxes';
import './routes/cowork/tour';
import './routes/cowork/virtualoffices';

// Client
import './routes/client/chats';
import './routes/client/contract';
import './routes/client/daypass';
import './routes/client/invoices';
import './routes/client/mailbox';
import './routes/client/meeting';
import './routes/client/membership';
import './routes/client/spaces';
import './routes/client/team';

// Admin
import './routes/admin/auth';
import './routes/admin/subscriptions';
import './routes/admin/auditlogs'; // HF-SPRINT-G-01
import './routes/admin/discounts'; // HF-SPRINT-H-04
import './routes/admin/webhookdlq'; // HF-SPRINT-J-04

// Webhooks
import './routes/webhooks/adobesign';
import './routes/webhooks/boldsign';
import './routes/webhooks/docusign';
import './routes/webhooks/stripe';
import './routes/webhooks/whatsapp'; // HF-SPRINT-C-05
import './routes/webhooks/ses';      // HF-SPRINT-C-09

// Default
Route.get('/', async () => {
  return { message: 'Workeaser - API' };
});
