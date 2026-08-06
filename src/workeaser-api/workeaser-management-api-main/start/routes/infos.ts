import Route from '@ioc:Adonis/Core/Route';

Route.get('api/infos/amenities', 'Utils/AmenitiesController.index');
Route.get('api/infos/services', 'Utils/ServicesController.index');
Route.get('api/infos/taxtypes', 'Utils/TaxTypesController.index');
Route.get('api/infos/termsizes', 'Utils/ContractTermSizeController.index');
Route.get('api/infos/meetroomquestions', 'Utils/MeetroomQuestionsController.index');
