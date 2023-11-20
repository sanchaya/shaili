import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import { Input, Button, Icon } from "@adminjs/design-system";
import RightSideBar from "../RightSideBar/RightSideBar.js";
import axios from "axios";
import LetterTagProvider from "../../context/LetterTagContext.js";
import { BookImage } from "../BookImage/BookImage.js";
import TagModal from "../TagModal/TagModal.js";

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  @media (max-width: 800px) {
    flex-flow: column wrap;
    width: 98%;
    margin: 0 auto;
  }
`;

const LeftSide = styled.div`
  width: 70%;
  @media (max-width: 800px) {
    width: 100%;
  }
`;

const RightSide = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0px 2px 2px 1px #ccc;
  width: 30%;
  @media (max-width: 800px) {
    width: 100%;
    margin: 20px auto 0 auto;
  }
`;
const NavigationArrows = styled.div`
  display: flex;
  flex: 2 1 0%;
  align-items: center;
  gap: 15px;
  width: 70%;
  justify-content: flex-end;
  margin-bottom: 10px;
`;

const GoToPage = styled.div`
  display: flex;
  flex: 2 1 0%;
  align-items: center;
  gap: 15px;
  width: 70%;
  margin-bottom: 10px;
`;

const NavWrap = styled.div`
  display: flex;
  @media (max-width: 500px) {
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const ImageWrap = styled.div`
  width: auto;
  position: relative;
  overflow: hidden;
  @media (max-width: 800px) {
    height: auto;
  }
`;

interface IViewBookProps {
  record: {
    params: {
      id: number;
      url: string;
    };
  };
}

interface ILetterTypes {
  id: number;
  title: string;
  expanded: boolean;
  letterType: number;
}

const ViewBook: React.FC<IViewBookProps> = ({ record }) => {
  const url = record.params.url;
  const parts = url.split("/");
  const bookIdentifier = parts[parts.length - 1];
  const BASE_URL = (window as any).AdminJS.env.BASE_URL;
  const bookId = record.params.id;
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [img, setImg] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [goToPage, setGoToPage] = useState<number>(1);
  const [letterTypes, setLetterTypes] = useState<ILetterTypes[]>([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/total-pages`, {
        params: { identifier: bookIdentifier },
      })
      .then((response) => {
        setTotalPages(response.data + 1);
        loadImage(currentPage);
      });
    getLetterTypes();
  }, [loading]);

  const loadImage = (page: number) => {
    axios
      .get(`${BASE_URL}/fetch-page`, {
        responseType: "blob",
        params: { page: page - 1, identifier: bookIdentifier },
      })
      .then(function (response) {
        var reader = new window.FileReader();
        reader.readAsDataURL(response.data);
        reader.onload = function () {
          var imageDataUrl = reader.result;
          setImg(imageDataUrl as string);
          setLoading(false);
        };
      });
  };

  const getLetterTypes = () => {
    axios.get(`${BASE_URL}/get-lettertypes`).then((response) => {
      const letterTypesRes = response.data.map(
        (item: { id: number; type: string }) => ({
          id: item.id,
          title: item.type,
          expanded: false,
          letterType: item.id,
        })
      );
      setLetterTypes(letterTypesRes);
    });
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setImg("");
      setCurrentPage(currentPage + 1);
      loadImage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setImg("");
      setCurrentPage(currentPage - 1);
      loadImage(currentPage - 1);
    }
  };

  const handleGoToChange = (page: number) => {
    setGoToPage(page);
  };

  const handleGoToPage = () => {
    setImg("");
    setCurrentPage(goToPage);
    loadImage(goToPage);
  };

  return (
    <>
      <LetterTagProvider>
        <Content>
          <LeftSide>
            <NavWrap>
              <GoToPage>
                <Input
                  style={{ width: "200px" }}
                  max={totalPages}
                  min={1}
                  type="number"
                  placeholder="Go to page number..."
                  onChange={(e: { target: { value: number } }) =>
                    handleGoToChange(Number(e.target.value))
                  }
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleGoToPage}
                  size="icon"
                  disabled={
                    goToPage > totalPages ||
                    goToPage < 0 ||
                    goToPage === currentPage ||
                    !img
                  }
                  title={!img ? "Loading..." : ""}
                >
                  Go
                </Button>
              </GoToPage>
              <NavigationArrows>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handlePrev}
                  size="icon"
                  disabled={currentPage === 1 || !img}
                  title={!img ? "Loading..." : ""}
                >
                  <Icon
                    icon="ChevronLeft"
                    style={{
                      height: "100%",
                      width: "100%",
                    }}
                  />
                </Button>
                {totalPages ? (
                  <p>
                    Page {currentPage} of {totalPages}
                  </p>
                ) : (
                  <Icon icon="Loader" spin />
                )}

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleNext}
                  size="icon"
                  disabled={currentPage === totalPages || !img}
                  title={!img ? "Loading..." : ""}
                >
                  <Icon
                    icon="ChevronRight"
                    style={{
                      height: "100%",
                      width: "100%",
                    }}
                  />
                </Button>
              </NavigationArrows>
            </NavWrap>
            <ImageWrap>
              <BookImage
                image={img}
                setCapturing={setCapturing}
                capturing={capturing}
                setTag={setTag}
              />
            </ImageWrap>
          </LeftSide>
          <RightSide>
            <RightSideBar
              bookId={bookId}
              loading={loading}
              letterTypes={letterTypes}
              setLetterTypes={setLetterTypes}
            />
          </RightSide>
        </Content>
        {tag && (
          <TagModal setTag={setTag} tag={tag} bookId={bookId} mode={"add"} />
        )}
      </LetterTagProvider>
    </>
  );
};

export default ViewBook;
