"""
Instagram Reel Publisher — Publishes MP4 reels via Instagram Graph API.

Flow:
1. Upload video to a public URL (Imgur or other hosting)
2. Create Reel container via Graph API  (media_type: REELS)
3. Poll for processing completion
4. Publish the Reel

Note: Instagram requires video to be hosted at a public URL.
      For videos > 10MB, we use a chunked upload approach via Imgur.
"""

import os
import time
import requests
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class InstagramReelSender:
    """Handles publishing Reels to Instagram via Graph API."""

    GRAPH_API_VERSION = "v21.0"

    # Status check config
    MAX_STATUS_CHECKS = 30      # Max polling attempts
    STATUS_CHECK_INTERVAL = 5   # Seconds between checks

    def __init__(self, access_token: str = None, user_id: str = None):
        self.access_token = access_token or os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
        self.user_id = user_id or os.getenv("INSTAGRAM_USER_ID", "")

        if self.access_token:
            logger.info(f"[Reel] Access token loaded (length: {len(self.access_token)})")
        else:
            logger.warning("[Reel] ⚠️ INSTAGRAM_ACCESS_TOKEN not set")

        if self.user_id:
            logger.info(f"[Reel] User ID loaded: {self.user_id}")
        else:
            logger.warning("[Reel] ⚠️ INSTAGRAM_USER_ID not set")

    def is_configured(self) -> bool:
        """Check if Instagram credentials exist."""
        return bool(self.access_token and self.user_id)

    def _upload_video_to_imgur(self, video_path: str) -> Optional[str]:
        """
        Upload video to Imgur to get a public URL.
        Imgur supports video uploads up to 200MB.
        """
        try:
            file_size = os.path.getsize(video_path)
            size_mb = file_size / (1024 * 1024)
            logger.info(f"[Imgur] Uploading video {video_path} ({size_mb:.1f} MB)...")

            headers = {"Authorization": "Client-ID 546c25a59c58ad7"}
            with open(video_path, "rb") as f:
                response = requests.post(
                    "https://api.imgur.com/3/upload",
                    headers=headers,
                    files={"video": f},
                    data={"type": "file"},
                    timeout=300  # 5 min timeout for large files
                )

            if response.status_code == 200:
                data = response.json()
                url = data.get("data", {}).get("link", "")
                if url:
                    logger.info(f"[Imgur] ✅ Video uploaded: {url}")
                    return url
                else:
                    logger.error(f"[Imgur] No link in response: {data}")
                    return None
            else:
                logger.error(f"[Imgur] ❌ Upload failed ({response.status_code}): {response.text[:500]}")
                return None

        except Exception as e:
            logger.error(f"[Imgur] ❌ Video upload error: {e}")
            return None

    def _upload_video_to_tmpfiles(self, video_path: str) -> Optional[str]:
        """
        Alternative: Upload to tmpfiles.org (backup if Imgur fails for video).
        Returns a direct download URL valid for temporary use.
        """
        try:
            file_size = os.path.getsize(video_path)
            size_mb = file_size / (1024 * 1024)
            logger.info(f"[tmpfiles] Uploading video ({size_mb:.1f} MB)...")

            with open(video_path, 'rb') as f:
                response = requests.post(
                    'https://tmpfiles.org/api/v1/upload',
                    files={'file': f},
                    timeout=300
                )

            if response.status_code == 200:
                data = response.json()
                url = data.get('data', {}).get('url', '')
                if url:
                    # Convert to direct download URL
                    direct_url = url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
                    logger.info(f"[tmpfiles] ✅ Video uploaded: {direct_url}")
                    return direct_url
            
            logger.error(f"[tmpfiles] ❌ Upload failed: {response.text[:500]}")
            return None

        except Exception as e:
            logger.error(f"[tmpfiles] ❌ Error: {e}")
            return None

    def _get_public_video_url(self, video_path: str) -> Optional[str]:
        """Try multiple upload services to get a public URL for the video"""
        # Try Imgur first
        url = self._upload_video_to_imgur(video_path)
        if url:
            return url

        # Fallback to tmpfiles
        logger.info("[Upload] Imgur failed, trying tmpfiles.org...")
        url = self._upload_video_to_tmpfiles(video_path)
        if url:
            return url

        logger.error("[Upload] ❌ All upload services failed")
        return None

    def post_reel(self, video_path: str, caption: str) -> bool:
        """
        Post a Reel to Instagram.

        Args:
            video_path: Path to the MP4 video file
            caption: Reel caption text

        Returns:
            True if successfully posted
        """
        if not self.is_configured():
            logger.error("[Reel] Not configured — missing credentials")
            return False

        if not os.path.exists(video_path):
            logger.error(f"[Reel] Video file not found: {video_path}")
            return False

        logger.info(f"[Reel] 🎬 Starting Reel publish flow...")

        # Step 1: Upload video to get public URL
        video_url = self._get_public_video_url(video_path)
        if not video_url:
            return False

        # Wait for the upload to be fully available
        logger.info("[Reel] Waiting 10s for upload to propagate...")
        time.sleep(10)

        # Step 2: Create Reel container
        logger.info("[Reel] Creating Reel container...")
        create_url = f"https://graph.instagram.com/{self.GRAPH_API_VERSION}/{self.user_id}/media"
        payload = {
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "share_to_feed": True,
            "access_token": self.access_token
        }

        try:
            response = requests.post(create_url, json=payload, timeout=60)
            logger.info(f"[Reel] Create response: {response.status_code}")

            if response.status_code != 200:
                logger.error(f"[Reel] ❌ Container creation failed: {response.text}")
                return False

            resp_data = response.json()
            if "id" not in resp_data:
                logger.error(f"[Reel] No ID in response: {resp_data}")
                return False

            container_id = resp_data["id"]
            logger.info(f"[Reel] ✓ Container created: {container_id}")

        except Exception as e:
            logger.error(f"[Reel] ❌ Container creation error: {e}")
            return False

        # Step 3: Poll for processing completion
        logger.info("[Reel] ⏳ Waiting for Instagram to process the video...")
        if not self._wait_for_processing(container_id):
            logger.error("[Reel] ❌ Video processing failed or timed out")
            return False

        # Step 4: Publish the Reel
        logger.info("[Reel] 🚀 Publishing Reel...")
        publish_url = f"https://graph.instagram.com/{self.GRAPH_API_VERSION}/{self.user_id}/media_publish"
        publish_payload = {
            "creation_id": container_id,
            "access_token": self.access_token
        }

        try:
            pub_response = requests.post(publish_url, json=publish_payload, timeout=60)
            logger.info(f"[Reel] Publish response: {pub_response.status_code}")

            if pub_response.status_code == 200:
                pub_data = pub_response.json()
                if "id" in pub_data:
                    logger.info(f"✅ [Reel] Published! Media ID: {pub_data['id']}")
                    return True
                else:
                    logger.error(f"[Reel] Publish response missing ID: {pub_data}")
                    return False
            else:
                logger.error(f"[Reel] ❌ Publish failed: {pub_response.text}")
                return False

        except Exception as e:
            logger.error(f"[Reel] ❌ Publish error: {e}")
            return False

    def _wait_for_processing(self, container_id: str) -> bool:
        """
        Poll Instagram API until video processing is complete.

        Returns:
            True if processing finished successfully
        """
        status_url = f"https://graph.instagram.com/{self.GRAPH_API_VERSION}/{container_id}"

        for attempt in range(1, self.MAX_STATUS_CHECKS + 1):
            try:
                response = requests.get(
                    status_url,
                    params={
                        "fields": "status_code,status",
                        "access_token": self.access_token
                    },
                    timeout=30
                )

                if response.status_code == 200:
                    data = response.json()
                    status_code = data.get("status_code", "UNKNOWN")

                    logger.info(f"[Reel] Processing status ({attempt}/{self.MAX_STATUS_CHECKS}): {status_code}")

                    if status_code == "FINISHED":
                        logger.info("[Reel] ✓ Video processing complete!")
                        return True
                    elif status_code == "ERROR":
                        error_msg = data.get("status", "Unknown error")
                        logger.error(f"[Reel] ❌ Processing error: {error_msg}")
                        return False
                    elif status_code in ("IN_PROGRESS", "PUBLISHED"):
                        # Still processing or already good
                        if status_code == "PUBLISHED":
                            return True
                else:
                    logger.warning(f"[Reel] Status check failed ({response.status_code})")

            except Exception as e:
                logger.warning(f"[Reel] Status check error: {e}")

            time.sleep(self.STATUS_CHECK_INTERVAL)

        logger.error(f"[Reel] ❌ Processing timed out after {self.MAX_STATUS_CHECKS * self.STATUS_CHECK_INTERVAL}s")
        return False
