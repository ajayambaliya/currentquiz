import os
import requests
import time
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

# Retry configuration
MAX_RETRIES = 3
INITIAL_BACKOFF_SECONDS = 10  # start with 10s, then 20s, then 40s


class InstagramSender:
    """Handles automated posting to Instagram Graph API."""
    def __init__(self, access_token: str = None, user_id: str = None):
        self.access_token = access_token or os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
        self.user_id = user_id or os.getenv("INSTAGRAM_USER_ID", "")
        
        # Debug: Log whether credentials were found
        if self.access_token:
            logger.info(f"[Instagram] Access token loaded (length: {len(self.access_token)}, starts with: {self.access_token[:10]}...)")
        else:
            logger.warning("[Instagram] ⚠️ INSTAGRAM_ACCESS_TOKEN is EMPTY or NOT SET")
            
        if self.user_id:
            logger.info(f"[Instagram] User ID loaded: {self.user_id}")
        else:
            logger.warning("[Instagram] ⚠️ INSTAGRAM_USER_ID is EMPTY or NOT SET")
        
    def is_configured(self) -> bool:
        """Check if Instagram credentials exist."""
        configured = bool(self.access_token and self.user_id)
        if not configured:
            logger.warning(f"[Instagram] is_configured = False (token={bool(self.access_token)}, user_id={bool(self.user_id)})")
        return configured

    def _upload_to_imgur(self, image_path: str) -> Optional[str]:
        """Uploads a local image to Imgur to get a public URL for Instagram."""
        try:
            logger.info(f"[Imgur] Uploading {image_path} ({os.path.getsize(image_path)} bytes)...")
            headers = {"Authorization": "Client-ID 546c25a59c58ad7"}
            with open(image_path, "rb") as file:
                response = requests.post(
                    "https://api.imgur.com/3/image",
                    headers=headers,
                    files={"image": file},
                    timeout=60
                )
            if response.status_code == 200:
                data = response.json()
                url = data["data"]["link"]
                logger.info(f"[Imgur] ✅ Uploaded: {url}")
                return url
            else:
                logger.error(f"[Imgur] ❌ Failed (status {response.status_code}): {response.text[:300]}")
                return None
        except Exception as e:
            logger.error(f"[Imgur] ❌ Error: {e}")
            return None

    def _post_with_retry(self, url: str, payload: dict, description: str) -> Optional[dict]:
        """
        POST to Instagram Graph API with retry logic for transient errors.
        Uses form-encoded data (not JSON) as required by the Meta Graph API.
        
        Returns the parsed JSON response on success, or None on failure.
        """
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = requests.post(url, data=payload, timeout=60)
                logger.info(f"[Instagram] {description} response: {response.status_code} (attempt {attempt}/{MAX_RETRIES})")
                
                if response.status_code == 200:
                    resp_data = response.json()
                    if "id" in resp_data:
                        return resp_data
                    else:
                        logger.error(f"[Instagram] No 'id' in response for {description}: {resp_data}")
                        return None
                
                # Check if error is transient and we should retry
                try:
                    error_data = response.json()
                    error_info = error_data.get("error", {})
                    is_transient = error_info.get("is_transient", False)
                    error_code = error_info.get("code", -1)
                except Exception:
                    is_transient = False
                    error_code = -1
                
                if is_transient and attempt < MAX_RETRIES:
                    backoff = INITIAL_BACKOFF_SECONDS * (2 ** (attempt - 1))
                    logger.warning(
                        f"[Instagram] ⚠️ Transient error (code {error_code}) for {description}. "
                        f"Retrying in {backoff}s... (attempt {attempt}/{MAX_RETRIES})"
                    )
                    logger.warning(f"[Instagram]   Error detail: {response.text[:500]}")
                    time.sleep(backoff)
                    continue
                
                # Non-transient error or last attempt
                logger.error(f"[Instagram] ❌ Failed {description}: {response.text[:500]}")
                return None
                
            except requests.exceptions.Timeout:
                if attempt < MAX_RETRIES:
                    backoff = INITIAL_BACKOFF_SECONDS * (2 ** (attempt - 1))
                    logger.warning(f"[Instagram] ⚠️ Timeout for {description}. Retrying in {backoff}s...")
                    time.sleep(backoff)
                    continue
                logger.error(f"[Instagram] ❌ Timeout after {MAX_RETRIES} attempts for {description}")
                return None
            except Exception as e:
                logger.error(f"[Instagram] ❌ Unexpected error for {description}: {e}")
                return None
        
        return None

    def _create_and_publish(self, image_url: str, caption: str) -> bool:
        """Post a single image to Instagram."""
        # Step 1: Create media container
        logger.info("[Instagram] Creating media container...")
        create_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media"
        payload = {
            "image_url": image_url,
            "caption": caption,
            "access_token": self.access_token
        }
        
        resp_data = self._post_with_retry(create_url, payload, "Create single media container")
        if not resp_data:
            return False
            
        container_id = resp_data["id"]
        logger.info(f"[Instagram] Container created: {container_id}")
        
        # Wait for Instagram to process
        logger.info("[Instagram] Waiting 5s for processing...")
        time.sleep(5)
        
        # Step 2: Publish
        logger.info("[Instagram] Publishing...")
        publish_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media_publish"
        publish_payload = {
            "creation_id": container_id,
            "access_token": self.access_token
        }
        
        publish_data = self._post_with_retry(publish_url, publish_payload, "Publish single media")
        if publish_data:
            logger.info(f"✅ [Instagram] Posted! Media ID: {publish_data['id']}")
            return True
        return False

    def post_image(self, image_path: str, caption: str) -> bool:
        """Post a single local image to Instagram."""
        if not self.is_configured():
            return False
            
        image_url = self._upload_to_imgur(image_path)
        if not image_url:
            return False
            
        return self._create_and_publish(image_url, caption)
            
    def post_carousel(self, image_paths: List[str], caption: str) -> bool:
        """Post up to 10 images as an Instagram Carousel."""
        if not self.is_configured():
            return False
            
        image_paths = image_paths[:10]
        logger.info(f"[Instagram] Starting Carousel with {len(image_paths)} images...")
        
        # 1. Upload all images to Imgur first, then create item containers
        item_ids = []
        for i, img_path in enumerate(image_paths):
            # Upload to Imgur
            img_url = self._upload_to_imgur(img_path)
            if not img_url:
                logger.error(f"[Instagram] Failed to upload image {i+1}. Aborting carousel.")
                return False
            
            time.sleep(2)
                
            # Create carousel item container (form-encoded, is_carousel_item as string "true")
            create_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media"
            payload = {
                "image_url": img_url,
                "is_carousel_item": "true",
                "access_token": self.access_token
            }
            
            resp_data = self._post_with_retry(create_url, payload, f"Item {i+1} container")
            if resp_data:
                item_ids.append(resp_data["id"])
                logger.info(f"[Instagram] ✅ Item {i+1} container: {resp_data['id']}")
            else:
                logger.error(f"[Instagram] ❌ Failed item {i+1} after retries. Aborting carousel.")
                return False
            
            time.sleep(3)
                
        # 2. Create carousel container
        logger.info(f"[Instagram] Waiting 10s for {len(item_ids)} items to process...")
        time.sleep(10)
        
        logger.info("[Instagram] Creating carousel container...")
        create_carousel_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media"
        
        # The children parameter must be a comma-separated string of IDs for form-encoded data
        carousel_payload = {
            "media_type": "CAROUSEL",
            "children": ",".join(item_ids),
            "caption": caption,
            "access_token": self.access_token
        }
        
        resp_data = self._post_with_retry(create_carousel_url, carousel_payload, "Carousel container")
        if not resp_data:
            return False
            
        carousel_id = resp_data["id"]
        logger.info(f"[Instagram] ✅ Carousel container: {carousel_id}")
        
        # 3. Publish carousel
        logger.info("[Instagram] Waiting 5s before publish...")
        time.sleep(5)
        
        publish_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media_publish"
        publish_payload = {
            "creation_id": carousel_id,
            "access_token": self.access_token
        }
        
        publish_data = self._post_with_retry(publish_url, publish_payload, "Publish carousel")
        if publish_data:
            logger.info(f"✅ [Instagram] Carousel published! Media ID: {publish_data['id']}")
            return True
        return False
