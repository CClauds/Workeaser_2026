import Route from '@ioc:Adonis/Core/Route';

// Polish Lote (HF-POLISH-02): rate limit aplicado em endpoints sensíveis para mitigar brute-force
// e abuso de envio de email. Limites configuráveis via env (RATE_LIMIT_AUTH_*).
Route.group(() => {
  Route.post('/login', 'AuthController.login').middleware('rateLimit:auth_login');
  Route.post('/signup', 'AuthController.store').middleware('rateLimit:auth_signup');
  Route.post('/logout', 'AuthController.logout').middleware('rateLimit:auth_login'); // HF-SPRINT-M-05
  Route.post('/email-confirmation', 'AuthController.emailConfirmation').middleware('rateLimit:auth_resend'); // HF-SPRINT-M-05 anti-brute-force em token
  Route.post('/resend-email-confirmation', 'AuthController.resendEmailConfirmation').middleware('rateLimit:auth_resend');
  Route.post('/lost-password', 'AuthController.lostPassword').middleware('rateLimit:auth_forgot');
  Route.post('/lost-password-confirmation', 'AuthController.lostPasswordConfirmation').middleware('rateLimit:auth_forgot');
  Route.post('/import', 'AuthController.import');
}).prefix('api/auth');
