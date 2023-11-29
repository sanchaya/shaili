import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import axios from "axios";
import { Box, Loader, Select } from "@adminjs/design-system";

const CompareContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const CompareItem = styled.div`
  width: calc(50% - 15px);
  background-color: #f0f0f0;
  margin-bottom: 10px;
  text-align: center;
  box-sizing: border-box;
  border: 1px solid #ccc;
  margin-right: 10px;
  padding: 20px;
  @media (max-width: 800px) {
    padding: 8px;
  }
`;

const HeaderItem = styled.div`
  text-align: center;
  padding: 30px;
  font-size: 40px;
  line-height: 1;
  @media (max-width: 600px) {
    font-size: 28px;
`;

const SelectDiv = styled.div`
  width: auto;
  margin: auto auto 10px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  @media (max-width: 800px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const CustomSelect = styled.div`
  width: 50%;
  @media (max-width: 800px) {
    width: 100%;
  }
`;

const Container = styled.div`
  text-align: left;
  padding: 30px;
  height: 70vh;
  background-color: #fff;
  margin-bottom: 10px;
  box-sizing: border-box;
  border: 1px solid rgb(204, 204, 204);
  overflow-y: auto;
  @media (max-width: 800px) {
    padding: 15px;
  }
`;

const Letters = styled.ul`
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  @media (max-width: 800px) {
    justify-content: center;
  }
`;

const LetterDiv = styled.li`
  border: 1px solid #bcbec0;
  padding: 5px;
`;

const LetterImage = styled.img`
  width: 60px;
  height: 60px;
`;

const Language = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #000;
  line-height: 1.2;
`;

const LetterType = styled.h3`
  font-size: 20px;
  font-weight: 500;
  color: #000;
  line-height: 1.2;
  @media (max-width: 800px) {
    font-size: 16px;
  }
`;

const Letter = styled.p`
  text-align: center;
  font-size: 18px;
  font-weight: 400;
  color: #000;
  line-height: 1.2;
  padding: 3px;
  @media (max-width: 800px) {
    font-size: 14px;
  }
`;

const LetterTypeDiv = styled.div`
  padding: 20px;
  @media (max-width: 800px) {
    padding: 15px 0;
  }
`;

const NotFoundDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface IBookOptions {
  value: number;
  label: string;
}

interface IData {
  id: number;
  image: string;
  letter: string;
  type: string;
  language: string;
}

interface ILetterType {
  id: number;
  type: string;
  language: string;
}

interface ILanguage {
  id: number;
  language: string;
  language_code: string;
}

interface Consonant {
  letter: string;
  image: string;
}

interface LanguageData {
  [key: string]: {
    [key: string]: Consonant[];
  };
}

interface IBooks {
  id: number;
  name: string;
  status: number;
  language: string;
}

