from models import SectionModel, CardModel, db_session
from graphene import ObjectType, String, Int, Schema, Field, List, Mutation, InputObjectType
from graphene_sqlalchemy import SQLAlchemyObjectType

subscriptions = {"section_added": []}


class SubscriptionsData:

    def __init__(self):
        self.data = {"section_added": []}

    def __getitem__(self, key):
        print('getting key'.center(70, '_'), key, '_' * 70, sep='\n')
        return self.data[key]

    def __setitem__(self, key, item1):
        print('setting item1'.center(70, '_'), item1, '_' * 70, sep='\n')
        self.data[key] = item1


subscriptions = SubscriptionsData()


class Section(SQLAlchemyObjectType):

    class Meta:
        model = SectionModel


class Card(SQLAlchemyObjectType):

    class Meta:
        model = CardModel
