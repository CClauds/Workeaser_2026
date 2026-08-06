import Route from '@ioc:Adonis/Core/Route';
import { CoworkModulesEnum } from 'Contracts/enums';

Route.group(() => {
  Route.get('/', 'Cowork/PersonasManagementsController.index');
  Route.get('/:id', 'Cowork/PersonasManagementsController.show');
  Route.post('/', 'Cowork/PersonasManagementsController.store');
  Route.put('/:id', 'Cowork/PersonasManagementsController.update');
  Route.delete('/:id', 'Cowork/PersonasManagementsController.delete');
})
  .prefix('api/cowork/relationship/personasmanagement')
  .middleware(['auth', `coworkAuthorization:${CoworkModulesEnum.RELATIONSHIP}`]);
