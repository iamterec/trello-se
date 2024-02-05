import React, { useState, useEffect } from "react";
import CardContainer from "./Cards/CardsContainer";
import { Container } from "react-smooth-dnd";
import { IoIosAdd } from "react-icons/io";
import sortBy from "lodash/sortBy";
import { useMutation, useSubscription, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import PosCalculation from "../../utils/pos_calculation";
import {
  BoardContainer,
  CardHorizontalContainer,
  AddSectionDiv,
  AddSectionForm,
  AddSectionContainer,
  AddSectionText,
  AddSectionLinkIconSpan,
  AddSectionInput,
  ActiveAddSectionInput,
  SubmitCardButtonDiv,
  SubmitCardButton,
  SubmitCardIcon,
} from "./board.styles";

const BOARD_QUERY = gql`
  query {
    fetchSections {
      id
      title
      label
      pos
      description
      cards {
        id
        title
        label
        description
        pos
      }
    }
  }
`;

const BOARD_SUBSCRIPTION = gql`
  subscription {
    sectionAdded {
      id
      title
      label
      description
      pos
      cards {
        id
        title
        label
        pos
        description
      }
    }
  }
`;

const ADD_SECTION = gql`
  mutation AddSection($title: String!, $label: String!, $pos: Int!) {
    insertSection(request: { title: $title, label: $label, pos: $pos }) {
      title
      description
      id
      label
    }
  }
`;

const UPDATE_SECTION_POS = gql`
  mutation UpdateSection($sectionId: String!, $pos: Int!) {
    updateSectionPos(request: { sectionId: $sectionId, pos: $pos }) {
      id
      pos
    }
  }
`;

const ON_SECTION_POS_CHANGES = gql`
  subscription {
    onSectionPosChange {
      id
      pos
    }
  }
`;

// const REORDER_SECTION = gql``;

const Board = () => {
  const [isAddSectionInputActive, setAddSectionInputActive] = useState(false);

  const [addSectionInpuText, setAddSectionInputText] = useState("");
  const [boards, setBoards] = useState([]);
  const [AddSection, { insertSection }] = useMutation(ADD_SECTION);

  const { loading, error, data, refetch } = useQuery(BOARD_QUERY);

  const [updateSectionPos] = useMutation(UPDATE_SECTION_POS);

  useEffect(() => {
    if (data) {
      setBoards(data.fetchSections);
    }
  }, [data]);

  const { data: { sectionAdded } = {} } = useSubscription(BOARD_SUBSCRIPTION);

  const { data: { onSectionPosChange } = {} } = useSubscription(
    ON_SECTION_POS_CHANGES
  );

  useEffect(() => {
    if (onSectionPosChange) {
      console.log("onSectionPosChange", onSectionPosChange);
      let newBoards = boards;

      newBoards = newBoards.map((board) => {
        if (board.id === onSectionPosChange.id) {
          return { ...board, pos: onSectionPosChange.pos };
        } else {
          return board;
        }
      });
      let sortedBoards = sortBy(newBoards, [
        (board) => {
          return board.pos;
        },
      ]);
      console.log("useEffect", sortedBoards);
      setBoards(sortedBoards);
    }
  }, [onSectionPosChange]);

  useEffect(() => {
    if (sectionAdded) {
      setBoards(boards.concat(sectionAdded));
    }
  }, [sectionAdded]);

  const onColumnDrop = ({ removedIndex, addedIndex, payload }) => {
    if (data) {
      let updatePOS = PosCalculation(
        removedIndex,
        addedIndex,
        data.fetchSections
      );
      let newBoards = boards.map((board) => {
        if (board.id === payload.id) {
          return { ...board, pos: updatePOS };
        } else {
          return board;
        }
      });

      let sortedBoards = sortBy(newBoards, [
        (board) => {
          return board.pos;
        },
      ]);

      updateSectionPos({
        variables: {
          sectionId: payload.id,
          pos: parseInt(updatePOS),
        },
      });
      setBoards([...sortedBoards]);
    }
  };

  const onAddSectionSubmit = () => {
    if (addSectionInpuText) {
      AddSection({
        variables: {
          title: addSectionInpuText,
          label: addSectionInpuText,
          pos:
            boards && boards.length > 0
              ? boards[boards.length - 1].pos + 16384
              : 16384,
        },
      }).then(() => {
        refetch();
      });
    }
  };

  return (
    <BoardContainer>
      <Container
        orientation={"horizontal"}
        onDrop={onColumnDrop}
        onDragStart={() => {
          console.log("on drag start");
        }}
        getChildPayload={(index) => {
          return boards[index];
        }}
        dragHandleSelector=".column-drag-handle"
        dropPlaceholder={{
          animationDuration: 150,
          showOnTop: true,
          className: "cards-drop-preview",
        }}
      >
        {boards.length > 0 &&
          boards.map((item, index) => (
            <CardContainer
              item={item}
              key={index}
              boards={boards}
              refetchBoard={refetch}
            />
          ))}
      </Container>
      <AddSectionDiv onClick={() => setAddSectionInputActive(true)}>
        {isAddSectionInputActive ? (
          <AddSectionForm>
            <React.Fragment>
              <ActiveAddSectionInput
                autoFocus
                onChange={(e) => setAddSectionInputText(e.target.value)}
              />
              <SubmitCardButtonDiv>
                <SubmitCardButton onClick={onAddSectionSubmit}>
                  <IoIosAdd size={32} />
                  <span>Add section</span>
                </SubmitCardButton>
              </SubmitCardButtonDiv>
            </React.Fragment>
          </AddSectionForm>
        ) : (
          <React.Fragment>
            <AddSectionContainer>
              <IoIosAdd size={28} />
              <AddSectionText>Add a new section</AddSectionText>
            </AddSectionContainer>
          </React.Fragment>
        )}
      </AddSectionDiv>
    </BoardContainer>
  );
};

export default Board;
