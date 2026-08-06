import Env from '@ioc:Adonis/Core/Env';
import Room from 'App/Models/Room';
import Desk from 'App/Models/Desk';
import User from 'App/Models/User';
import Database from '@ioc:Adonis/Lucid/Database';
import Meetroom from 'App/Models/Meetroom';
import AppError from 'App/Utils/AppError';
import Location from 'App/Models/Location';
import CoworkUser from 'App/Models/CoworkUser';
import TaxesService from 'App/Services/Cowork/TaxesService';
import VirtualOffice from 'App/Models/VirtualOffice';
import MeetroomQuestion from 'App/Models/MeetroomQuestion';
import ContractService from 'App/Services/Cowork/ContractService';
import {
  CoworkUserRoleEnum,
  MeetingStatusEnum,
  MeetroomQuestionSlugs,
  OpenDeskTypeEnum,
  RecurringTypeTaxEnum,
  SearhAreaTypesEnum,
  ServicesEnum,
  TaxMethodsEnum
} from 'Contracts/enums';

interface FilterSearch {
  location?: string;
  lat?: number;
  long?: number;
  search_area?: number;
  search_area_type?: string;
  service_type?: string;

  vo_pricing_range_start?: number;
  vo_pricing_range_end?: number;
  vo_directory?: boolean;
  vo_mailing_handling?: boolean;
  vo_phone_answering?: boolean;
  vo_voip_service?: boolean;

  od_pricing_range_start?: number;
  od_pricing_range_end?: number;
  od_desk_type?: string;

  mr_start_date_time?: string;
  mr_pricing_range_start?: number;
  mr_pricing_range_end?: number;
  mr_group_size?: number;
  mr_category?: string[];
  mr_office_supplies?: boolean;
  mr_multimedia?: boolean;
  mr_ada_compliant?: boolean;
  mr_projector?: boolean;
  mr_whiteboard?: boolean;
  mr_eat?: boolean;

  pr_pricing_range_start?: number;
  pr_pricing_range_end?: number;
  pr_group_size?: number;

  amenities?: number[];
  lowest_prices?: boolean;
  highest_prices?: boolean;
}
interface ResponseSpaces {
  id: number;
  title: string;
  coworking_name: string;
  price: number;
  price_type: string;
  cover_photo: string;
  coworking_services: string[];
  qty_persons?: number;
  address: LocationAddress;
  measure_size?: number;
  shareable?: number;
  is_available?: boolean;
  available?: number;
}

interface ResponseLocations {
  id: number;
  title: string;
  coworking_name: string;
  cover_photo: string;
  coworking_services: string[];
  address: LocationAddress;
}

interface ContractPricing {
  term_size: string;
  payment_month: number;
  payment_full: number;
  initial_fee_month: number;
  initial_fee_full: number;
}

interface LocationAmenities {
  id: number;
  name: string;
}

interface LocationAddress {
  fulltext: string;
  latitude?: number | null;
  longitude?: number | null;
  country?: string | null;
  city?: string | null;
  state?: string | null;
}

interface LocationServicesRecommendation {
  id: number;
  service_type: string;
  name: string;
  photo: string;
  price: number;
  price_type: SpacePriceType;
  qty_persons?: number;
}

interface ShowSpaceResponse {
  coworking_name: string;
  coworking_logo: string | null;
  space_host_photo: string | null;
  space_host_name: string;
  photos: string[];
  service_name: string;
  service_type: string;
  description: string;
  location_id: number;
  contract_pricing?: ContractPricing[];
  price?: number;
  price_type?: string;
  location_description: string;
  amenities: LocationAmenities[];
  address: LocationAddress;
  other_services?: LocationServicesRecommendation[];
  initial_fee?: number;
  fees?: object;
  renewal_tax?: number;
  cancelation_no?: number;
  cancelation_full?: number;
  cancelation_half?: number;
  discount_three?: number;
  discount_half?: number;
  discount_full?: number;
}

enum SpacePriceType {
  MONTH = 'MONTH',
  HOUR = 'HOUR'
}

export default class SpacesService {
  static async search(filters: FilterSearch, page: number = 1) {
    let result;

    switch (filters.service_type) {
      case ServicesEnum.MEETING_ROOM:
        result = await this.searchMeetingRoom(filters, page);
        break;
      case ServicesEnum.OPEN_DESK:
        result = await this.searchOpenDesk(filters, page);
        break;
      case ServicesEnum.PRIVATE_ROOM:
        result = await this.searchPrivateRoom(filters, page);
        break;
      case ServicesEnum.VIRTUAL_OFFICE:
        result = await this.searchVirtualOffice(filters, page);
        break;
      default:
        result = await this.searchLocations(filters, page);
        break;
    }

    return result;
  }

  static async show(serviceType: string, id: number): Promise<ShowSpaceResponse> {
    switch (serviceType) {
      case ServicesEnum.MEETING_ROOM:
        return await this.getMeetingRoom(id);
      case ServicesEnum.OPEN_DESK:
        return await this.getOpenDesk(id);
      case ServicesEnum.PRIVATE_ROOM:
        return await this.getPrivateRoom(id);
      case ServicesEnum.VIRTUAL_OFFICE:
        return await this.getVirtualOffice(id);
      default:
        throw new AppError(AppError.BAD_REQUEST, 'Resource invalid');
    }
  }

  static async showLocation(id: number) {
    const location: Location = await Location.query()
      .preload('coworkAccount', (coworkAccountQuery) => {
        coworkAccountQuery.preload('photo');
      })
      .preload('address')
      .preload('photos')
      .preload('amenities')
      .preload('desks', (d) => {
        d.preload('photos');
        d.preload('prices');
        d.preload('fees');
      })
      .preload('rooms', (d) => {
        d.preload('photos');
        d.preload('prices');
        d.preload('fees');
      })
      .preload('meetrooms', (d) => {
        d.preload('photos');
      })
      .preload('virtualOffices', (d) => {
        d.preload('photos');
        d.preload('prices');
        d.preload('fees');
      })
      .where('id', id)
      .first();

    if (!location) {
      throw new AppError(AppError.NOT_FOUND, 'Location not found');
    }

    const locationJson = location.toJSON();
    const manager = await this.getCoworkingManager(location.coworkAccountId);
    locationJson.manager = {
      name: manager.fullName,
      photo: manager.photo?.file || null
    };

    return locationJson;
  }

