import graphene
from graphene import ObjectType, String, Int, Schema, Field, List, InputObjectType, ID
from models import SectionModel, CardModel, db_session
from .object_types import Section, Card, subscriptions


class CreateSectionInput(InputObjectType):
    title = String()
    label = String()
    pos = Int()


class CreateCardInput(InputObjectType):
    section_id = ID()
    title = String()
    label = String()
    pos = Int()


class UpdateSectionPosInput(InputObjectType):
    section_id = String()
    pos = Int()


class UpdateCardPosInput(InputObjectType):
    card_id = String()
    section_id = String()
    pos = Int()


class DeleteSectionInput(InputObjectType):
    section_id = String()


class CreateSection(graphene.Mutation):

    class Arguments:
        request = CreateSectionInput(required=True)

    Output = Section

    def mutate(self, info, request):
        new_section = SectionModel(**request)
        db_session.add(new_section)
        db_session.commit()
        print('new_section'.center(70, '_'), new_section, '_' * 70, sep='\n')
        subscriptions["section_added"].append(new_section)
        return new_section


class UpdateSectionPos(graphene.Mutation):

    class Arguments:
        request = UpdateSectionPosInput(required=True)

    Output = Section

    def mutate(self, info, request):
        section = SectionModel.query.get(request["section_id"])
        section.pos = request["pos"]
        db_session.add(section)
        db_session.commit()
        return section


class UpdateCardPos(graphene.Mutation):

    class Arguments:
        request = UpdateCardPosInput(required=True)

    Output = Card

    def mutate(self, info, request):
        card = CardModel.query.get(request["card_id"])
        card.pos = request["pos"]
        card.section_id = request["section_id"]
        db_session.add(card)
        db_session.commit()
        return card


class CreateCard(graphene.Mutation):

    class Arguments:
        request = CreateCardInput(required=True)

    Output = Card

    def mutate(self, info, request):
        new_card = CardModel(**request)
        db_session.add(new_card)
        db_session.commit()
        return new_card


class DeleteSection(graphene.Mutation):

    class Arguments:
        request = DeleteSectionInput(required=True)

    Output = Section

    def mutate(self, info, request):
        section = SectionModel.query.get(request["section_id"])
        db_session.delete(section)
        db_session.commit()
        return section


class Mutation(ObjectType):
    insert_section = CreateSection.Field()
    insert_card = CreateCard.Field()
    update_section_pos = UpdateSectionPos.Field()
    update_card_pos = UpdateCardPos.Field()
    delete_section = DeleteSection.Field()
