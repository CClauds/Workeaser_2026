import { Button } from "@components/Button";
import { CustomLink } from "@components/CustomLink";
import { Checkbox } from "@components/Form/Checkbox";
import { CustomRadio } from "@components/Form/CustomRadio";
import { Input } from "@components/Form/Input";
import { Icomoon } from "@components/Icomoon";
import { useDebounce } from "@hooks/useDebounce";
import { api } from "@services/api";
import { getGeoLocation } from "@services/map";
import {
  ButtonContainer,
  CheckboxLabel,
  Container,
  Footer,
  Form,
  Row,
  Subtitle,
} from "@styles/pages/create-account/styles";
import { FormHandles, SubmitHandler } from "@unform/core";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Suggestion } from "types";
import { Address } from "types/locations";
import * as Yup from "yup";

type FormData = {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  password: string;
  password_confirmation: string;
};

const CreateAccount = () => {
  const router = useRouter();
  const { token } = router.query;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Suggestion[]>();
  const [isSearching, setIsSearching] = useState(false);
  const [bestSuggestion, setBestSuggestion] = useState<Address>();
  const [address, setAddress] = useState<Address>();
  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  useEffect(() => {
    const fetchLocations = async () => {
      const locations = await getGeoLocation(debouncedSearchTerm);
      if (locations.features) {
        const array = locations.features.map((feature) => ({
          id: feature.id,
          fulltext: feature.place_name,
          longitude: feature.center[0],
          latitude: feature.center[1],
        }));
        setBestSuggestion({
          fulltext: locations.features[0].place_name,
          longitude: locations.features[0].center[0],
          latitude: locations.features[0].center[1],
        });
        setSearchSuggestions(array);
      }

      setIsSearching(false);
    };
    if (debouncedSearchTerm) {
      setIsSearching(true);
      fetchLocations();
    }
  }, [debouncedSearchTerm]);

  const handleLocationClick = (index: number) => {
    setAddress(searchSuggestions[index]);
  };

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        first_name: Yup.string().min(3).required(),
        last_name: Yup.string().min(3).required(),
        personal_phone: Yup.string().min(14).required(),
        address: Yup.string().min(4).required(),
        password: Yup.string().min(8).required("Password is required"),
        password_confirmation: Yup.string()
          .min(8)
          .oneOf([Yup.ref("password"), null], "Passwords must match"),
      });
      await schema.validate(data, {
        abortEarly: false,
      });
      setIsLoading(true);

      const body = {
        ...data,
        address: {
          fulltext: data.address,
          longitude: address ? address.longitude : bestSuggestion.longitude,
          latitude: address ? address.latitude : bestSuggestion.latitude,
        },
      };

      await api.post(`/client/teams/invites/${token}`, body);
      toast.success("Conta criada com sucesso!");
      router.push("/login");
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            validationErrors[error.path] = error.message;
          });
          formRef.current.setErrors(validationErrors);
        }
      } else {
        if (!Array.isArray(err?.response?.data.error.message)) {
          toast.error(err?.response?.data.error.message);
        } else {
          err?.response?.data.error.message.forEach((message) => {
            toast.error(message.message);
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <figure>
        <Image
          src="/images/workeaser-logo.png"
          alt="workeaser logo"
          width={200}
          height={57}
        />
      </figure>

      <Form
        ref={formRef}
        onSubmit={handleSubmit}
        initialData={{ email: "", password: "", role: "COWORKING" }}
        className="single__column"
      >
        <Input
          name="first_name"
          placeholder="* First Name"
          icon="user"
          extraClass="input"
        />
        <Input
          name="last_name"
          placeholder="* Last Name"
          icon="user"
          extraClass="input"
        />

        <Input
          name="personal_phone"
          type="tel"
          placeholder="* Phone"
          mask="phone"
          icon="phone2"
          extraClass="input"
        />

        <Input
          name="address"
          type="text"
          icon="location"
          placeholder="Full Address"
          onChange={(e) => setSearchTerm(e.target.value)}
          suggestions={searchSuggestions}
          onSuggestionClick={handleLocationClick}
          isLoading={isSearching}
          extraClass="input"
        />

        <Input
          name="password"
          type="password"
          placeholder="* Password"
          icon="lock"
          extraClass="input"
        />
        <Input
          name="password_confirmation"
          type="password"
          placeholder="* Confirm Password"
          icon="lock"
          extraClass="input"
        />

        {/* <Subtitle>
          You have selected{" "}
          <strong>
            {role === "CLIENT"
              ? "Coworker & Company Account"
              : "Coworking & Space Management Account"}
          </strong>{" "}
          {role === "CLIENT"
            ? "with this account you will be able to search and rent virtual office plans, meeting room, open desk and private offices. If you have a membership with a coworking that uses our system, you will be able to manage it throught us as well."
            : "With this account you will be able to manage your locations, services, agenda, leads, clients, mailboxes, contracts, invoices and much more. If you are willing to let us sell your services you will be receiving deals and opportunities to grow faster"}
        </Subtitle> */}
        {/* <div>
          <Checkbox name="accepted" value="remember">
            <CheckboxLabel>
              I accept the Workeaser <a>Terms and Conditions</a>
            </CheckboxLabel>
          </Checkbox>
        </div> */}

        <ButtonContainer>
          <Button
            text="Create Account"
            type="submit"
            loading={isLoading}
            extraClass={isLoading ? "loading" : ""}
          />
        </ButtonContainer>
      </Form>

      <div className="customLink__container">
        <CustomLink>
          <Icomoon iconName="star" />
          <p>
            Already a customer?{" "}
            <a onClick={() => router.push("/login")}>Login here</a>
          </p>
        </CustomLink>
      </div>

      <Footer>
        <p>© 2021 Workweaser. All Rights Reserved.</p>
      </Footer>
    </Container>
  );
};

CreateAccount.authRoles = ["UNAUTH"];
export default CreateAccount;
