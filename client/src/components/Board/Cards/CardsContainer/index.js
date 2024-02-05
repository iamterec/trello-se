import React, { useEffect, useState } from "react";
import Card from "../Card";
import { Container, Draggable } from "react-smooth-dnd";
import { IoIosAdd } from "react-icons/io";
import { useMutation, useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import PosCalculation from "../../../../utils/pos_calculation";
import sortBy from "lodash/sortBy";

import {
  Wrapper,
  WrappedSection,
  CardContainerHeader,
  ContainerContainerTitle,
  StyledMdDelete,
  CardsContainer,
  AddCardButtonDiv,
  AddCardButtonSpan,
  CardComposerDiv,
  ListCardComponent,
  ListCardDetails,
  ListCardTextArea,
  SubmitCardButtonDiv,
  SubmitCardButton,
  SubmitCardIcon,
} from "./index-styles";

const ADD_CARD = gql`
  mutation InsertCard(
    $sectionId: ID!
    $title: String!
    $label: String!
    $pos: Int!
  ) {
    insertCard(
      request: {
        sectionId: $sectionId
        title: $title
        label: $label
        pos: $pos
      }
    ) {
      title
      label
      id
    }
  }
`;

const onCardAdded = gql`
  subscription {
    cardAdded {
      id
      title
      description
      sectionId
      pos
    }
  }
`;

const UPDATE_CARD = gql`
  mutation UpdateCard($cardId: String!, $pos: Int!, $sectionId: String!) {
    updateCardPos(
      request: { cardId: $cardId, pos: $pos, sectionId: $sectionId }
    ) {
      id
      title
      label
      pos
    }
  }
`;

const DELETE_SECTION = gql`
  mutation DeleteSection($sectionId: String!) {
    deleteSection(request: { sectionId: $sectionId }) {
      id
      title
      label
      pos
    }
  }
`;

const ON_CARD_UPDATE_SUBSCRIPTION = gql`
  subscription {
    onCardPosChange {
      id
      title
      label
      description
      pos
      sectionId
    }
  }
`;

const CardContainer = ({ item, boards, refetchBoard }) => {
  const [cards, setCards] = useState([]);
  const [isTempCardActive, setTempCardActive] = useState(false);
  const [cardText, setCardText] = useState("");

  const [insertCard, { data }] = useMutation(ADD_CARD);

  const [updateCardPos] = useMutation(UPDATE_CARD);
  const [deleteSection] = useMutation(DELETE_SECTION);

  const { data: { cardAdded } = {} } = useSubscription(onCardAdded);

  const { data: { onCardPosChange } = {} } = useSubscription(
    ON_CARD_UPDATE_SUBSCRIPTION
  );

  useEffect(() => {
    if (item && item.cards) {
      setCards(item.cards);
    }
  }, [item]);

  useEffect(() => {
    if (cardAdded) {
      if (item.id === cardAdded.sectionId) {
        setCards(item.cards.concat(cardAdded));

        setTempCardActive(false);
      }
    }
  }, [cardAdded]);

  useEffect(() => {
    if (onCardPosChange) {
      if (item.id === onCardPosChange.sectionId) {
        //subscription logic comes here
      }
    }
  }, [onCardPosChange]);

  const onCardDrop = (columnId, addedIndex, removedIndex, payload) => {
    let updatedPOS;
    if (addedIndex !== null && removedIndex !== null) {
      let boardCards = boards.filter((p) => p.id === columnId)[0];

      updatedPOS = PosCalculation(removedIndex, addedIndex, boardCards.cards);

      let newCards = cards.map((item) => {
        if (item.id === payload.id) {
          return {
            ...item,
            pos: updatedPOS,
          };
        } else {
          return item;
        }
      });
      newCards = sortBy(newCards, (item) => item.pos);

      console.log("newCards", newCards);
      setCards(newCards);

      updateCardPos({
        variables: {
          cardId: payload.id,
          pos: parseInt(updatedPOS),
          sectionId: columnId,
        },
      });
    } else if (addedIndex !== null) {
      const newColumn = boards.filter((p) => p.id === columnId)[0];
      const columnIndex = boards.indexOf(newColumn);

      if (addedIndex === 0) {
        updatedPOS = newColumn.cards[0].pos / 2;
      } else if (addedIndex === newColumn.cards.length) {
        updatedPOS = newColumn.cards[newColumn.cards.length - 1].pos + 16384;
      } else {
        let afterCardPOS = newColumn.cards[addedIndex].pos;
        let beforeCardPOS = newColumn.cards[addedIndex - 1].pos;

        updatedPOS = (afterCardPOS + beforeCardPOS) / 2;
      }

      let newCards = cards.map((item) => {
        if (item.id === payload.id) {
          return {
            ...item,
            pos: updatedPOS,
          };
        } else {
          return item;
        }
      });

      newCards = sortBy(newCards, (item) => item.pos);

      setCards(newCards);

      updateCardPos({
        variables: {
          cardId: payload.id,
          pos: parseInt(updatedPOS),
          sectionId: columnId,
        },
      });
    }
  };

  const onAddButtonClick = () => {
    setTempCardActive(true);
  };

  const onAddCardSubmit = (e) => {
    e.preventDefault();
    if (cardText) {
      console.log("==>", cards[cards.length - 1]);
      insertCard({
        variables: {
          sectionId: item.id,
          title: cardText,
          label: cardText,
          pos:
            cards && cards.length > 0
              ? cards[cards.length - 1].pos + 16348
              : 16348,
        },
      }).then(() => {
        refetchBoard();
        // setCardText("");
      });

      setCardText("");
    }
  };

  return (
    <Draggable key={item.id}>
      <Wrapper className={"card-container"}>
        <WrappedSection>
          <CardContainerHeader className={"column-drag-handle"}>
            <ContainerContainerTitle>{item.title}</ContainerContainerTitle>
            <StyledMdDelete
              size={18}
              onClick={() => {
                deleteSection({
                  variables: {
                    sectionId: item.id,
                  },
                }).then(() => {
                  refetchBoard();
                });
              }}
            />
          </CardContainerHeader>
          <CardsContainer>
            <Container
              orientation={"vertical"}
              groupName="col"
              onDrop={(e) => {
                console.log("card", e);
                onCardDrop(item.id, e.addedIndex, e.removedIndex, e.payload);
              }}
              dragClass="card-ghost"
              dropClass="card-ghost-drop"
              onDragEnter={() => {
                // console.log("drag enter:", item.id);
              }}
              getChildPayload={(index) => {
                return cards[index];
              }}
              onDragLeave={() => {
                // console.log("drag leave:", item.id);
              }}
              // onDropReady={(p) => console.log("Drop ready: ", p)}
              dropPlaceholder={{
                animationDuration: 150,
                showOnTop: true,
                className: "drop-preview",
              }}
              dropPlaceholderAnimationDuration={200}
            >
              {cards.map((card) => (
                <Card key={card.id} card={card} />
              ))}
            </Container>
            {isTempCardActive ? (
              <CardComposerDiv>
                <ListCardComponent>
                  <ListCardDetails>
                    <ListCardTextArea
                      placeholder="Enter a title for the card"
                      value={cardText} 
                      autoFocus
                      onChange={(e) => {
                        setCardText(e.target.value);
                      }}
                    />
                  </ListCardDetails>
                </ListCardComponent>
                <SubmitCardButtonDiv>
                  <SubmitCardButton onClick={onAddCardSubmit}>
                    <IoIosAdd size={32} />
                    <span>Add Card</span>
                  </SubmitCardButton>
                </SubmitCardButtonDiv>
              </CardComposerDiv>
            ) : (
              <AddCardButtonDiv onClick={onAddButtonClick}>
                <AddCardButtonSpan>Add new card</AddCardButtonSpan>
              </AddCardButtonDiv>
            )}
          </CardsContainer>
        </WrappedSection>
      </Wrapper>
    </Draggable>
  );
};

export default CardContainer;
