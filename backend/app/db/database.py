from supabase import create_client, Client
from app.core.config import settings
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Supabase client with error handling
supabase: Client = None

def initialize_supabase():
    """Initialize Supabase client with proper error handling"""
    global supabase
    try:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided")
        
        if settings.SUPABASE_SERVICE_ROLE_KEY.endswith("..."):
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY appears to be truncated. Please provide the complete key.")
        
        supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        logger.info("Supabase client initialized successfully")
        return supabase
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise

def get_supabase_client() -> Client:
    """Dependency to get Supabase client"""
    global supabase
    if supabase is None:
        supabase = initialize_supabase()
    return supabase

def get_db():
    """Dependency to get database session (for backward compatibility)"""
    # Return the Supabase client instead of SQLAlchemy session
    return get_supabase_client()

# For any SQLAlchemy compatibility needs, keep these imports available
# but use Supabase as the primary database interface
try:
    from sqlalchemy import create_engine
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker
    
    # Only create SQLAlchemy engine if needed for specific use cases
    Base = declarative_base()
    
    # Optional SQLAlchemy setup (if needed for specific operations)
    def get_sqlalchemy_engine():
        """Create SQLAlchemy engine if needed for direct PostgreSQL access"""
        if hasattr(settings, 'SQLALCHEMY_DATABASE_URI') and settings.SQLALCHEMY_DATABASE_URI:
            return create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
        else:
            logger.warning("SQLAlchemy not configured, using Supabase client instead")
            return None
            
except ImportError:
    logger.info("SQLAlchemy not available, using Supabase client only")
    Base = None
