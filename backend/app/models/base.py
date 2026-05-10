from datetime import datetime, UTC
from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Oracle traditionally uses UPPERCASE for table/column names
# but we'll use lowercase here as it's common in SQLAlchemy 
# and can be mapped correctly.
metadata_obj = MetaData()

class Base(DeclarativeBase):
    metadata = metadata_obj
    
    # Common fields could go here if needed
