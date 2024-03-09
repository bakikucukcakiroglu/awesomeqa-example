import sys
import logging

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
# Configure logging


# Create a logger for your application
logger = logging.getLogger(__name__)


logging.info("Starting the application")
