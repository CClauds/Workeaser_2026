import User from 'App/Models/User';
import SpaceReserveRequest from 'App/Models/SpaceReserveRequest';
import { ServicesEnum, SpaceReserveInquireTypesEnum } from 'Contracts/enums';

const servicesFees = [
  { serviceType: ServicesEnum.VIRTUAL_OFFICE, minValue: 1500, value: 3000 },
  { serviceType: ServicesEnum.MEETING_ROOM, minValue: 2000, value: 4000 },
  { serviceType: ServicesEnum.OPEN_DESK, minValue: 6000, value: 2000 },
  { serviceType: ServicesEnum.PRIVATE_ROOM, minValue: 7000, value: 1000 }
];

export default class ApplicationFeeService {
  static async calculate(
    userId: number,
    coworkAccountId: number,
    serviceType: string,
    locationId: number,
    resourceId: number,
    amount: number
  ) {
    const feeRule = servicesFees.find((x) => x.serviceType === serviceType);
    const user: User = await User.query().where('id', userId).preload('clientAccount').first();

    if (!user || !feeRule) {
      return;
    }

    const applicationFee = this.calcValue(feeRule.minValue, feeRule.value, amount);

    const spaceReserveRequest = await SpaceReserveRequest.query()
      .where('cowork_account_id', coworkAccountId)
      .where('client_account_id', user.clientAccount.id)
      .where('location_id', locationId)
      .where('service_type', serviceType)
      .where('resource_id', resourceId)
      .where('inquire_type', SpaceReserveInquireTypesEnum.NEW_OPPORTUNITY)
      .first();

    if (!spaceReserveRequest) {
      return 0;
    }

    return applicationFee;
  }

  private static calcValue(minValue: number, value: number, amount: number) {
    let calc = amount * (value / 10000);

    if (calc < minValue) {
      calc = minValue;
    }

    return calc;
  }
}
