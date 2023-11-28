import React, { useEffect, useState } from "react";
import { Icon } from "@adminjs/design-system";
import axios from "axios";
import { useLetterTagContext } from "../../context/LetterTagContext.js";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  StyleSheet,
  View,
  Image,
  Font,
} from "@react-pdf/renderer";

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

const PdfGenerator = ({ bookId, bookName, publisher, year, language }) => {
  const BASE_URL = (window as any).AdminJS.env.BASE_URL;
  const [letterType, setLetterType] = useState<ILetterType[]>();
  const { tags, fetchTag } = useLetterTagContext();
  const [languageOptions, setLanguageOptions] = useState<ILanguage[]>();
  const [pdfData, setPdfData] = useState<IData[]>();
  const [value, setValue] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/get-lettertypes`).then((response) => {
      setLetterType(response.data);
    });
    axios.get(`${BASE_URL}/get-languages`).then((response) => {
      setLanguageOptions(response.data);
    });
    if (value == false) {
      fetchTag(bookId).then(() => {
        handleDownloadClick();
      });
      setValue(true);
    }
    if (value == true) {
      handleDownloadClick();
    }
  }, [tags]);

  const handleDownloadClick = () => {
    const letterIdMap: Record<string, boolean> = {};

    const mergedData: IData[] = tags.taggedLetters
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

    setPdfData(mergedData);
  };
  const bookLanguage = languageOptions?.find(
    (item) => item.language_code === language
  );

  return (
    <div>
      <PDFDownloadLink
        document={
          <PDFDocument
            data={pdfData}
            bookName={bookName}
            publisher={publisher}
            year={year}
            language={bookLanguage?.language}
          />
        }
        fileName={`${bookName}.pdf`}
      >
        {({ loading }) =>
          loading ? (
            "Loading..."
          ) : (
            <Icon
              icon="Download"
              size={20}
              style={{
                lineHeight: "0px",
              }}
            />
          )
        }
      </PDFDownloadLink>
    </div>
  );
};

export default PdfGenerator;

Font.register({
  family: "Baloo",
  src: "/fonts/Baloo-kannada.ttf",
});

Font.register({
  family: "Noto Sans",
  src: "/fonts/NotoSans-Regular.ttf",
});

Font.register({
  family: "Roboto",
  src: "/fonts/Roboto-Regular.ttf",
});

const styles = StyleSheet.create({
  section: {
    width: "96%",
    margin: "20px auto",
  },

  table: {
    width: "100%",
    marginTop: "15px",
    paddingLeft: "15px",
    paddingRight: "15px",
  },
  body: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    paddingLeft: "20px",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  lettertext: {
    textAlign: "center",
    fontFamily: "Baloo",
  },
  image: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    textAlign: "center",
    margin: "auto",
  },
  bookDetails: {
    textAlign: "left",
  },
  tagsHeading: {
    color: "#000",
    margin: "auto",
  },
  languagediv: {
    marginTop: "15px",
  },
  languageHeading: {
    fontWeight: 900,
    fontSize: "20px",
  },
  imageDiv: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    border: "1px solid #BCBEC0",
    alignItems: "center",
    padding: "8px",
  },
  letterStyle: {
    textAlign: "center",
    paddingTop: "5px",
    paddingBottom: "5px",
  },
  letterTypeStyle: {
    fontWeight: 400,
  },
});

const PDFDocument = ({ data, bookName, publisher, year, language }) => {
  const organizedData: Record<
    string,
    Record<string, { letter: string; image: string }[]>
  > = {};

  if (data) {
    data.forEach((item) => {
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

  return (
    <Document>
      <Page size="A4">
        <View style={styles.section}>
          <View style={styles.bookDetails}>
            <Text>
              Book Name: <Text style={styles.lettertext}>{bookName}</Text>
            </Text>
            {publisher && (
              <Text>
                Publisher Name:{" "}
                <Text style={styles.lettertext}>{publisher}</Text>
              </Text>
            )}
            {publisher && (
              <Text>
                Published Year: <Text>{year}</Text>
              </Text>
            )}
            {publisher && (
              <Text>
                Book Language: <Text style={styles.lettertext}>{language}</Text>
              </Text>
            )}
          </View>
          <Text style={styles.tagsHeading}>Tags</Text>
          {Object.entries(organizedData).map(([language, types]) => (
            <View key={language} style={styles.languagediv}>
              <Text style={styles.languageHeading}>Language: {language}</Text>
              <View style={styles.table}>
                {Object.entries(types).map(([type, items]) => (
                  <div key={type}>
                    <Text style={styles.letterTypeStyle}>{type}</Text>
                    <View style={styles.body}>
                      {items.map((record, index) => (
                        <View key={index} style={styles.imageDiv}>
                          <View>
                            <Text style={styles.lettertext}>
                              {record.letter}
                            </Text>
                          </View>
                          <Image src={record.image} style={styles.image} />
                        </View>
                      ))}
                    </View>
                  </div>
                ))}
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
