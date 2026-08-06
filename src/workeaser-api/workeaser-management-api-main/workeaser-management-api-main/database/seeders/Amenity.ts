import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import Amenity from 'App/Models/Amenity';

export default class AmenitySeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'name';

    await Amenity.updateOrCreateMany(uniqueKey, [
      { name: 'Bike Parking' },
      { name: 'Coffee Provided' },
      { name: 'Disability Infrastructure' },
      { name: 'Kitchen' },
      { name: 'Microwave' },
      { name: 'Monitor & TV' },
      { name: "Mother's Room" },
      { name: 'On-Site Restaurant' },
      { name: 'Outdoor Space' },
      { name: 'Parking Options' },
      { name: 'Pet Friendly' },
      { name: 'Phone Line' },
      { name: 'Private Areas' },
      { name: 'Refrigerator' },
      { name: 'Shared Printer' },
      { name: 'Shower' },
      { name: 'Standing Desk' },
      { name: 'Weekend Access' }
    ]);
  }
}