  private static async searchLocations(filters: FilterSearch, page: number = 1) {
    const query = Location.query()
      .preload('photos')
      .preload('address')
      .preload('services')
      .preload('amenities')
      .preload('coworkAccount')
      .whereHas('coworkAccount', (c) => {
        c.whereNull('deleted_at');
      });

    if (filters.location) {
      query
        .whereRaw('?? LIKE ?', ['name', `%${filters.location}%`])
        .orWhereHas('address', (addressQuery) => {
          addressQuery.whereRaw('?? LIKE ?', ['fulltext', `%${filters.location}%`]);
        });
    }

    if (filters.amenities) {
      query.whereHas('amenities', (amenitiesQuery) => {
        amenitiesQuery.whereIn('amenity_id', filters.amenities);
      });
    }

    if (filters.lat && filters.long && filters.search_area) {
      let constDist = 3959;

      if (filters.search_area_type === SearhAreaTypesEnum.KILOMETERS) {
        constDist = 6371;
      }

      query.whereHas('address', (addressQuery) => {
        addressQuery
          .select(
            Database.raw(
              'id, (? * acos(cos(radians(?)) * cos(radians(latitude)) ' +
                '* cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
              [
                constDist,
                filters.lat ? filters.lat : 0,
                filters.long ? filters.long : 0,
                filters.lat ? filters.lat : 0
              ]
            )
          )
          .havingRaw('distance <= ?', filters.search_area)
          .orderBy('distance', 'asc');
      });
    }

    const records = await query.paginate(page, Env.get('ITEMS_PER_PAGE'));
    const result: ResponseLocations[] = [];

    for (const location of records.rows) {
      result.push({
        id: location.id,
        title: location.name,
        coworking_name: location.coworkAccount.name,
        cover_photo: location.photos[0]?.getPhotoUrl,
        coworking_services: location.services.map((s) => s.abbr),
        address: {
          fulltext: location.address.fulltext,
          latitude: location.address.latitude,
          longitude: location.address.longitude,
          country: location.address.country
        }
      });
    }

    records.rows = result;
    return records;
  }

  private static async getCoworkingManager(id: number) {
    const managerCowork = await CoworkUser.query()
      .where('cowork_account_id', id)
      .where('role', CoworkUserRoleEnum.MANAGER)
      .firstOrFail();

    const managerCoworkingUser = await User.findOrFail(managerCowork.userId);
    await managerCoworkingUser.load('photo');

    return managerCoworkingUser;
  }

