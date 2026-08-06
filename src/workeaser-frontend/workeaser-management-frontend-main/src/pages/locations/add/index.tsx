import { Button } from "@components/Button";
import { CheckboxIcon } from "@components/Form/CheckboxIcon";
import { Dropzone } from "@components/Form/Dropzone";
import { Input } from "@components/Form/Input";
import { ServiceCheckbox } from "@components/Form/ServiceCheckbox";
import { Textarea } from "@components/Form/Textarea";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { addLocation, updateLocation } from "@services/api/cowork/locations";
import { LocationBody } from "@services/api/cowork/locations/types";
import { uploadImage } from "@services/api/fileUpload";
import { getAPIClient } from "@services/apiClient/index";
import { Row } from "@styles/reusable";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { errorHandler } from "@utils/errors";
import { useDebounce } from "hooks/useDebounce";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getGeoLocation } from "services/map";
import { mutate } from "swr";
import { AcceptedFiles, LocationAddressRelation, Suggestion } from "types";
import { AmenitiesIconsEnum } from "types/enums";
import { Amenity, Service } from "types/infos";
import { ApiItem, LocationResponse, LocationType } from "types/locations";
import * as Yup from "yup";
import styles from "./styles.module.scss";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);

  if (!token) {
    return {
      redirect: {
        destination: "/login?expired=true",
        permanent: false,
      },
    };
  }
  const apiClient = getAPIClient(context);
  const { id } = context.query;

  const servicesPromise = apiClient.get("/infos/services");
  const amenitiesPromise = apiClient.get("/infos/amenities");
  const promises: Promise<any>[] = [servicesPromise, amenitiesPromise];

  if (id) {
    const locationsPromise = apiClient.get<LocationResponse>(
      `/cowork/locations/${id}`
    );
    promises.push(locationsPromise);
  }
  const responseArray = await Promise.all(promises);

  const [{ data: services }, { data: amenities }, locationResponse] =
    responseArray;

  const initialData = locationResponse
    ? locationResponse.data.result.location
    : null;

  return {
    props: {
      services: services.result,
      amenities: amenities.result,
      initialData,
    },
  };
};

interface FormData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  photos: AcceptedFiles[];
  services: ApiItem[];
  amenities: ApiItem[];
}

