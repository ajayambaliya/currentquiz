import os
import requests
import time
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

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

    def _create_and_publish(self, image_url: str, caption: str) -> bool:
        """Post a single image to Instagram (matches user's tested working code exactly)."""
        # Step 1: Create media container
        logger.info("[Instagram] Creating media container...")
        create_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media"
        payload = {
            "image_url": image_url,
            "caption": caption,
            "access_token": self.access_token
        }
        
        response = requests.post(create_url, json=payload)
        logger.info(f"[Instagram] Create response: {response.status_code}")
        if response.status_code != 200:
            logger.error(f"[Instagram] Error creating container: {response.text}")
            return False
            
        response_data = response.json()
        if "id" not in response_data:
            logger.error(f"[Instagram] No ID in response: {response_data}")
            return False
            
        container_id = response_data["id"]
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
        
        publish_response = requests.post(publish_url, json=publish_payload)
        logger.info(f"[Instagram] Publish response: {publish_response.status_code}")
        if publish_response.status_code != 200:
            logger.error(f"[Instagram] Error publishing: {publish_response.text}")
            return False
            
        publish_data = publish_response.json()
        if "id" in publish_data:
            logger.info(f"✅ [Instagram] Posted! Media ID: {publish_data['id']}")
            return True
        else:
            logger.error(f"[Instagram] Publish failed: {publish_data}")
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
        
        # 1. Upload all images to Imgur and create item containers
        item_ids = []
        for i, img_path in enumerate(image_paths):
            # Upload to Imgur
            img_url = self._upload_to_imgur(img_path)
            if not img_url:
                logger.error(f"[Instagram] Failed to upload image {i+1}. Aborting carousel.")
                return False
            
            time.sleep(2)
                
            # Create carousel item container
            create_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media"
            payload = {
                "image_url": img_url,
                "is_carousel_item": True,
                "access_token": self.access_token
            }
            resp = requests.post(create_url, json=payload)
            logger.info(f"[Instagram] Item {i+1} container response: {resp.status_code}")
            
            if resp.status_code == 200 and "id" in resp.json():
                item_ids.append(resp.json()["id"])
                logger.info(f"[Instagram] ✅ Item {i+1} container: {resp.json()['id']}")
            else:
                logger.error(f"[Instagram] ❌ Failed item {i+1}: {resp.text}")
                return False
            
            time.sleep(3)
                
        # 2. Create carousel container
        logger.info(f"[Instagram] Waiting 10s for {len(item_ids)} items to process...")
        time.sleep(10)
        
        logger.info("[Instagram] Creating carousel container...")
        create_carousel_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media"
        carousel_payload = {
            "media_type": "CAROUSEL",
            "children": item_ids,
            "caption": caption,
            "access_token": self.access_token
        }
        resp = requests.post(create_carousel_url, json=carousel_payload)
        logger.info(f"[Instagram] Carousel container response: {resp.status_code}")
        
        if resp.status_code != 200:
            logger.error(f"[Instagram] ❌ Failed carousel container: {resp.text}")
            return False
        
        resp_data = resp.json()
        if "id" not in resp_data:
            logger.error(f"[Instagram] No ID in carousel response: {resp_data}")
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
        res = requests.post(publish_url, json=publish_payload)
        logger.info(f"[Instagram] Publish response: {res.status_code}")
        
        if res.status_code == 200 and "id" in res.json():
            logger.info(f"✅ [Instagram] Carousel published! Media ID: {res.json()['id']}")
            return True
        else:
            logger.error(f"[Instagram] ❌ Failed to publish: {res.text}")
            return False
