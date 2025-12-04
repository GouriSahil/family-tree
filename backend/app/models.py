from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class FamilyMember(Base):
    __tablename__ = 'family_members'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    photo = Column(String, nullable=True)
    gender = Column(String, nullable=False)

    