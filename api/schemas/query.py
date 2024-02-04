from graphene import ObjectType, String, Int, Schema, Field, List, Mutation, InputObjectType
from graphene import relay
from .object_types import Section

class Query(ObjectType):
    node = relay.Node.Field()
    fetch_sections = Field(List(Section))

    def resolve_fetch_sections(self, info):
        query = Section.get_query(info)  # SQLAlchemy query
        return query.all()
