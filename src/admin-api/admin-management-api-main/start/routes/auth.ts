import Route from '@ioc:Adonis/Core/Route'

// Polish Lote (HF-POLISH-02 admin): rate limit no login do admin para mitigar brute-force
Route.group(() => {
  Route.post('/login', 'AuthController.login').middleware('rateLimit:auth_admin_login')
}).prefix('api/auth')

Route.group(() => {
  Route.post('/logout', 'AuthController.logout')
  Route.get('/me', 'AuthController.me')
})
  .prefix('api/auth')
  .middleware(['auth'])
