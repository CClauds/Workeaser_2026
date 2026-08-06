/*
|--------------------------------------------------------------------------
| Preloaded File — Event listeners
|--------------------------------------------------------------------------
|
| Sprint L (HF-SPRINT-L-02) — Hook em `user:email_confirmed` enfileira a
|   sequencia de 3 emails de onboarding (welcome dia 0, dica dia 3, check-in
|   dia 7) sem modificar UserService.confirmEmailToken.
|
| Idempotente: OnboardingEmailService.scheduleSequence checa se ja existe
|   sequencia pro user antes de enfileirar (evita duplicar se evento for
|   emitido 2x por bug/race).
|
| Defensive: erros no listener nao quebram a confirmacao de email — o user
|   confirma normalmente mesmo se onboarding sequence falhar.
*/
import Event from '@ioc:Adonis/Core/Event';
import Logger from '@ioc:Adonis/Core/Logger';
import OnboardingEmailService from 'App/Services/OnboardingEmailService';
import User from 'App/Models/User';
import { UserRoleEnum } from 'Contracts/enums';

Event.on('user:email_confirmed', async (payload: { id: number }) => {
  try {
    const user = await User.find(payload.id);
    if (!user) {
      Logger.warn({ userId: payload.id }, '[event user:email_confirmed] user nao encontrado');
      return;
    }
    // Sequencia so faz sentido pra dono de cowork (COWORKING role).
    // CLIENT (membro importado por cowork) e ADMIN ja recebem outros emails contextuais.
    if (user.role !== UserRoleEnum.COWORKING) {
      return;
    }
    const enqueued = await OnboardingEmailService.scheduleSequence(user);
    if (enqueued > 0) {
      Logger.info(
        { userId: user.id, enqueued },
        '[event user:email_confirmed] onboarding sequence enqueued'
      );
    }
  } catch (err: any) {
    Logger.error(
      { err: err.message, userId: payload?.id },
      '[event user:email_confirmed] falha (nao bloqueia confirmacao)'
    );
  }
});
