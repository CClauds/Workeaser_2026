import { Button } from "@components/Button";
import { NavigationButton } from "@components/Button/NavigationButton";
import { BookTourModal } from "@components/Client/Modals/BookTourModal";
import { CoworkingCard } from "@components/Coworking/CoworkingCard";
import { Icomoon } from "@components/Icomoon";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { PulicLayout } from "@components/Layouts/PulicLayout";
import { GalleryModal } from "@components/Modals/GalleryModal";
import { ImagesCarousel } from "@components/Spaces/ImagesCarousel";
import { SpaceHeader } from "@components/Spaces/SpaceHeader";
import { Thumbnail } from "@components/Thumbnail";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import {
  AmenitiesGrid,
  AmenityCard,
  Blur,
  Carousel,
  Container,
  Content,
  ContentContainer,
  MapContainer,
  MapSubtitle,
  OtherServicesContainer,
  Sidebar,
  SidebarHeader,
} from "@styles/pages/spaces/single/styles";
import { shiftPhotoArray } from "@utils/helpers";
import { FeatureCollection } from "geojson";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { PagesProps } from "pages/_app";
import { ReactElement, useState } from "react";
import Map, { CircleLayer, Layer, Source } from "react-map-gl";
import { useTheme } from "styled-components";
import { ServicesAbbr } from "types/client";
import { AmenitiesIconsEnum, ServicesSlugEnum } from "types/enums";
import { Service } from "types/infos";
import { SpaceLocationsResponse } from "types/spaces";
import { User } from "types/user";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  const { id } = context.params;

  const userPromise = apiClient.get("/me");
  const spacePromise = apiClient.get<SpaceLocationsResponse>(`/spaces/${id}`);
  const servicePromise = apiClient.get("/infos/services");

  const [userResponse, spaceResponse, servicesResponse] =
    await Promise.allSettled([userPromise, spacePromise, servicePromise]);

  let users = null;

  if (userResponse.status === "fulfilled") {
    users = userResponse.value.data.result;
  }

  // @ts-ignore
  // prettier-ignore
  const { data: { result: services } } = servicesResponse.value;
  // @ts-ignore
  // prettier-ignore
  const { data: space} = spaceResponse.value;

  return {
    props: {
      user: users ? users[0] : null,
      id,
      space,
      services,
    },
  };
};

type ServiceType = keyof typeof ServicesSlugEnum;
type ServiceName = `${ServicesSlugEnum}`;

interface CardProps {
  id: number;
  title: string;
  subTitle: string;
  photo: string;
  services: ServicesAbbr[];
  priceType?: string;
  price?: number;
  serviceType: ServiceType;
}