  private static async searchVirtualOffice(filters: FilterSearch, page: number = 1) {
    const query = VirtualOffice.query()
      .preload('prices')
      .preload('photos')
      .preload('location', (b) => {
        b.preload('address');
        b.preload('services');
        b.preload('amenities');
        b.preload('coworkAccount');
      })
      .where('searchable', true)
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
        locationQuery.whereHas('coworkAccount', (c) => {
          c.whereNull('deleted_at');
        });
      });

    if (filters.location) {
      query.whereHas('location', (locationQuery) => {
        locationQuery
          .whereRaw('?? LIKE ?', ['name', `%${filters.location}%`])
          .orWhereHas('address', (addressQuery) => {
            addressQuery.whereRaw('?? LIKE ?', ['fulltext', `%${filters.location}%`]);
          });
      });
    }

    if (filters.amenities) {
      query.whereHas('location', (locationQuery) => {
        locationQuery.whereHas('amenities', (amenitiesQuery) => {
          amenitiesQuery.whereIn('amenity_id', filters.amenities);
        });
      });
    }

    if (filters.lat && filters.long && filters.search_area) {
      let constDist = 3959;

      if (filters.search_area_type === SearhAreaTypesEnum.KILOMETERS) {
        constDist = 6371;
      }

      query.whereHas('location', (locationQuery) => {
        locationQuery.whereHas('address', (addressQuery) => {
          addressQuery
            .select(
              Database.raw(
                'id, (? * acos(cos(radians(?)) * cos(radians(latitude)) ' +
                  '* cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
                [
                  constDist,
                  filters.lat ? filters.lat : 0,
                  filters.long ? filters.long : 0,
                  filters.lat ? filters.lat : 0
                ]
              )
            )
            .havingRaw('distance <= ?', filters.search_area)
            .orderBy('distance', 'asc');
        });
      });
    }

    if (filters.vo_pricing_range_start && filters.vo_pricing_range_end) {
      query.whereHas('prices', (pricesQuery) => {
        pricesQuery.whereNull('deleted_at');
        pricesQuery.whereBetween('monthly_price', [
          filters.vo_pricing_range_start,
          filters.vo_pricing_range_end
        ]);
      });
    }

    if (filters.vo_directory !== undefined) {
      query.where('has_dir_listing', filters.vo_directory);
    }

    if (filters.vo_mailing_handling !== undefined) {
      query.where('has_mailing', filters.vo_mailing_handling);
    }

    if (filters.vo_phone_answering !== undefined) {
      query.where('has_phone_answer', filters.vo_phone_answering);
    }

    if (filters.vo_voip_service !== undefined) {
      query.where('has_voip', filters.vo_voip_service);
    }

    const records = await query.paginate(page, Env.get('ITEMS_PER_PAGE'));
    const result: ResponseSpaces[] = [];

    for (const office of records.rows) {
      const priceData = this.getLowerPlanPrice(office);

      result.push({
        id: office.id,
        title: office.name,
        coworking_name: office.location.coworkAccount.name,
        price: priceData.lowerPrice,
        price_type: priceData.priceType,
        cover_photo: office.photos[0]?.getPhotoUrl,
        coworking_services: office.location.services.map((s) => s.abbr),
        address: {
          fulltext: office.location.address.fulltext,
          latitude: office.location.address.latitude,
          longitude: office.location.address.longitude,
          country: office.location.address.country
        }
      });
    }

    if (filters.lowest_prices) {
      result.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
    }

    if (filters.highest_prices) {
      result.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
    }

    records.rows = result;
    return records;
  }

  private static async getVirtualOffice(id: number): Promise<ShowSpaceResponse> {
    const virtualOffice: VirtualOffice = await VirtualOffice.query()
      .where('id', id)
      .preload('location', (locationQuery) => {
        locationQuery.preload('amenities');
        locationQuery.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.preload('photo');
        });
        locationQuery.preload('address');
      })
      .preload('photos')
      .preload('prices')
      .preload('fees', (feesQuery) => {
        feesQuery.whereNull('deleted_at');
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .first();

    if (!virtualOffice) {
      throw new AppError(AppError.NOT_FOUND, 'Virtual Office not found');
    }

    const photos = virtualOffice.photos ? virtualOffice.photos.map((p) => p.getPhotoUrl) : [];
    const amenities = virtualOffice.location.amenities
      ? virtualOffice.location.amenities.map((a) => ({
          id: a.id,
          name: a.name
        }))
      : [];

    const contractPricings: ContractPricing[] = [];
    for (const p of virtualOffice.prices) {
      contractPricings.push({
        term_size: p.duration,
        payment_full: p.fullPrice,
        initial_fee_full: await this.calculateInitialFeePlan(
          virtualOffice.location.coworkAccountId,
          ServicesEnum.VIRTUAL_OFFICE,
          p.fullPrice,
          virtualOffice.fees
        ),
        payment_month: p.monthlyPrice,
        initial_fee_month: await this.calculateInitialFeePlan(
          virtualOffice.location.coworkAccountId,
          ServicesEnum.VIRTUAL_OFFICE,
          p.monthlyPrice,
          virtualOffice.fees
        )
      });
    }

    const otherServices = await this.getOtherServices(
      virtualOffice.location.coworkAccountId,
      ServicesEnum.VIRTUAL_OFFICE,
      virtualOffice.id
    );

    const spaceHost = await virtualOffice.location.getSpaceHost();

    const manager = await this.getCoworkingManager(virtualOffice.location.coworkAccountId);

    return {
      coworking_name: virtualOffice.location.coworkAccount.name,
      coworking_logo: virtualOffice.location.coworkAccount.photo
        ? virtualOffice.location.coworkAccount.photo.getPhotoUrl
        : null,
      space_host_photo: spaceHost.photo ? spaceHost.photo.getPhotoUrl : null,
      space_host_name: manager.fullName,
      location_id: virtualOffice.locationId,
      photos: photos,
      service_name: virtualOffice.name,
      service_type: ServicesEnum.VIRTUAL_OFFICE,
      description: virtualOffice.description,
      location_description: virtualOffice.location.description,
      amenities: amenities,
      renewal_tax: virtualOffice.renewalTax,
      address: {
        fulltext: virtualOffice.location.address.fulltext,
        latitude: virtualOffice.location.address.latitude,
        longitude: virtualOffice.location.address.longitude,
        country: virtualOffice.location.address.country
      },
      contract_pricing: contractPricings,
      other_services: otherServices,
      fees: virtualOffice.fees
    };
  }

  public static async showVoBySlug(slug: string): Promise<ShowSpaceResponse> {
    const virtualOffice: VirtualOffice = await VirtualOffice.query()
      .where('slug', slug)
      .preload('location', (locationQuery) => {
        locationQuery.preload('amenities');
        locationQuery.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.preload('photo');
        });
        locationQuery.preload('address');
      })
      .preload('photos')
      .preload('prices')
      .preload('fees', (feesQuery) => {
        feesQuery.whereNull('deleted_at');
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .first();

    if (!virtualOffice) {
      throw new AppError(AppError.NOT_FOUND, 'Virtual Office not found');
    }

    const photos = virtualOffice.photos ? virtualOffice.photos.map((p) => p.getPhotoUrl) : [];
    const amenities = virtualOffice.location.amenities
      ? virtualOffice.location.amenities.map((a) => ({
          id: a.id,
          name: a.name
        }))
      : [];

    const contractPricings: ContractPricing[] = [];
    for (const p of virtualOffice.prices) {
      contractPricings.push({
        term_size: p.duration,
        payment_full: p.fullPrice,
        initial_fee_full: await this.calculateInitialFeePlan(
          virtualOffice.location.coworkAccountId,
          ServicesEnum.VIRTUAL_OFFICE,
          p.fullPrice,
          virtualOffice.fees
        ),
        payment_month: p.monthlyPrice,
        initial_fee_month: await this.calculateInitialFeePlan(
          virtualOffice.location.coworkAccountId,
          ServicesEnum.VIRTUAL_OFFICE,
          p.monthlyPrice,
          virtualOffice.fees
        )
      });
    }

    const otherServices = await this.getOtherServices(
      virtualOffice.location.coworkAccountId,
      ServicesEnum.VIRTUAL_OFFICE,
      virtualOffice.id
    );

    const spaceHost = await virtualOffice.location.getSpaceHost();

    const manager = await this.getCoworkingManager(virtualOffice.location.coworkAccountId);

    return {
      coworking_name: virtualOffice.location.coworkAccount.name,
      coworking_logo: virtualOffice.location.coworkAccount.photo
        ? virtualOffice.location.coworkAccount.photo.getPhotoUrl
        : null,
      space_host_photo: spaceHost.photo ? spaceHost.photo.getPhotoUrl : null,
      space_host_name: manager.fullName,
      location_id: virtualOffice.locationId,
      photos: photos,
      service_name: virtualOffice.name,
      service_type: ServicesEnum.VIRTUAL_OFFICE,
      description: virtualOffice.description,
      location_description: virtualOffice.location.description,
      amenities: amenities,
      renewal_tax: virtualOffice.renewalTax,
      address: {
        fulltext: virtualOffice.location.address.fulltext,
        latitude: virtualOffice.location.address.latitude,
        longitude: virtualOffice.location.address.longitude,
        country: virtualOffice.location.address.country
      },
      contract_pricing: contractPricings,
      other_services: otherServices,
      fees: virtualOffice.fees
    };
  }

  private static async searchOpenDesk(filters: FilterSearch, page: number = 1) {
    const query = Desk.query()
      .preload('prices')
      .preload('photos')
      .preload('location', (b) => {
        b.preload('address');
        b.preload('services');
        b.preload('amenities');
        b.preload('coworkAccount');
      })
      .where('searchable', true)
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
        locationQuery.whereHas('coworkAccount', (c) => {
          c.whereNull('deleted_at');
        });
      });

    if (filters.location) {
      query.whereHas('location', (locationQuery) => {
        locationQuery
          .whereRaw('?? LIKE ?', ['name', `%${filters.location}%`])
          .orWhereHas('address', (addressQuery) => {
            addressQuery.whereRaw('?? LIKE ?', ['fulltext', `%${filters.location}%`]);
          });
      });
    }

    if (filters.amenities) {
      query.whereHas('location', (locationQuery) => {
        locationQuery.whereHas('amenities', (amenitiesQuery) => {
          amenitiesQuery.whereIn('amenity_id', filters.amenities);
        });
      });
    }

    if (filters.lat && filters.long && filters.search_area) {
      let constDist = 3959;

      if (filters.search_area_type === SearhAreaTypesEnum.KILOMETERS) {
        constDist = 6371;
      }

      query.whereHas('location', (locationQuery) => {
        locationQuery.whereHas('address', (addressQuery) => {
          addressQuery
            .select(
              Database.raw(
                'id, (? * acos(cos(radians(?)) * cos(radians(latitude)) ' +
                  '* cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
                [
                  constDist,
                  filters.lat ? filters.lat : 0,
                  filters.long ? filters.long : 0,
                  filters.lat ? filters.lat : 0
                ]
              )
            )
            .havingRaw('distance <= ?', filters.search_area)
            .orderBy('distance', 'asc');
        });
      });
    }

    if (filters.od_pricing_range_start && filters.od_pricing_range_end) {
      query.whereHas('prices', (pricesQuery) => {
        pricesQuery.whereNull('deleted_at');
        pricesQuery.whereBetween('monthly_price', [
          filters.od_pricing_range_start,
          filters.od_pricing_range_end
        ]);
      });
    }

    if (filters.od_desk_type !== undefined) {
      if (filters.od_desk_type === OpenDeskTypeEnum.EXCLUSIVE) {
        query.where('shareable', false);
      }
      if (filters.od_desk_type === OpenDeskTypeEnum.SHAREABLE) {
        query.where('shareable', true);
      }
    }

    const records = await query.paginate(page, Env.get('ITEMS_PER_PAGE'));
    const result: ResponseSpaces[] = [];

    for (const desk of records.rows) {
      const priceData = this.getLowerPlanPrice(desk);

      const serviceAvailability = await ContractService.checkIfServiceIsAvailable(
        desk.id,
        ServicesEnum.OPEN_DESK
      );

      result.push({
        id: desk.id,
        title: desk.name,
        coworking_name: desk.location.coworkAccount.name,
        price: priceData.lowerPrice,
        price_type: priceData.priceType,
        cover_photo: desk.photos[0]?.getPhotoUrl,
        coworking_services: desk.location.services.map((s) => s.abbr),
        address: {
          fulltext: desk.location.address.fulltext,
          latitude: desk.location.address.latitude,
          longitude: desk.location.address.longitude,
          country: desk.location.address.country
        },
        shareable: desk.shareable,
        is_available: serviceAvailability.isAvailable,
        available: serviceAvailability.available
      });
    }

    if (filters.lowest_prices) {
      result.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
    }

    if (filters.highest_prices) {
      result.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
    }

    records.rows = result;
    return records;
  }

  private static async getOpenDesk(id: number): Promise<ShowSpaceResponse> {
    const desk: Desk = await Desk.query()
      .where('id', id)
      .preload('location', (locationQuery) => {
        locationQuery.preload('amenities');
        locationQuery.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.preload('photo');
        });
        locationQuery.preload('address');
      })
      .preload('photos')
      .preload('prices')
      .preload('fees', (feesQuery) => {
        feesQuery.whereNull('deleted_at');
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .first();

    if (!desk) {
      throw new AppError(AppError.NOT_FOUND, 'Desk not found');
    }

    const photos = desk.photos ? desk.photos.map((p) => p.getPhotoUrl) : [];
    const amenities = desk.location.amenities
      ? desk.location.amenities.map((a) => ({
          id: a.id,
          name: a.name
        }))
      : [];

    const contractPricings: ContractPricing[] = [];
    for (const p of desk.prices) {
      contractPricings.push({
        term_size: p.duration,
        payment_full: p.fullPrice,
        initial_fee_full: await this.calculateInitialFeePlan(
          desk.location.coworkAccountId,
          ServicesEnum.OPEN_DESK,
          p.fullPrice,
          desk.fees
        ),
        payment_month: p.monthlyPrice,
        initial_fee_month: await this.calculateInitialFeePlan(
          desk.location.coworkAccountId,
          ServicesEnum.OPEN_DESK,
          p.monthlyPrice,
          desk.fees
        )
      });
    }

    const otherServices = await this.getOtherServices(
      desk.location.coworkAccountId,
      ServicesEnum.OPEN_DESK,
      desk.id
    );

    const spaceHost = await desk.location.getSpaceHost();
    const manager = await this.getCoworkingManager(desk.location.coworkAccountId);

    return {
      coworking_name: desk.location.coworkAccount.name,
      coworking_logo: desk.location.coworkAccount.photo
        ? desk.location.coworkAccount.photo.getPhotoUrl
        : null,
      space_host_photo: spaceHost.photo ? spaceHost.photo.getPhotoUrl : null,
      space_host_name: manager.fullName,
      location_id: desk.locationId,
      photos: photos,
      service_name: desk.name,
      service_type: ServicesEnum.MEETING_ROOM,
      description: desk.description,
      location_description: desk.location.description,
      amenities: amenities,
      renewal_tax: desk.renewalTax,
      address: {
        fulltext: desk.location.address.fulltext,
        latitude: desk.location.address.latitude,
        longitude: desk.location.address.longitude,
        country: desk.location.address.country
      },
      contract_pricing: contractPricings,
      other_services: otherServices,
      fees: desk.fees
    };
  }

  public static async showOdBySlug(slug: string): Promise<ShowSpaceResponse> {
    const desk: Desk = await Desk.query()
      .where('slug', slug)
      .preload('location', (locationQuery) => {
        locationQuery.preload('amenities');
        locationQuery.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.preload('photo');
        });
        locationQuery.preload('address');
      })
      .preload('photos')
      .preload('prices')
      .preload('fees', (feesQuery) => {
        feesQuery.whereNull('deleted_at');
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .first();

    if (!desk) {
      throw new AppError(AppError.NOT_FOUND, 'Desk not found');
    }

    const photos = desk.photos ? desk.photos.map((p) => p.getPhotoUrl) : [];
    const amenities = desk.location.amenities
      ? desk.location.amenities.map((a) => ({
          id: a.id,
          name: a.name
        }))
      : [];

    const contractPricings: ContractPricing[] = [];
    for (const p of desk.prices) {
      contractPricings.push({
        term_size: p.duration,
        payment_full: p.fullPrice,
        initial_fee_full: await this.calculateInitialFeePlan(
          desk.location.coworkAccountId,
          ServicesEnum.OPEN_DESK,
          p.fullPrice,
          desk.fees
        ),
        payment_month: p.monthlyPrice,
        initial_fee_month: await this.calculateInitialFeePlan(
          desk.location.coworkAccountId,
          ServicesEnum.OPEN_DESK,
          p.monthlyPrice,
          desk.fees
        )
      });
    }

    const otherServices = await this.getOtherServices(
      desk.location.coworkAccountId,
      ServicesEnum.OPEN_DESK,
      desk.id
    );

    const spaceHost = await desk.location.getSpaceHost();
    const manager = await this.getCoworkingManager(desk.location.coworkAccountId);

    return {
      coworking_name: desk.location.coworkAccount.name,
      coworking_logo: desk.location.coworkAccount.photo
        ? desk.location.coworkAccount.photo.getPhotoUrl
        : null,
      space_host_photo: spaceHost.photo ? spaceHost.photo.getPhotoUrl : null,
      space_host_name: manager.fullName,
      location_id: desk.locationId,
      photos: photos,
      service_name: desk.name,
      service_type: ServicesEnum.MEETING_ROOM,
      description: desk.description,
      location_description: desk.location.description,
      amenities: amenities,
      renewal_tax: desk.renewalTax,
      address: {
        fulltext: desk.location.address.fulltext,
        latitude: desk.location.address.latitude,
        longitude: desk.location.address.longitude,
        country: desk.location.address.country
      },
      contract_pricing: contractPricings,
      other_services: otherServices,
      fees: desk.fees
    };
  }

  private static async searchMeetingRoom(filters: FilterSearch, page: number = 1) {
    const query = Meetroom.query()
      .preload('photos')
      .preload('spaceRules')
      .preload('location', (b) => {
        b.preload('address');
        b.preload('services');
        b.preload('amenities');
        b.preload('coworkAccount');
      })
      .where('searchable', true)
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
        locationQuery.whereHas('coworkAccount', (c) => {
          c.whereNull('deleted_at');
        });
      });

    if (filters.location) {
      query.whereHas('location', (locationQuery) => {
        locationQuery
          .whereRaw('?? LIKE ?', ['name', `%${filters.location}%`])
          .orWhereHas('address', (addressQuery) => {
            addressQuery.whereRaw('?? LIKE ?', ['fulltext', `%${filters.location}%`]);
          });
      });
    }

    if (filters.amenities) {
      query.whereHas('location', (locationQuery) => {
        locationQuery.whereHas('amenities', (amenitiesQuery) => {
          amenitiesQuery.whereIn('amenity_id', filters.amenities);
        });
      });
    }

    if (filters.lat && filters.long && filters.search_area) {
      let constDist = 3959;

      if (filters.search_area_type === SearhAreaTypesEnum.KILOMETERS) {
        constDist = 6371;
      }

      query.whereHas('location', (locationQuery) => {
        locationQuery.whereHas('address', (addressQuery) => {
          addressQuery
            .select(
              Database.raw(
                'id, (? * acos(cos(radians(?)) * cos(radians(latitude)) ' +
                  '* cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
                [
                  constDist,
                  filters.lat ? filters.lat : 0,
                  filters.long ? filters.long : 0,
                  filters.lat ? filters.lat : 0
                ]
              )
            )
            .havingRaw('distance <= ?', filters.search_area)
            .orderBy('distance', 'asc');
        });
      });
    }

    if (filters.mr_pricing_range_start && filters.mr_pricing_range_end) {
      query.whereBetween('price', [filters.mr_pricing_range_start, filters.mr_pricing_range_end]);
    }

    if (filters.mr_group_size && filters.mr_group_size > 0) {
      query.where('measure_occupancy', '>=', filters.mr_group_size);
    }

    if (filters.mr_category && filters.mr_category.length) {
      if (!Array.isArray(filters.mr_category)) {
        filters.mr_category = [filters.mr_category];
      }

      query.whereIn('type', filters.mr_category);
    }

    if (filters.mr_office_supplies !== undefined) {
      const question = await MeetroomQuestion.query()
        .where('slug', MeetroomQuestionSlugs.OFFICE_SUPPLIES)
        .first();

      if (question) {
        query.whereHas('spaceRules', (spaceRulesQuery) => {
          spaceRulesQuery
            .where('meetroomQuestionId', question.id)
            .where('answer', filters.mr_office_supplies);
        });
      }
    }

    if (filters.mr_multimedia !== undefined) {
      const question = await MeetroomQuestion.query()
        .where('slug', MeetroomQuestionSlugs.MULTIMEDIA_CONNECTORS)
        .first();

      if (question) {
        query.whereHas('spaceRules', (spaceRulesQuery) => {
          spaceRulesQuery
            .where('meetroomQuestionId', question.id)
            .where('answer', filters.mr_multimedia);
        });
      }
    }

    if (filters.mr_ada_compliant !== undefined) {
      const question = await MeetroomQuestion.query()
        .where('slug', MeetroomQuestionSlugs.ADA_COMPLIANT)
        .first();

      if (question) {
        query.whereHas('spaceRules', (spaceRulesQuery) => {
          spaceRulesQuery
            .where('meetroomQuestionId', question.id)
            .where('answer', filters.mr_ada_compliant);
        });
      }
    }

    if (filters.mr_projector !== undefined) {
      const question = await MeetroomQuestion.query()
        .where('slug', MeetroomQuestionSlugs.PRESENTATION_PROJECTOR)
        .first();

      if (question) {
        query.whereHas('spaceRules', (spaceRulesQuery) => {
          spaceRulesQuery
            .where('meetroomQuestionId', question.id)
            .where('answer', filters.mr_projector);
        });
      }
    }

    if (filters.mr_whiteboard !== undefined) {
      const question = await MeetroomQuestion.query()
        .where('slug', MeetroomQuestionSlugs.WHITEBOARD)
        .first();

      if (question) {
        query.whereHas('spaceRules', (spaceRulesQuery) => {
          spaceRulesQuery
            .where('meetroomQuestionId', question.id)
            .where('answer', filters.mr_whiteboard);
        });
      }
    }

    if (filters.mr_eat !== undefined) {
      const question = await MeetroomQuestion.query()
        .where('slug', MeetroomQuestionSlugs.EAT_IN_THE_ROOM)
        .first();

      if (question) {
        query.whereHas('spaceRules', (spaceRulesQuery) => {
          spaceRulesQuery.where('meetroomQuestionId', question.id).where('answer', filters.mr_eat);
        });
      }
    }

    if (filters.mr_start_date_time) {
      query.whereHas(
        'meetings',
        (meetingsQuery) => {
          meetingsQuery.whereNull('deleted_at');
          meetingsQuery.where('status', MeetingStatusEnum.APPROVED);
          meetingsQuery.whereRaw('? BETWEEN ?? and ??', [
            filters.mr_start_date_time,
            'date_start',
            'date_end'
          ]);
        },
        '=',
        0
      );
    }

    const records = await query.paginate(page, Env.get('ITEMS_PER_PAGE'));
    const result: ResponseSpaces[] = [];

    for (const meetroom of records.rows) {
      result.push({
        id: meetroom.id,
        title: meetroom.name,
        coworking_name: meetroom.location.coworkAccount.name,
        price: meetroom.price,
        price_type: SpacePriceType.HOUR,
        cover_photo: meetroom.photos[0]?.getPhotoUrl,
        coworking_services: meetroom.location.services.map((s) => s.abbr),
        qty_persons: meetroom.measureOccupancy,
        address: {
          fulltext: meetroom.location.address.fulltext,
          latitude: meetroom.location.address.latitude,
          longitude: meetroom.location.address.longitude,
          country: meetroom.location.address.country
        },
        measure_size: meetroom.measureSize
      });
    }

    if (filters.lowest_prices) {
      result.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
    }

    if (filters.highest_prices) {
      result.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
    }

    records.rows = result;
    return records;
  }

  private static async getMeetingRoom(id: number): Promise<ShowSpaceResponse> {
    const meetroom: Meetroom = await Meetroom.query()
      .where('id', id)
      .preload('location', (locationQuery) => {
        locationQuery.preload('amenities');
        locationQuery.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.preload('photo');
        });
        locationQuery.preload('address');
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .preload('photos')
      .first();

    if (!meetroom) {
      throw new AppError(AppError.NOT_FOUND, 'Meeting Room not found');
    }

    const photos = meetroom.photos ? meetroom.photos.map((p) => p.getPhotoUrl) : [];
    const amenities = meetroom.location.amenities
      ? meetroom.location.amenities.map((a) => ({
          id: a.id,
          name: a.name
        }))
      : [];

    const otherServices = await this.getOtherServices(
      meetroom.location.coworkAccountId,
      ServicesEnum.MEETING_ROOM,
      meetroom.id
    );

    const initialTaxes = await this.calculateInitialFeePlan(
      meetroom.location.coworkAccountId,
      ServicesEnum.MEETING_ROOM,
      meetroom.price
    );

    const spaceHost = await meetroom.location.getSpaceHost();

    const manager = await this.getCoworkingManager(meetroom.location.coworkAccountId);

    return {
      coworking_name: meetroom.location.coworkAccount.name,
      coworking_logo: meetroom.location.coworkAccount.photo
        ? meetroom.location.coworkAccount.photo.getPhotoUrl
        : null,
      space_host_photo: spaceHost.photo ? spaceHost.photo.getPhotoUrl : null,
      space_host_name: manager.fullName,
      location_id: meetroom.locationId,
      photos: photos,
      service_name: meetroom.name,
      service_type: ServicesEnum.MEETING_ROOM,
      description: meetroom.description,
      location_description: meetroom.location.description,
      amenities: amenities,
      cancelation_full: meetroom.cancelationFull,
      cancelation_half: meetroom.cancelationHalf,
      cancelation_no: meetroom.cancelationNo,
      discount_three: meetroom.discountThree,
      discount_half: meetroom.discountHalf,
      discount_full: meetroom.discountFull,
      address: {
        fulltext: meetroom.location.address.fulltext,
        latitude: meetroom.location.address.latitude,
        longitude: meetroom.location.address.longitude,
        country: meetroom.location.address.country,
        city: meetroom.location.address.city,
        state: meetroom.location.address.state
      },
      price: meetroom.price,
      price_type: SpacePriceType.HOUR,
      other_services: otherServices,
      initial_fee: initialTaxes
    };
  }

  public static async showMrBySlug(slug: string): Promise<ShowSpaceResponse> {
    const meetroom: Meetroom = await Meetroom.query()
      .where('slug', slug)
      .preload('location', (locationQuery) => {
        locationQuery.preload('amenities');
        locationQuery.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.preload('photo');
        });
        locationQuery.preload('address');
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .preload('photos')
      .first();

    if (!meetroom) {
      throw new AppError(AppError.NOT_FOUND, 'Meeting Room not found');
    }

    const photos = meetroom.photos ? meetroom.photos.map((p) => p.getPhotoUrl) : [];
    const amenities = meetroom.location.amenities
      ? meetroom.location.amenities.map((a) => ({
          id: a.id,
          name: a.name
        }))
      : [];

    const otherServices = await this.getOtherServices(
      meetroom.location.coworkAccountId,
      ServicesEnum.MEETING_ROOM,
      meetroom.id
    );

    const initialTaxes = await this.calculateInitialFeePlan(
      meetroom.location.coworkAccountId,
      ServicesEnum.MEETING_ROOM,
      meetroom.price
    );

    const spaceHost = await meetroom.location.getSpaceHost();

    const manager = await this.getCoworkingManager(meetroom.location.coworkAccountId);

    return {
      coworking_name: meetroom.location.coworkAccount.name,
      coworking_logo: meetroom.location.coworkAccount.photo
        ? meetroom.location.coworkAccount.photo.getPhotoUrl
        : null,
      space_host_photo: spaceHost.photo ? spaceHost.photo.getPhotoUrl : null,
      space_host_name: manager.fullName,
      location_id: meetroom.locationId,
      photos: photos,
      service_name: meetroom.name,
      service_type: ServicesEnum.MEETING_ROOM,
      description: meetroom.description,
      location_description: meetroom.location.description,
      amenities: amenities,
      cancelation_full: meetroom.cancelationFull,
      cancelation_half: meetroom.cancelationHalf,
      cancelation_no: meetroom.cancelationNo,
      discount_three: meetroom.discountThree,
      discount_half: meetroom.discountHalf,
      discount_full: meetroom.discountFull,
      address: {
        fulltext: meetroom.location.address.fulltext,
        latitude: meetroom.location.address.latitude,
        longitude: meetroom.location.address.longitude,
        country: meetroom.location.address.country,
        city: meetroom.location.address.city,
        state: meetroom.location.address.state
      },
      price: meetroom.price,
      price_type: SpacePriceType.HOUR,
      other_services: otherServices,
      initial_fee: initialTaxes
    };
  }

  private static async searchPrivateRoom(filters: FilterSearch, page: number = 1) {
    const query = Room.query()
      .preload('prices')
      .preload('photos')
      .preload('location', (b) => {
        b.preload('address');
        b.preload('services');
        b.preload('amenities');
        b.preload('coworkAccount');
      })
      .where('searchable', true)
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
        locationQuery.whereHas('coworkAccount', (c) => {
          c.whereNull('deleted_at');
        });
      });

    if (filters.location) {
      query.whereHas('location', (locationQuery) => {
        locationQuery
          .whereRaw('?? LIKE ?', ['name', `%${filters.location}%`])
          .orWhereHas('address', (addressQuery) => {
            addressQuery.whereRaw('?? LIKE ?', ['fulltext', `%${filters.location}%`]);
          });
      });
    }

    if (filters.amenities) {
      query.whereHas('location', (locationQuery) => {
        locationQuery.whereHas('amenities', (amenitiesQuery) => {
          amenitiesQuery.whereIn('amenity_id', filters.amenities);
        });
      });
    }

    if (filters.lat && filters.long && filters.search_area) {
      let constDist = 3959;

      if (filters.search_area_type === SearhAreaTypesEnum.KILOMETERS) {
        constDist = 6371;
      }

      query.whereHas('location', (locationQuery) => {
        locationQuery.whereHas('address', (addressQuery) => {
          addressQuery
            .select(
              Database.raw(
                'id, (? * acos(cos(radians(?)) * cos(radians(latitude)) ' +
                  '* cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
                [
                  constDist,
                  filters.lat ? filters.lat : 0,
                  filters.long ? filters.long : 0,
                  filters.lat ? filters.lat : 0
                ]
              )
            )
            .havingRaw('distance <= ?', filters.search_area)
            .orderBy('distance', 'asc');
        });
      });
    }

    if (filters.pr_pricing_range_start && filters.pr_pricing_range_end) {
      query.whereHas('prices', (pricesQuery) => {
        pricesQuery.whereBetween('monthly_price', [
          filters.pr_pricing_range_start,
          filters.pr_pricing_range_end
        ]);
      });
    }

    if (filters.pr_group_size && filters.pr_group_size > 0) {
      query.where('room_capacity', '>=', filters.pr_group_size);
    }

    const records = await query.paginate(page, Env.get('ITEMS_PER_PAGE'));
    const result: ResponseSpaces[] = [];

    for (const room of records.rows) {
      const priceData = this.getLowerPlanPrice(room);

      result.push({
        id: room.id,
        title: room.name,
        coworking_name: room.location.coworkAccount.name,
        price: priceData.lowerPrice,
        price_type: priceData.priceType,
        cover_photo: room.photos[0]?.getPhotoUrl,
        coworking_services: room.location.services.map((s) => s.abbr),
        qty_persons: room.roomCapacity,
        address: {
          fulltext: room.location.address.fulltext,
          latitude: room.location.address.latitude,
          longitude: room.location.address.longitude,
          country: room.location.address.country
        },
        measure_size: room.spaceSize
      });
    }

    if (filters.lowest_prices) {
      result.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
    }

    if (filters.highest_prices) {
      result.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
    }

    records.rows = result;
    return records;
  }

  private static async getPrivateRoom(id: number): Promise<ShowSpaceResponse> {
    const room: Room = await Room.query()
      .where('id', id)
      .preload('location', (locationQuery) => {
        locationQuery.preload('amenities');
        locationQuery.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.preload('photo');
        });
        locationQuery.preload('address');
      })
      .preload('photos')
      .preload('prices')
      .preload('fees', (feesQuery) => {
        feesQuery.whereNull('deleted_at');
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .first();

    if (!room) {
      throw new AppError(AppError.NOT_FOUND, 'Room not found');
    }

    const photos = room.photos ? room.photos.map((p) => p.getPhotoUrl) : [];
    const amenities = room.location.amenities
      ? room.location.amenities.map((a) => ({
          id: a.id,
          name: a.name
        }))
      : [];

    const contractPricings: ContractPricing[] = [];
    for (const p of room.prices) {
      contractPricings.push({
        term_size: p.duration,
        payment_full: p.fullPrice,
        initial_fee_full: await this.calculateInitialFeePlan(
          room.location.coworkAccountId,
          ServicesEnum.PRIVATE_ROOM,
          p.fullPrice,
          room.fees
        ),
        payment_month: p.monthlyPrice,
        initial_fee_month: await this.calculateInitialFeePlan(
          room.location.coworkAccountId,
          ServicesEnum.PRIVATE_ROOM,
          p.monthlyPrice,
          room.fees
        )
      });
    }

    const otherServices = await this.getOtherServices(
      room.location.coworkAccountId,
      ServicesEnum.PRIVATE_ROOM,
      room.id
    );

    const spaceHost = await room.location.getSpaceHost();
    const manager = await this.getCoworkingManager(room.location.coworkAccountId);

    return {
      coworking_name: room.location.coworkAccount.name,
      coworking_logo: room.location.coworkAccount.photo
        ? room.location.coworkAccount.photo.getPhotoUrl
        : null,
      space_host_photo: spaceHost.photo ? spaceHost.photo.getPhotoUrl : null,
      space_host_name: manager.fullName,
      location_id: room.locationId,
      photos: photos,
      service_name: room.name,
      service_type: ServicesEnum.PRIVATE_ROOM,
      description: room.description,
      location_description: room.location.description,
      amenities: amenities,
      renewal_tax: room.renewalTax,
      address: {
        fulltext: room.location.address.fulltext,
        latitude: room.location.address.latitude,
        longitude: room.location.address.longitude,
        country: room.location.address.country
      },
      contract_pricing: contractPricings,
      other_services: otherServices,
      fees: room.fees
    };
  }

  public static async showPrBySlug(slug: string): Promise<ShowSpaceResponse> {
    const room: Room = await Room.query()
      .where('slug', slug)
      .preload('location', (locationQuery) => {
        locationQuery.preload('amenities');
        locationQuery.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.preload('photo');
        });
        locationQuery.preload('address');
      })
      .preload('photos')
      .preload('prices')
      .preload('fees', (feesQuery) => {
        feesQuery.whereNull('deleted_at');
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .first();

    if (!room) {
      throw new AppError(AppError.NOT_FOUND, 'Room not found');
    }

    const photos = room.photos ? room.photos.map((p) => p.getPhotoUrl) : [];
    const amenities = room.location.amenities
      ? room.location.amenities.map((a) => ({
          id: a.id,
          name: a.name
        }))
      : [];

    const contractPricings: ContractPricing[] = [];
    for (const p of room.prices) {
      contractPricings.push({
        term_size: p.duration,
        payment_full: p.fullPrice,
        initial_fee_full: await this.calculateInitialFeePlan(
          room.location.coworkAccountId,
          ServicesEnum.PRIVATE_ROOM,
          p.fullPrice,
          room.fees
        ),
        payment_month: p.monthlyPrice,
        initial_fee_month: await this.calculateInitialFeePlan(
          room.location.coworkAccountId,
          ServicesEnum.PRIVATE_ROOM,
          p.monthlyPrice,
          room.fees
        )
      });
    }

    const otherServices = await this.getOtherServices(
      room.location.coworkAccountId,
      ServicesEnum.PRIVATE_ROOM,
      room.id
    );

    const spaceHost = await room.location.getSpaceHost();
    const manager = await this.getCoworkingManager(room.location.coworkAccountId);

    return {
      coworking_name: room.location.coworkAccount.name,
      coworking_logo: room.location.coworkAccount.photo
        ? room.location.coworkAccount.photo.getPhotoUrl
        : null,
      space_host_photo: spaceHost.photo ? spaceHost.photo.getPhotoUrl : null,
      space_host_name: manager.fullName,
      location_id: room.locationId,
      photos: photos,
      service_name: room.name,
      service_type: ServicesEnum.PRIVATE_ROOM,
      description: room.description,
      location_description: room.location.description,
      amenities: amenities,
      renewal_tax: room.renewalTax,
      address: {
        fulltext: room.location.address.fulltext,
        latitude: room.location.address.latitude,
        longitude: room.location.address.longitude,
        country: room.location.address.country
      },
      contract_pricing: contractPricings,
      other_services: otherServices,
      fees: room.fees
    };
  }

  private static getLowerPlanPrice(record) {
    let lowerPrice = Number.MAX_SAFE_INTEGER;
    let priceType = SpacePriceType.MONTH;

    for (const price of record.prices) {
      if (price.monthlyPrice < lowerPrice) {
        lowerPrice = price.monthlyPrice;
      }
    }

    if (lowerPrice === Number.MAX_SAFE_INTEGER) {
      for (const price of record.prices) {
        if (price.fullPrice < lowerPrice) {
          lowerPrice = price.fullPrice;
        }
      }
    }

    return { lowerPrice, priceType };
  }

  private static async getOtherServices(
    coworkAccount: number,
    serviceType: string,
    serviceId: number
  ) {
    const totalItems = 3;

    // Meetroom
    const meetrooms: Meetroom[] = await Meetroom.query()
      .preload('photos')
      .preload('spaceRules')
      .preload('location', (b) => {
        b.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.where('id', coworkAccount);
          coworkAccountQuery.whereNull('deleted_at');
        });
      })
      .if(serviceType === ServicesEnum.MEETING_ROOM, (q) => {
        q.where('id', '<>', serviceId);
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .where('searchable', true);

    const meetroomsFormated: LocationServicesRecommendation[] = meetrooms.map((m) => ({
      id: m.id,
      name: m.name,
      service_type: ServicesEnum.MEETING_ROOM,
      photo: m.photos[0]?.getPhotoUrl,
      price: m.price,
      price_type: SpacePriceType.HOUR,
      qty_persons: m.measureOccupancy
    }));

    // Private Room
    const privateRooms = await Room.query()
      .preload('prices')
      .preload('photos')
      .preload('location', (b) => {
        b.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.where('id', coworkAccount);
          coworkAccountQuery.whereNull('deleted_at');
        });
      })
      .if(serviceType === ServicesEnum.PRIVATE_ROOM, (q) => {
        q.where('id', '<>', serviceId);
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .where('searchable', true);

    const privateRoomsFormated: LocationServicesRecommendation[] = [];
    for (const room of privateRooms) {
      const priceData = this.getLowerPlanPrice(room);

      privateRoomsFormated.push({
        id: room.id,
        name: room.name,
        service_type: ServicesEnum.PRIVATE_ROOM,
        photo: room.photos[0]?.getPhotoUrl,
        price: priceData.lowerPrice,
        price_type: priceData.priceType
      });
    }

    // Open Desk
    const openDesk = await Desk.query()
      .preload('prices')
      .preload('photos')
      .preload('location', (b) => {
        b.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.where('id', coworkAccount);
          coworkAccountQuery.whereNull('deleted_at');
        });
      })
      .if(serviceType === ServicesEnum.OPEN_DESK, (q) => {
        q.where('id', '<>', serviceId);
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .where('searchable', true);

    const openDeskFormated: LocationServicesRecommendation[] = [];
    for (const desk of openDesk) {
      const priceData = this.getLowerPlanPrice(desk);

      openDeskFormated.push({
        id: desk.id,
        name: desk.name,
        service_type: ServicesEnum.OPEN_DESK,
        photo: desk.photos[0]?.getPhotoUrl,
        price: priceData.lowerPrice,
        price_type: priceData.priceType
      });
    }

    // Virtual Offices
    const virtualOffices = await VirtualOffice.query()
      .preload('prices')
      .preload('photos')
      .preload('location', (b) => {
        b.preload('coworkAccount', (coworkAccountQuery) => {
          coworkAccountQuery.where('id', coworkAccount);
          coworkAccountQuery.whereNull('deleted_at');
        });
      })
      .if(serviceType === ServicesEnum.VIRTUAL_OFFICE, (q) => {
        q.where('id', '<>', serviceId);
      })
      .whereHas('location', (locationQuery) => {
        locationQuery.whereNull('deleted_at');
      })
      .where('searchable', true);

    const virtualOfficesFormated: LocationServicesRecommendation[] = [];
    for (const virtualOffice of virtualOffices) {
      const priceData = this.getLowerPlanPrice(virtualOffice);

      virtualOfficesFormated.push({
        id: virtualOffice.id,
        name: virtualOffice.name,
        service_type: ServicesEnum.VIRTUAL_OFFICE,
        photo: virtualOffice.photos[0]?.getPhotoUrl,
        price: priceData.lowerPrice,
        price_type: priceData.priceType
      });
    }

    // Select services random
    const items: LocationServicesRecommendation[] = [
      ...meetroomsFormated,
      ...virtualOfficesFormated,
      ...openDeskFormated,
      ...privateRoomsFormated
    ];

    return this.selectRandomServices(items, totalItems);
  }

  private static selectRandomServices(services: LocationServicesRecommendation[], n: number) {
    const maxItems = services.length;
    const recommendations: LocationServicesRecommendation[] = [];

    if (maxItems < n) {
      n = maxItems;
    }

    while (n--) {
      const x = Math.floor(Math.random() * services.length);
      recommendations.push(services[x]);
      services.splice(x, 1);
    }

    return recommendations;
  }

  private static async calculateInitialFeePlan(
    coworkAccountId: number,
    serviceType: string,
    price: number,
    taxes?: any
  ) {
    let initialFee = 0;

    const automaticTaxes = await TaxesService.getAutomaticTaxes(coworkAccountId, serviceType);

    let fees: any[] = [...automaticTaxes];

    if (taxes) {
      fees = [...fees, ...taxes];
    }

    // Fixed taxes
    initialFee += fees
      .filter(
        (s) =>
          s.recurring_type === RecurringTypeTaxEnum.CREATED && s.method === TaxMethodsEnum.FIXED
      )
      .reduce((prev, cur) => prev + cur.value, 0);

    // Percentage taxes
    const percentageAutomaticFees = fees.filter(
      (s) =>
        s.recurring_type === RecurringTypeTaxEnum.CREATED && s.method === TaxMethodsEnum.PERCENTAGE
    );

    for (const fee of percentageAutomaticFees) {
      initialFee += price * (fee.value / 10000);
    }

    return Math.round(initialFee);
  }
}