const Comparison = () => {
  const BASE_URL = (window as any).AdminJS.env.BASE_URL;
  const [books, setBooks] = useState<IBooks[]>();
  const [bookOptions, setBookOptions] = useState<IBookOptions[]>();
  const [compareBookData, setCompareBookData] = useState<LanguageData>({});
  const [compareToBookData, setCompareToBookData] = useState<LanguageData>({});
  const [languageOptions, setLanguageOptions] = useState<ILanguage[]>();
  const [letterType, setLetterType] = useState<ILetterType[]>();
  const [compareBook, setCompareBook] = useState<IBookOptions>();
  const [compareToBook, setCompareToBook] = useState<IBookOptions>();
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareToLoading, setCompareToLoading] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/get-lettertypes`).then((response) => {
      setLetterType(response.data);
    });
    axios.get(`${BASE_URL}/get-languages`).then((response) => {
      setLanguageOptions(response.data);
    });
    axios.get(`${BASE_URL}/get-books`).then((response) => {
      setBooks(response.data);
      let Books = response.data.map(
        (book: { id: number; name: string }) => ({
          value: book.id,
          label: book.name,
        })
      );
      setBookOptions(Books);
    });
  }, []);

  const getIdLanguage = (id:number) => {
    const selectedItem = books?.find((item) => item.id === id);
  
    if (selectedItem) {
      const languageInfo = languageOptions?.find((item) => item.language_code === selectedItem.language);
  
      if (languageInfo) {
        return languageInfo.language;
      }
    }
  
    return null;
  };

  const fetchTag = async (record: IBookOptions, mode: string) => {
    mode === "compare" ? setCompareLoading(true) : setCompareToLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/tagged-letter?bookId=` + record.value
      );
      const letterIdMap: Record<string, boolean> = {};

      const mergedData: IData[] = response.data
        .map((item) => {
          if (!letterIdMap[item.letter_id]) {
            letterIdMap[item.letter_id] = true;

            const matchingItem = letterType?.find(
              (val) => val.id === Number(item.letter.letter_type)
            );

            const language = languageOptions?.find(
              (record) => record.language_code === matchingItem?.language
            );

            return {
              id: item.id,
              image: item.cropped_image,
              letter: item.letter.letter,
              type: matchingItem ? matchingItem.type : "",
              language: language ? language.language : "",
            };
          }
          return null;
        })
        .filter((item): item is IData => item !== null);

      const organizedData: Record<
        string,
        Record<string, { letter: string; image: string }[]>
      > = {};

      if (mergedData) {
        mergedData.forEach((item) => {
          if (!organizedData[item.language]) {
            organizedData[item.language] = {};
          }

          if (!organizedData[item.language][item.type]) {
            organizedData[item.language][item.type] = [];
          }

          organizedData[item.language][item.type].push({
            letter: item.letter,
            image: item.image,
          });
        });
      }

      const sortedData: LanguageData = {};
      const language = getIdLanguage(record.value);

      Object.keys(organizedData)
        .sort((a, b) =>
          a === language ? -1 : b === language ? 1 : a.localeCompare(b)
        )
        .forEach((language) => {
          sortedData[language] = organizedData[language];
        });
      if (mode === "compare") {
        setCompareBook(record);
        setCompareBookData(sortedData);
      } else if (mode === "compareTo") {
        setCompareToBook(record);
        setCompareToBookData(sortedData);
      }

      mode === "compare"
        ? setCompareLoading(false)
        : setCompareToLoading(false);

    } catch (error) {
      console.error("Error fetching tagged percentage:", error);
    }
  };

  return (
    <Box style={{ width: "96%", margin: "0 auto" }}>
      <HeaderItem>Comparison of Books Tags</HeaderItem>
      <CompareContainer>
        <CompareItem>
          <SelectDiv>
            <label>Select a Book</label>
            <CustomSelect>
              <Select
                isDisabled={compareLoading}
                isClearable={false}
                value={compareBook}
                options={bookOptions}
                onChange={(newValue) => fetchTag(newValue, "compare")}
              />
            </CustomSelect>
          </SelectDiv>
          <Container>
            {compareBook != undefined ? (
              compareLoading == true ? (
                <Loader />
              ) : Object.keys(compareBookData).length > 0 ? (
                Object.entries(compareBookData).map(
                  ([language, consonantGroups]) => (
                    <div key={language}>
                      <Language>Language: {language}</Language>
                      {Object.entries(
                        consonantGroups as { [key: string]: Consonant[] }
                      ).map(([letterType, consonants]) => (
                        <LetterTypeDiv key={letterType}>
                          <LetterType>{letterType}</LetterType>
                          <Letters>
                            {consonants.map((consonant, innerIndex) => (
                              <LetterDiv key={innerIndex}>
                                <Letter>{consonant.letter}</Letter>
                                <LetterImage
                                  src={consonant.image}
                                  alt={`Image for ${consonant.letter}`}
                                />
                              </LetterDiv>
                            ))}
                          </Letters>
                        </LetterTypeDiv>
                      ))}
                    </div>
                  )
                )
              ) : (
                <NotFoundDiv>No Tags available.</NotFoundDiv>
              )
            ) : (
              <NotFoundDiv>Choose the Book.</NotFoundDiv>
            )}
          </Container>
        </CompareItem>
        <CompareItem>
          <SelectDiv>
            <label>Select a Book</label>
            <CustomSelect>
              <Select
                isDisabled={compareToLoading}
                isClearable={false}
                value={compareToBook}
                options={bookOptions}
                onChange={(newValue) => fetchTag(newValue, "compareTo")}
              />
            </CustomSelect>
          </SelectDiv>
          <Container>
            {compareToBook != undefined ? (
              compareToLoading == true ? (
                <Loader />
              ) : Object.keys(compareToBookData).length > 0 ? (
                Object.entries(compareToBookData).map(
                  ([language, consonantGroups]) => (
                    <div key={language}>
                      <Language>Language: {language}</Language>
                      {Object.entries(
                        consonantGroups as { [key: string]: Consonant[] }
                      ).map(([letterType, consonants]) => (
                        <LetterTypeDiv key={letterType}>
                          <LetterType>{letterType}</LetterType>
                          <Letters>
                            {consonants.map((consonant, innerIndex) => (
                              <LetterDiv key={innerIndex}>
                                <Letter>{consonant.letter}</Letter>
                                <LetterImage
                                  src={consonant.image}
                                  alt={`Image for ${consonant.letter}`}
                                />
                              </LetterDiv>
                            ))}
                          </Letters>
                        </LetterTypeDiv>
                      ))}
                    </div>
                  )
                )
              ) : (
                <NotFoundDiv>No Tags available.</NotFoundDiv>
              )
            ) : (
              <NotFoundDiv>Choose the Book.</NotFoundDiv>
            )}
          </Container>
        </CompareItem>
      </CompareContainer>
    </Box>
  );
};

export default Comparison;
