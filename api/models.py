import os
from sqlalchemy import create_engine, String, Integer, Column, ForeignKey
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.orm import relationship, declarative_base

SQLALCHEMY_DATABASE_URL = os.getenv("POSTGRES_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=True,
                                         bind=engine))
Base = declarative_base()



# We will need this for querying, Graphene extracts the session from the base.
# Alternatively it can be provided in the GraphQLResolveInfo.context dictionary under context["session"]


class SectionModel(Base):
    __tablename__ = 'sections'
    id = Column(Integer(), autoincrement=True, primary_key=True)
    title = Column(String(), nullable=True)
    label = Column(String())
    description = Column(String())
    pos = Column(Integer())
    cards = relationship("CardModel", backref='section', cascade="all,delete-orphan")


class CardModel(Base):
    __tablename__ = 'cards'

    id = Column(Integer(), autoincrement=True, primary_key=True)
    title = Column(String(), nullable=False)
    label = Column(String())
    description = Column(String())
    pos = Column(Integer())
    section_id = Column(Integer, ForeignKey('sections.id'))

    # user = relationship('User', backref='chats')


Base.query = db_session.query_property()
Base.metadata.create_all(bind=engine)
