import { SecondaryButton } from "@components/Button/SecondaryButton";
import { Input } from "@components/Form/Input";
import { Textarea } from "@components/Form/Textarea";
import { FormHandles } from "@unform/core";
import React, {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useState,
} from "react";
import type { Fee } from "types/cowork";
import { CloseIcon, Container, Content, Footer, Row, Wrapper } from "./styles";
import Money from "dinero.js";

interface InitialFeeFormProps {
  formRef?: MutableRefObject<FormHandles>;
  initialData?: Fee[];
}

export const InitialFeeForm: React.FC<InitialFeeFormProps> = ({
  formRef,
  initialData,
}) => {
  const [currentIndex, setCurrentindex] = useState(0);
  const [feesArray, setFeesArray] = useState([
    { feeName: "", feeValue: "0", feeDescription: "", isDelete: false },
  ]);

  useEffect(() => {
    if (initialData?.length > 0) {
      setFeesArray([
        ...initialData.map((fee) => ({
          feeName: fee.name,
          feeValue: fee.amount,
          feeDescription: fee.description,
          isDelete: false,
        })),
        { feeName: "", feeValue: "0", feeDescription: "", isDelete: false },
      ]);
      setCurrentindex(initialData.length);
    }
  }, [initialData]);

  const handleAddFee = () => {
    if (currentIndex !== feesArray.length - 1) {
      setCurrentindex(feesArray.length - 1);
    } else {
      const data = formRef.current?.getData();
      const { fees } = data;

      if (
        fees[currentIndex].name &&
        fees[currentIndex].amount &&
        fees[currentIndex].description
      ) {
        setCurrentindex(currentIndex + 1);
        const newFees = [...feesArray];
        setFeesArray([
          ...newFees,
          { feeName: "", feeValue: "0", feeDescription: "", isDelete: false },
        ]);
      } else {
        if (!fees[currentIndex].name) {
          formRef.current?.setFieldError(
            `fees[${currentIndex}].name`,
            "Required"
          );
        }
        if (!fees[currentIndex].amount) {
          formRef.current?.setFieldError(
            `fees[${currentIndex}].amount`,
            "Required"
          );
        }
        if (!fees[currentIndex].description) {
          formRef.current?.setFieldError(
            `fees[${currentIndex}].description`,
            "Required"
          );
        }
      }
    }
  };

  const handleInputChange =
    (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const number = value.replace(/\$|,|\./g, "");

      if (field === "feeValue" && !number) {
        setFeesArray(
          feesArray.map((fee, index) =>
            index === currentIndex
              ? {
                  ...fee,
                  [field]: "0",
                }
              : fee
          )
        );
        return;
      }

      setFeesArray(
        feesArray.map((fee, index) =>
          index === currentIndex
            ? {
                ...fee,
                [field]: field === "feeValue" ? number : value,
              }
            : fee
        )
      );
    };
  const handleTextAreaChange =
    (field: string) => (event: ChangeEvent<HTMLTextAreaElement>) => {
      setFeesArray(
        feesArray.map((fee, index) =>
          index === currentIndex ? { ...fee, [field]: event.target.value } : fee
        )
      );
    };

  const handleDoubleClick = (index: number) => () => {
    formRef.current?.setFieldError(`fees[${currentIndex}].name`, "");
    formRef.current?.setFieldError(`fees[${currentIndex}].amount`, "");
    formRef.current?.setFieldError(`fees[${currentIndex}].description`, "");

    setCurrentindex(index);
  };

  const handleDeleteFee = (deleteIndex: number) => () => {
    if (deleteIndex !== feesArray.length - 1) {
      setFeesArray(
        feesArray.map((fee, index) =>
          index === deleteIndex ? { ...fee, feeName: "", isDelete: true } : fee
        )
      );
    }
  };

  return (
    <Wrapper>
      <Container
        isOverflown={feesArray.filter((fee) => !fee.isDelete).length > 1}
      >
        {feesArray.map((fee, index) => (
          <Content
            key={index}
            isClosed={index !== currentIndex}
            onDoubleClick={handleDoubleClick(index)}
            isDelete={fee.isDelete}
          >
            <Input
              name={`fees[${index}].name`}
              value={feesArray[index].feeName}
              onChange={handleInputChange("feeName")}
              placeholder="Fee Name"
              readOnly={index !== currentIndex}
              extraClass={index !== currentIndex ? "hidden" : ""}
            />

            {index !== currentIndex && <p>{feesArray[index].feeName}</p>}

            <Row>
              {index === currentIndex && <p>Fee Amount:</p>}

              <Input
                name={`fees[${index}].amount`}
                placeholder="$0,000.00"
                value={
                  parseInt(feesArray[index].feeValue)
                    ? Money({
                        amount: parseInt(feesArray[index].feeValue),
                      }).toFormat("$0,0.00")
                    : ""
                }
                onChange={handleInputChange("feeValue")}
                width={90}
                backgroundColor="#ffffff"
                readOnly={index !== currentIndex}
              />
            </Row>

            <Textarea
              name={`fees[${index}].description`}
              value={feesArray[index].feeDescription}
              onChange={handleTextAreaChange("feeDescription")}
              placeholder={index !== currentIndex ? "" : "Fee Description"}
              height={90}
              extraClass={index !== currentIndex ? "hidden" : ""}
            />
            <CloseIcon
              isShown={index !== currentIndex}
              onClick={handleDeleteFee(index)}
            >
              <svg width="7.991" height="7.991" viewBox="0 0 7.991 7.991">
                <g transform="translate(-24.222 -26.222)">
                  <rect
                    width="10.273"
                    height="1.027"
                    rx="0.514"
                    transform="translate(24.948 26.222) rotate(45)"
                    fill="#fff"
                  />
                  <rect
                    width="10.273"
                    height="1.027"
                    rx="0.514"
                    transform="translate(32.212 26.948) rotate(135)"
                    fill="#fff"
                  />
                </g>
              </svg>
            </CloseIcon>
          </Content>
        ))}
      </Container>
      <Footer>
        <SecondaryButton type="button" onClick={handleAddFee}>
          {currentIndex === feesArray.length - 1
            ? "ADD NEW INITIAL FEE"
            : "SAVE"}
        </SecondaryButton>
      </Footer>
    </Wrapper>
  );
};
