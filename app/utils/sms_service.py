import os
import logging
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

logger = logging.getLogger(__name__)

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

def send_sms(to_phone: str, message: str):
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_PHONE_NUMBER:
        logger.warning(f"Twilio credentials not configured. Skipping SMS to {to_phone}.")
        return

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        logger.info(f"SMS sent successfully to {to_phone}. SID: {message.sid}")
    except TwilioRestException as e:
        logger.error(f"Failed to send SMS to {to_phone}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error sending SMS to {to_phone}: {e}")