interface AddLocationProps {
  services: Service[];
  amenities: Amenity[];
  initialData: LocationType;
}
const AddLocation = ({
  services,
  amenities,
  initialData,
}: AddLocationProps) => {
  const router = useRouter();
  const { id, pageCount } = router.query;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Suggestion[]>();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isSearching, setIsSearching] = useState(false);
  const [bestSuggestion, setBestSuggestion] =
    useState<LocationAddressRelation>();
  const [address, setAddress] = useState<LocationAddressRelation>();

  const formRef = useRef<FormHandles>(null);

  useEffect(() => {
    if (initialData) {
      const { fulltext, longitude, latitude, country, state, city } =
        initialData.address;
      setAddress({
        fulltext,
        longitude,
        latitude,
        country,
        state,
        city,
      });

      const formData = {
        ...initialData,
        address: initialData.address.fulltext,
        services: services?.map((service) => ({
          id: initialData.services.some(
            (selectedService) => selectedService.id === service.id
          ),
        })),
        amenities: amenities.map((amenity) => ({
          id: initialData.amenities.some(
            (selectedAmenity) => selectedAmenity.id === amenity.id
          ),
        })),
      };
      formRef.current?.setData(formData);
    }
  }, [initialData]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchLocations = async () => {
      const locations = await getGeoLocation(debouncedSearchTerm);

      if (locations.features) {
        const suggestionsArray = locations.features.map((feature) => {
          const { context } = feature;
          let country = "";
          let state = "";
          let city = "";

          const countryContext = context?.find(
            (item) => item.id.indexOf("country") >= 0
          );
          const regionContext = context?.find(
            (item) => item.id.indexOf("region") >= 0
          );
          const cityContext = context?.find(
            (item) => item.id.indexOf("place") >= 0
          );
          if (countryContext) {
            country = countryContext.text;
          }
          if (regionContext) {
            state = regionContext.text;
          }
          if (cityContext) {
            city = cityContext.text;
          }

          if (!city && feature.id.indexOf("place") >= 0) {
            city = feature.text;
          }

          return {
            id: feature.id,
            fulltext: feature.place_name,
            longitude: feature.center[0],
            latitude: feature.center[1],
            country: country || "",
            state: state || "",
            city: city || "",
          };
        });
        setSearchSuggestions(suggestionsArray);

        const [bestLocation] = locations.features;
        const { context } = bestLocation;

        let country = "";
        let state = "";
        let city = "";

        const countryContext = context?.find(
          (item) => item.id.indexOf("country") >= 0
        );
        const regionContext = context?.find(
          (item) => item.id.indexOf("region") >= 0
        );
        const cityContext = context?.find(
          (item) => item.id.indexOf("place") >= 0
        );
        if (countryContext) {
          country = countryContext.text;
        }
        if (regionContext) {
          state = regionContext.text;
        }
        if (cityContext) {
          city = cityContext.text;
        }

        if (!city && bestLocation.id.indexOf("place") >= 0) {
          city = bestLocation.text;
        }

        setBestSuggestion({
          fulltext: bestLocation.place_name,
          longitude: bestLocation.center[0],
          latitude: bestLocation.center[1],
          country: country || "",
          state: state || "",
          city: city || "",
        });
      }

      setIsSearching(false);
    };
    if (debouncedSearchTerm) {
      setIsSearching(true);
      fetchLocations();
    }
  }, [debouncedSearchTerm]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        name: Yup.string().min(2).required(),
        email: Yup.string().email().required(),
        phone: Yup.string().min(14).required(),
        description: Yup.string().min(3).required(),
        address: Yup.string().min(4).required(),
        photos: Yup.array().min(4),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const oldImages = data.photos.reduce(
        (acc, currentImage) =>
          currentImage.id ? [...acc, { id: currentImage.id }] : acc,
        []
      );

      const imagesPromises = data.photos.reduce(
        (acc, currentImage) =>
          currentImage.name ? [...acc, uploadImage(currentImage)] : acc,
        []
      );
      const imagesResponse = await Promise.all(imagesPromises);

      const newImages = imagesResponse.map((item) => ({ id: item.id }));

      const body: LocationBody = {
        ...data,
        address: {
          fulltext: data.address,
          longitude: address?.longitude || bestSuggestion.longitude,
          latitude: address?.latitude || bestSuggestion.latitude,
          country: address?.country || bestSuggestion.country,
          state: address?.state || bestSuggestion.state,
          city: address?.city || bestSuggestion.city,
        },
        photos: [...oldImages, ...newImages],
        services: data.services.filter((service) => service.id),
        amenities: data.amenities.filter((amenty) => amenty.id),
      };

      if (id) {
        await updateLocation(Number(id), body);
        mutate(`/cowork/locations?page=${pageCount}`);
        mutate(`/cowork/locations?page=${Number(pageCount) + 1}`);
        toast.success("Location updated");
      } else {
        await addLocation(body);
        mutate(`/cowork/locations?page=${pageCount}`);
        mutate(`/cowork/locations?page=${Number(pageCount) + 1}`);
        toast.success("Location added");
      }
      router.push("/locations/veneusmanagement");
    } catch (err) {
      errorHandler(err, formRef);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationClick = (index: number) => {
    setAddress(searchSuggestions[index]);
  };

  return (
    <>
      <Head>
        <title>{id ? "Edit" : "Add New"} Location | Workeaser</title>
      </Head>

      <div className={styles.container}>
        <PageHeader>
          <div>
            <h1>
              <Link href="/locations/veneusmanagement">Locations</Link>
            </h1>
            <h2>{id ? "Edit" : "Add New"} Location</h2>
          </div>
        </PageHeader>

        <div className={styles.content}>
          <h1>{id ? "Edit" : "Create a New"} Location</h1>
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            className={styles.formContainer}
          >
            <div className={styles.formElements}>
              <div>
                <Input name="name" type="text" placeholder="Name" />

                <Row gap={15}>
                  <Input name="email" type="email" placeholder="Email" />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Phone"
                    mask="phone"
                  />
                </Row>

                <Textarea
                  name="description"
                  placeholder="Description"
                ></Textarea>

                <Input
                  name="address"
                  type="text"
                  icon="location"
                  placeholder="Full Address"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  suggestions={searchSuggestions}
                  onSuggestionClick={handleLocationClick}
                  isLoading={isSearching}
                />

                <div>
                  <Dropzone
                    name="photos"
                    label="Drag &amp; Drop the Location Photos"
                    disclaimer="* The first photo will the cover image."
                  />
                </div>

                <div className={styles.servicesContainer}>
                  <p>Offered Services:</p>

                  <div>
                    {services?.map((service, index) => (
                      <ServiceCheckbox
                        key={service.id}
                        name={`services[${index}].id`}
                        value={service.id}
                        label={service.abbr}
                        tooltip={service.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4>Offered Amenities:</h4>

                <div className={styles.checkboxesContainer}>
                  {amenities?.map((amenity, index) => (
                    <CheckboxIcon
                      key={amenity.id}
                      name={`amenities[${index}].id`}
                      value={amenity.id}
                      label={amenity.name}
                      icon={AmenitiesIconsEnum[amenity.id]}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <Button
                type="submit"
                text={id ? "EDIT LOCATION" : "ADD NEW LOCATION"}
                loading={isLoading}
                extraClass={
                  isLoading === undefined
                    ? ""
                    : isLoading
                    ? styles.shrink
                    : styles.expand
                }
              />
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default AddLocation;
AddLocation.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
