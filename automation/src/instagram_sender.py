import os
import requests
import time
import sys
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

class InstagramSender:
    """Handles automated posting to Instagram Graph API."""
    def __init__(self, access_token: str = None, user_id: str = None):
        self.access_token = access_token or os.getenv("INSTAGRAM_ACCESS_TOKEN")
        self.user_id = user_id or os.getenv("INSTAGRAM_USER_ID")
        
    def is_configured(self) -> bool:
        """Check if Instagram credentials exist."""
        return bool(self.access_token and self.user_id)

    def _upload_to_imgur(self, image_path: str) -> Optional[str]:
        """Uploads a local image to Imgur to get a public URL for Instagram."""
        try:
            # Anonymous Imgur Client-ID to get a quick public URL without auth overhead
            headers = {"Authorization": "Client-ID 546c25a59c58ad7"}
            with open(image_path, "rb") as file:
                response = requests.post(
                    "https://api.imgur.com/3/image",
                    headers=headers,
                    files={"image": file}
                )
            if response.status_code == 200:
                data = response.json()
                return data["data"]["link"]
            else:
                logger.error(f"Failed to upload to Imgur: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Error uploading image to Imgur: {e}")
            return None

    def post_image(self, image_path: str, caption: str) -> bool:
        """Post a single image to Instagram."""
        if not self.is_configured():
            logger.warning("Instagram credentials not configured. Skipping post.")
            return False
            
        logger.info(f"[Instagram] Uploading local image {image_path} to public host...")
        image_url = self._upload_to_imgur(image_path)
        if not image_url:
            return False
            
        logger.info(f"[Instagram] Image public URL ready: {image_url}")

        # Step 1: Create media container
        logger.info("[Instagram] Creating Instagram media container...")
        create_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media"
        payload = {
            "image_url": image_url,
            "caption": caption,
            "access_token": self.access_token
        }
        
        try:
            response = requests.post(create_url, json=payload)
            if response.status_code != 200:
                logger.error(f"[Instagram] Error creating container: {response.text}")
                return False
                
            response_data = response.json()
            if "id" not in response_data:
                logger.error(f"[Instagram] Error creating container: {response_data}")
                return False
                
            container_id = response_data["id"]
            logger.info(f"[Instagram] Container created with ID: {container_id}")
            
            # Instagram needs a moment to download your image
            logger.info("[Instagram] Waiting for image to be processed by Instagram...")
            time.sleep(8)
            
            # Step 2: Publish the media container
            logger.info("[Instagram] Publishing container...")
            publish_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media_publish"
            publish_payload = {
                "creation_id": container_id,
                "access_token": self.access_token
            }
            
            publish_response = requests.post(publish_url, json=publish_payload)
            if publish_response.status_code != 200:
                logger.error(f"[Instagram] Error publishing container: {publish_response.text}")
                return False
                
            publish_data = publish_response.json()
            
            if "id" in publish_data:
                logger.info(f"✅ [Instagram] Success! Posted to Instagram with Media ID: {publish_data['id']}")
                return True
            else:
                logger.error(f"[Instagram] Error publishing container: {publish_data}")
                return False
        except Exception as e:
            logger.error(f"[Instagram] API error: {e}")
            return False
            
    def post_carousel(self, image_paths: List[str], caption: str) -> bool:
        """Post up to 10 images as an Instagram Carousel."""
        if not self.is_configured():
            logger.warning("Instagram credentials not configured. Skipping.")
            return False
            
        # Instagram limits carousels to 10 images
        image_paths = image_paths[:10]
            
        logger.info(f"[Instagram] Starting Carousel post with {len(image_paths)} images...")
        
        # 1. Upload all to Imgur and create item containers
        item_ids = []
        for i, path in enumerate(image_paths):
            logger.info(f"[Instagram] Processing carousel image {i+1}/{len(image_paths)}: {path}")
            img_url = self._upload_to_imgur(path)
            if not img_url:
                logger.error("[Instagram] Failed to upload image. Aborting carousel.")
                return False
                
            # Create item container
            create_item_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media"
            payload = {
                "image_url": img_url,
                "is_carousel_item": True,
                "access_token": self.access_token
            }
            resp = requests.post(create_item_url, json=payload)
            if resp.status_code == 200 and "id" in resp.json():
                item_ids.append(resp.json()["id"])
                logger.info(f"[Instagram] Created item container: {resp.json()['id']}")
            else:
                logger.error(f"[Instagram] Failed to create carousel item: {resp.text}")
                return False
                
        # 2. Create carousel container
        logger.info("[Instagram] Waiting for all carousel items to be processed...")
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
        if resp.status_code != 200:
            logger.error(f"[Instagram] Failed to create carousel container: {resp.text}")
            return False
            
        carousel_id = resp.json()["id"]
        logger.info(f"[Instagram] Carousel container created: {carousel_id}")
        
        # 3. Publish
        logger.info("[Instagram] Waiting before final publish...")
        time.sleep(8)
        publish_url = f"https://graph.instagram.com/v21.0/{self.user_id}/media_publish"
        publish_payload = {
            "creation_id": carousel_id,
            "access_token": self.access_token
        }
        res = requests.post(publish_url, json=publish_payload)
        if res.status_code == 200:
            logger.info("✅ [Instagram] Carousel successfully published to Instagram!")
            return True
        else:
            logger.error(f"[Instagram] Failed to publish carousel: {res.text}")
            return False
