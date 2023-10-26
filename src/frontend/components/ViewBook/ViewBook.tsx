import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import { TaggedLetters } from "../../../backend/db/models/TaggedLetters";
import Axios from "axios";
import { config } from '../../config';

const Content = styled.div`
  display: flex;
  justify-content: space-between;
`;

const LeftSide = styled.div`
  flex: 2;
  width: 80%;
`;

const RightSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column; 
  background: #fff;
  box-shadow: 0px 2px 2px 1px #ccc;
  margin-left: 34px;
  width: 150px; 
`;

const MenuItems = styled.div`
  display: flex;
  flex-direction: row; 
  gap: 10px;
  padding: 1px 8px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
`;

const MenuItem = styled.a`
  text-decoration: none;
  color: #333;
  padding: 10px;
  border: 1px solid transparent;
  margin-bottom: 10px;
  transition: background-color 0.2s, color 0.2s;

  /* Hover styles */
  &:hover {
    border-bottom: 2px solid #3747d7;
  }
  &.active {
    border-bottom: 2px solid #3747d7;
  }
`;

const TabContent = styled.div`
  display: none;
`;

const AccordionItem = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  padding: 10px;
  border-bottom: 1px solid #ccc;
`;

const AccordionArrow = styled.div`
  font-size: 24px; 
  line-height: 1;
`;

const AccordionContent = styled.div`
  display: block;
  &.inactive {
    display: none;
  }
`;

const AccordionContentUI = styled.ul`
  background: #eee;
  display: grid;
  grid-template-columns: repeat(4, 1fr); 
  gap: 20px;
  font-size: 14px;
  background: #eee;
  padding: 20px;
`;

const AccordionContentList = styled.li`
  background: #007bff;
  padding: 10px;
  color: #fff;
  text-align:center
`;

interface ViewBookProps {
  record: {
    params: {
      id: string;
      url: string;
    };
  };
}

const ViewBook: React.FC<ViewBookProps> = ({ record }) => {

  const initialAccordionState = [
    {
      id: "1",
      title: "Vowels",
      expanded: false,
      lettertype: 1,
    },
    {
      id: "2",
      title: "Consonants",
      expanded: false,
      lettertype: 2,
    },
    {
      id: "3",
      title: "Numerals",
      expanded: false,
      lettertype: 3,
    },
  ];

  const url = record.params.url;
  const book_id = record.params.id;
  const [activeTab, setActiveTab] = useState("recent");
  const [taggedLetters, setTaggedLetters] = useState([]);
  const [recentTaggedLetters, setRecentTaggedLetters] = useState([]);

  const [accordionStates, setAccordionStates] = useState(initialAccordionState);

  const handleAccordionClick = (accordionId) => {
    const updatedAccordionStates = accordionStates.map((state) =>
      state.id === accordionId ? { ...state, expanded: !state.expanded } : state
    );
    setAccordionStates(updatedAccordionStates);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  //Get last 20 days date
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 20);

  //Get the TaggedLetters
  useEffect(() => {
    const fetchTaggedLetters = async () => {
      try {
        const response = await Axios.get(
          `http://localhost:8000/admin/tagged-letter?bookId=` + book_id
        );
        if (response.data) {
          const recentDate = response.data.filter((recentItem: TaggedLetters) => {
            const taggedDate = new Date(recentItem.updated_at);
            return taggedDate >= currentDate;
          })
          setRecentTaggedLetters(recentDate);
          setTaggedLetters(response.data);
        }
      } catch (error) {
        console.error("Error fetching tagged letters:", error);
      }
    };
    fetchTaggedLetters();
  }, [book_id]);


  return (
    <Content>
      <LeftSide>
        <iframe
          src={url}
          width="100%"
          height="500"
          allowFullScreen={true}
        ></iframe>
      </LeftSide>
      <RightSide>
        <MenuItems>
          <MenuItem
            className={activeTab === "recent" ? "active" : ""}
            onClick={() => handleTabClick("recent")}>
            Recent
          </MenuItem>
          <MenuItem
            className={activeTab === "all" ? "active" : ""}
            onClick={() => handleTabClick("all")}>
            All
          </MenuItem>
        </MenuItems>

        {/* Recent Tagged Letters */}
        <TabContent
          style={{ display: activeTab === "recent" ? "block" : "none" }}
          id="recent"
          className="tabcontent">
          <div>
            {taggedLetters.length === 0 ? (
              <p style={{ padding: "20px" }}>No data available</p>
            ) : (
              <AccordionContentUI style={{ background: "none" }}>
                {recentTaggedLetters.map((taggedLetter: TaggedLetters) => (
                  <AccordionContentList >
                    {taggedLetter.letter.letter}
                  </AccordionContentList>
                ))}
              </AccordionContentUI>
            )}
          </div>
        </TabContent>

        {/* All Tagged Letters */}
        <TabContent
          style={{ display: activeTab === "all" ? "block" : "none" }}
          id="all"
          className="tabcontent">
          {accordionStates.map((accordion) => (
            <div key={accordion.id}>
              <AccordionItem onClick={() => handleAccordionClick(accordion.id)}>
                <span>{accordion.title}</span>
                <AccordionArrow>
                  {accordion.expanded ? "-" : "+"}
                </AccordionArrow>
              </AccordionItem>
              <AccordionContent
                className={accordion.expanded ? "active" : "inactive"}>
                {taggedLetters.filter(
                  (taggedLetter: TaggedLetters) =>
                    taggedLetter.letter.letterType === accordion.lettertype
                ).length === 0 ? (
                  <p style={{ background: "#eee", padding: "20px" }}>No data available</p>
                ) : (
                  <AccordionContentUI>
                    {taggedLetters
                      .filter(
                        (taggedLetter: TaggedLetters) =>
                          taggedLetter.letter.letterType ===
                          accordion.lettertype
                      )
                      .map((taggedLetter: TaggedLetters) => (
                        <AccordionContentList>
                          {taggedLetter.letter.letter}
                        </AccordionContentList>
                      ))}
                  </AccordionContentUI>
                )}
              </AccordionContent>
            </div>
          ))}
        </TabContent>
      </RightSide>
    </Content>
  );
};

export default ViewBook;
