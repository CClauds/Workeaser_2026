import { Icomoon } from "@components/Icomoon";
import { Loader } from "@components/Loader";
import { Thumbnail } from "@components/Thumbnail";
import { useDebounce } from "@hooks/useDebounce";
import { formatDate } from "@utils/numberFormat";
import { useFetch } from "hooks/useFetch";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import { SearchResponse, SearchResult, SearchResultDataResponse } from "types";
import { BookingsStatusColorEnum, InvoiceStatusColorEnum } from "types/enums";
import {
  Backdrop,
  Container,
  Content,
  InputContainer,
  ListContainer,
  LoaderContainer,
  SecondaryListContainer,
  Wrapper,
} from "./styles";

enum TypeEnum {
  CLIENT = "client",
  LEAD = "lead",
}

enum MailboxStatusEnum {
  HOLDING = "gray",
  TRASHED = "gray",
  COLLECTED = "green",
  FORWARDED = "yellow",
  NOT_COLLECTED = "red",
}

interface HeaderSearchProps {}

export const HeaderSearch: React.FC<HeaderSearchProps> = () => {
  const theme = useContext(ThemeContext);
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selecedResult, setSelecedResult] = useState<SearchResult>();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: { result: searchResult } = {}, error } =
    useFetch<SearchResponse>(
      debouncedSearchTerm ? `/cowork/search?q=${debouncedSearchTerm}` : null
    );

  const { data: { result: searchResultData } = {} } =
    useFetch<SearchResultDataResponse>(
      selecedResult
        ? `/cowork/search/${TypeEnum[selecedResult.user_type]}/${
            selecedResult.id
          }`
        : null
    );

  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keyup", handleKeyUp);
    } else {
      document.removeEventListener("keyup", handleKeyUp);
    }

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen]);

  useEffect(() => {
    if (debouncedSearchTerm.length) {
      setSelecedResult(null);
      setIsFetching(true);
      setIsOpen(true);
    } else {
      handleClose();
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (searchResult) {
      setIsFetching(false);
    }
  }, [searchResult]);

  const handleSarchClick = (item: SearchResult) => {
    setSelecedResult(item);
  };

  const handleInvoiceClick = (id: number) => {
    router.push(`/finances/invoices/${id}`);
    handleClose();
  };
  const handleMailboxClick = (id: number) => {
    router.push(`/relationship/client-management/mailbox/${id}`);
    handleClose();
  };
  const handleBookingClick = (id: number, type: string) => {
    router.push(`/relationship/agenda/${id}?type=${type}`);
    handleClose();
  };

  const handleClose = () => {
    setSelecedResult(null);
    setIsOpen(false);
    setSearchTerm("");
  };

  const EmptyResult = () => {
    if (
      searchResultData?.invoices?.length === 0 &&
      searchResultData?.bookings?.length === 0 &&
      searchResultData?.mailboxes?.length === 0
    ) {
      return <p>Not results...</p>;
    }
    return null;
  };

  return (
    <Wrapper isOpen={isOpen}>
      <Container isOpen={isOpen}>
        <div className="search__header">
          <InputContainer isOpen={isOpen}>
            <Icomoon
              iconName="search"
              color={theme.colors.blue800}
              fontSize={20}
            />
            <input
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
            />
            {isFetching && isOpen && (
              <LoaderContainer>
                <Loader color={theme.colors.blue200} />
              </LoaderContainer>
            )}

            <button type="button" onClick={handleClose}>
              <svg width="15.556" height="15.556" viewBox="0 0 15.556 15.556">
                <rect
                  width="20"
                  height="2"
                  rx="1"
                  transform="translate(1.414) rotate(45)"
                  fill="#2b3450"
                />
                <rect
                  width="20"
                  height="2"
                  rx="1"
                  transform="translate(15.556 1.414) rotate(135)"
                  fill="#2b3450"
                />
              </svg>
            </button>
          </InputContainer>
        </div>

        {isOpen && (
          <Content isOpen={isOpen}>
            {searchResult?.length > 0 && (
              <ListContainer>
                <h2>Leads &amp; Clients</h2>
                <ul>
                  {searchResult?.map((item) => (
                    <li
                      key={`${item.id}-${item.user_type}`}
                      onClick={() => handleSarchClick(item)}
                    >
                      <Thumbnail
                        url={item.photo}
                        alt="profile picture"
                        size={34}
                        radius={5}
                      />
                      <div>
                        <h3>
                          {item.user_name} -{" "}
                          {item.company_name ?? "Not informed"}
                        </h3>
                        <h4>
                          {item.user_email} -{" "}
                          {item.user_phone ?? "Not informed"}
                        </h4>
                      </div>
                    </li>
                  ))}
                </ul>
              </ListContainer>
            )}

            <div className="search__result">
              <EmptyResult />
              {searchResultData?.invoices?.length > 0 && (
                <SecondaryListContainer>
                  <h2>Invoices &amp; Payments</h2>
                  <ul>
                    {searchResultData.invoices.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => handleInvoiceClick(item.id)}
                      >
                        <h3 className={InvoiceStatusColorEnum[item.status]}>
                          #{item.id}
                        </h3>
                        <h4>
                          {item.client_name} -{" "}
                          {formatDate(new Date(item.due_date))}
                        </h4>
                      </li>
                    ))}
                  </ul>
                </SecondaryListContainer>
              )}
              {searchResultData?.mailboxes?.length > 0 && (
                <SecondaryListContainer>
                  <h2>Mailbox Receipts</h2>
                  <ul>
                    {searchResultData.mailboxes.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => handleMailboxClick(item.id)}
                      >
                        <h3 className={MailboxStatusEnum[item.status]}>
                          #{item.id}
                        </h3>
                        <h4>
                          {item.client_name} -{" "}
                          {formatDate(new Date(item.received_date))}
                        </h4>
                      </li>
                    ))}
                  </ul>
                </SecondaryListContainer>
              )}
              {searchResultData?.bookings?.length > 0 && (
                <SecondaryListContainer>
                  <h2>Bookings &amp; Scheduling</h2>
                  <ul>
                    {searchResultData.bookings.map((item) => (
                      <li
                        key={`${item.id}=${item.type}`}
                        onClick={() => handleBookingClick(item.id, item.type)}
                      >
                        <h3 className={BookingsStatusColorEnum[item.status]}>
                          #{item.id}
                        </h3>
                        <h4>
                          {item.client_name} - {formatDate(new Date(item.date))}
                        </h4>
                      </li>
                    ))}
                  </ul>
                </SecondaryListContainer>
              )}
            </div>
          </Content>
        )}
      </Container>
      <Backdrop isOpen={isOpen} />
    </Wrapper>
  );
};