interface SingleSpaceLocationProps {
  user: User;
  id: number;
  space: SpaceLocationsResponse;
  services: Service[];
}
const SingleSpaceLocation = ({
  user,
  id,
  space,
  services,
}: SingleSpaceLocationProps) => {
  const theme = useTheme();

  const { result: spaceData } = space;

  let otherServicesTabs: ServiceType[] = [];
  if (spaceData.rooms.length > 0) otherServicesTabs.push("PRIVATE_ROOM");
  if (spaceData.virtualOffices.length > 0)
    otherServicesTabs.push("VIRTUAL_OFFICE");
  if (spaceData.desks.length > 0) otherServicesTabs.push("OPEN_DESK");
  if (spaceData.meetrooms.length > 0) otherServicesTabs.push("MEETING_ROOM");

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceType>(
    otherServicesTabs[0]
  );
  const [carouselDirection, setCarouselDirection] = useState<number>(0);
  let shiftQuantity = 1;
  if (spaceData.photos.length > 4) {
    shiftQuantity = 2;
  }
  const [photos, setPhotos] = useState(
    shiftPhotoArray(
      spaceData.photos.map((photo) => photo.file),
      1,
      shiftQuantity
    )
  );
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);

  const handleTabClick = (button: string) => () => {
    const [serviceType] = Object.entries(ServicesSlugEnum).find(
      ([_, service]) => service === button
    );
    setCurrentService(serviceType as ServiceType);
  };

  let otherServices: CardProps[] = [];
  switch (currentService) {
    case "VIRTUAL_OFFICE":
      otherServices = spaceData.virtualOffices?.map((service) => ({
        id: service.id,
        title: service.name,
        subTitle: spaceData.name,
        photo: `${api.defaults.baseURL}/photos/${service?.photos[0].file}`,
        services: [],
        serviceType: "VIRTUAL_OFFICE",
      }));
      break;
    case "OPEN_DESK":
      otherServices = spaceData.desks?.map((service) => ({
        id: service.id,
        title: service.name,
        subTitle: spaceData.name,
        photo: `${api.defaults.baseURL}/photos/${service?.photos[0].file}`,
        services: [],
        serviceType: "OPEN_DESK",
      }));
      break;
    case "MEETING_ROOM":
      otherServices = spaceData.meetrooms?.map((service) => ({
        id: service.id,
        title: service.name,
        subTitle: spaceData.name,
        photo: `${api.defaults.baseURL}/photos/${service?.photos[0].file}`,
        services: [],
        serviceType: "MEETING_ROOM",
        price: service.price,
        priceType: "HOUR",
      }));
      break;
    case "PRIVATE_ROOM":
      otherServices = spaceData.rooms?.map((service) => ({
        id: service.id,
        title: service.name,
        subTitle: spaceData.name,
        photo: `${api.defaults.baseURL}/photos/${service?.photos[0].file}`,
        services: [],
        serviceType: "PRIVATE_ROOM",
      }));
      break;
  }

  const geojson: FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [
            spaceData.address.longitude,
            spaceData.address.latitude,
          ],
        },
      },
    ],
  };

  const layerStyle: CircleLayer = {
    id: "point",
    type: "circle",
    paint: {
      "circle-radius": 8,
      "circle-color": theme.colors.blue200,
    },
  };

  const handleGalleryChange = (direction: number, index = 1) => {
    setPhotos(shiftPhotoArray(photos, direction, index));
  };
  const handleGalleryOpen = (index: number) => {
    setIsGalleryModalOpen(true);
    if (index === 1) {
      handleGalleryChange(-1);
    } else if (index === 2) {
      handleGalleryChange(-1, 2);
    }
  };

  return (
    <>
      <Head>
        <title>{spaceData.name} | Workeaser</title>
      </Head>

      <Container>
        <SpaceHeader
          logoUrl={`${api.defaults.baseURL}/photos/${spaceData.coworkAccount.photo?.file}`}
          name={spaceData.name}
          address={
            spaceData.address?.short_address || spaceData.address.fulltext
          }
        />

        <Carousel itemsQuantity={spaceData.photos.length}>
          <div>
            <ImagesCarousel
              photos={photos.map(
                (photo) => `${api.defaults.baseURL}/photos/${photo}`
              )}
              onGalleryChange={handleGalleryChange}
              onImageClick={handleGalleryOpen}
            />
          </div>
        </Carousel>

        <ContentContainer>
          <section>
            <Content>
              <h3>About {spaceData.name}:</h3>

              <p className="description">{spaceData.description}</p>

              <AmenitiesGrid>
                {spaceData.amenities.map((item) => (
                  <AmenityCard key={item.id}>
                    <Icomoon
                      iconName={AmenitiesIconsEnum[item.id]}
                      fontSize={22}
                    />
                    <span>{item.name}</span>
                  </AmenityCard>
                ))}
              </AmenitiesGrid>
            </Content>

            <Content>
              <h3>Directions:</h3>
              <MapContainer>
                <Map
                  initialViewState={{
                    longitude: spaceData.address.longitude,
                    latitude: spaceData.address.latitude,
                    zoom: 14,
                  }}
                  mapStyle="mapbox://styles/mapbox/streets-v9"
                  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
                >
                  <Source id="my-data" type="geojson" data={geojson}>
                    <Layer {...layerStyle} />
                  </Source>
                </Map>
              </MapContainer>
              <MapSubtitle>{spaceData.address.fulltext}</MapSubtitle>
            </Content>
          </section>

          <section>
            <Sidebar>
              <SidebarHeader>
                <Thumbnail
                  url={spaceData.manager.photo}
                  alt="host picture"
                  size={85}
                  radius={5}
                />
                <h4>{spaceData.manager.name}</h4>
                <p>Space Host</p>
              </SidebarHeader>

              <div className="sidebar__footer">
                <Button
                  text="SCHEDULE A TOUR"
                  color="secondary"
                  onClick={() => setIsTourModalOpen(true)}
                />
                <Button text="ASK FOR A DAY PASS" color="secondary" disabled />
              </div>

              {user?.role !== "CLIENT" && (
                <Blur>
                  <span>Restricted Access for Coworker Accounts.</span>
                </Blur>
              )}
            </Sidebar>
          </section>
        </ContentContainer>

        {!!otherServicesTabs.length && (
          <OtherServicesContainer>
            <h3>Other services from {spaceData.name}:</h3>
            <NavigationButton
              buttonTexts={otherServicesTabs.map(
                (tab) => ServicesSlugEnum[tab]
              )}
              activeButton={ServicesSlugEnum[currentService].replace(/ /gi, "")}
              callback={handleTabClick}
            />
            <section className="cards__container">
              {otherServices?.map((card) => (
                <CoworkingCard
                  key={card.id}
                  coworking={card}
                  services={services}
                  onClickLink={`/spaces/services/${card.id}?serviceType=${card.serviceType}`}
                />
              ))}
            </section>
          </OtherServicesContainer>
        )}
      </Container>

      <BookTourModal
        resource={{
          locationId: spaceData.id,
          name: spaceData.name,
        }}
        services={services}
        isOpen={isTourModalOpen}
        onRequestClose={() => setIsTourModalOpen(false)}
      />

      <GalleryModal
        isOpen={isGalleryModalOpen}
        photos={photos.map(
          (photo) => `${api.defaults.baseURL}/photos/${photo}`
        )}
        onRequestClose={() => setIsGalleryModalOpen(false)}
        onGalleryChange={handleGalleryChange}
      />
    </>
  );
};

SingleSpaceLocation.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  const {
    props: {
      children: { props },
    },
  } = page;
  const { user } = props;
  if (!user) {
    return <PulicLayout>{page}</PulicLayout>;
  }
  if (user?.role === "CLIENT") {
    return <ClientLayout componentProps={componentProps}>{page}</ClientLayout>;
  }
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default SingleSpaceLocation;
