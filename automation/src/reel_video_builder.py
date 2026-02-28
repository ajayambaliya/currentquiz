"""
Reel Video Builder — Assembles PNG frames into an MP4 video with background music.

Uses FFmpeg (subprocess) to:
1. Create video from sequence of still frames with timed durations
2. Add smooth crossfade transitions between frames
3. Merge background music with fade-in/fade-out
4. Output Instagram-Reel-ready MP4 (H.264, AAC, 1080x1920)
"""

import os
import sys
import json
import subprocess
import logging
import hashlib
from pathlib import Path
from datetime import date
from typing import List, Optional, Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ReelVideoBuilder:
    """Builds Instagram Reel MP4 from screenshot frames + audio"""

    # Duration (seconds) for each frame type
    INTRO_DURATION = 3.0
    QUESTION_DURATION = 5.0   # Think time
    ANSWER_DURATION = 3.0     # Answer reveal time
    OUTRO_DURATION = 4.0

    # Transition duration between frames (crossfade)
    TRANSITION_DURATION = 0.5

    def __init__(self, music_dir: str = "music"):
        self.music_dir = music_dir
        self._check_ffmpeg()

    def _check_ffmpeg(self):
        """Verify FFmpeg is available"""
        try:
            result = subprocess.run(
                ['ffmpeg', '-version'],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0:
                version_line = result.stdout.split('\n')[0] if result.stdout else 'unknown'
                logger.info(f"✓ FFmpeg found: {version_line}")
            else:
                logger.warning("⚠️ FFmpeg returned non-zero exit code")
        except FileNotFoundError:
            logger.error("❌ FFmpeg not found! Install it: choco install ffmpeg (Windows) or apt install ffmpeg (Linux)")
            raise RuntimeError("FFmpeg is required but not installed")
        except Exception as e:
            logger.warning(f"⚠️ FFmpeg check issue: {e}")

    def get_daily_music_track(self) -> Optional[str]:
        """Pick a different music track each day using date-based rotation"""
        if not os.path.exists(self.music_dir):
            logger.warning(f"Music directory not found: {self.music_dir}")
            return None

        tracks = sorted([
            f for f in os.listdir(self.music_dir)
            if f.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg', '.aac'))
        ])

        if not tracks:
            logger.warning("No audio tracks found in music directory")
            return None

        # Date-based hash for daily rotation
        today = date.today().isoformat()
        index = int(hashlib.md5(today.encode()).hexdigest(), 16) % len(tracks)
        selected = tracks[index]

        logger.info(f"🎵 Daily track selected: {selected} (track {index + 1}/{len(tracks)})")
        return os.path.join(self.music_dir, selected)

    def _get_frame_duration(self, frame_id: str) -> float:
        """Determine how long each frame should show based on its ID"""
        if 'intro' in frame_id:
            return self.INTRO_DURATION
        elif 'think' in frame_id:
            return self.QUESTION_DURATION
        elif 'answer' in frame_id:
            return self.ANSWER_DURATION
        elif 'outro' in frame_id:
            return self.OUTRO_DURATION
        else:
            return 3.0  # fallback

    def build_video(
        self,
        frames_dir: str,
        output_path: str,
        music_path: Optional[str] = None
    ) -> Optional[str]:
        """
        Build the final reel MP4 from frames + audio.

        Args:
            frames_dir: Directory containing PNG frames and frames_manifest.json
            output_path: Path for the output MP4
            music_path: Path to background music (auto-selects daily track if None)

        Returns:
            Path to the output video, or None on failure
        """
        # Load frame manifest
        manifest_path = os.path.join(frames_dir, 'frames_manifest.json')
        if not os.path.exists(manifest_path):
            logger.error(f"Frame manifest not found: {manifest_path}")
            return None

        with open(manifest_path, 'r') as f:
            frames = json.load(f)

        if not frames:
            logger.error("No frames in manifest")
            return None

        logger.info(f"📽️ Building reel from {len(frames)} frames...")

        # Calculate total video duration
        total_duration = sum(self._get_frame_duration(f['id']) for f in frames)
        logger.info(f"⏱️ Total video duration: {total_duration:.1f} seconds")

        # Select music if not provided
        if music_path is None:
            music_path = self.get_daily_music_track()

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)

        # ── BUILD VIDEO ──
        try:
            video_no_audio = output_path.replace('.mp4', '_silent.mp4')
            
            # Step 1: Create silent video from frames using concat demuxer
            self._create_video_from_frames(frames, video_no_audio)

            # Step 2: Add music
            if music_path and os.path.exists(music_path):
                self._merge_audio(video_no_audio, music_path, output_path, total_duration)
                # Clean up silent video
                try:
                    os.remove(video_no_audio)
                except:
                    pass
            else:
                # No music available, use silent video
                logger.warning("⚠️ No music track available, outputting silent video")
                os.rename(video_no_audio, output_path)

            if os.path.exists(output_path):
                size_mb = os.path.getsize(output_path) / (1024 * 1024)
                logger.info(f"✅ Reel video created: {output_path} ({size_mb:.1f} MB)")
                return output_path
            else:
                logger.error("❌ Output video file was not created")
                return None

        except Exception as e:
            logger.error(f"❌ Video build failed: {e}", exc_info=True)
            return None

    def _create_video_from_frames(self, frames: List[Dict], output_path: str):
        """Create a video from PNG frames with specified durations using FFmpeg"""
        
        # Create temporary concat file for FFmpeg
        concat_file = output_path + '.concat.txt'
        
        with open(concat_file, 'w') as f:
            for i, frame in enumerate(frames):
                frame_path = frame['path']
                duration = self._get_frame_duration(frame['id'])
                
                # Use absolute path and escape backslashes for FFmpeg on Windows
                abs_path = os.path.abspath(frame_path).replace('\\', '/')
                f.write(f"file '{abs_path}'\n")
                f.write(f"duration {duration}\n")
            
            # FFmpeg concat requires the last file to be listed again
            last_path = os.path.abspath(frames[-1]['path']).replace('\\', '/')
            f.write(f"file '{last_path}'\n")

        logger.info(f"📝 Concat file created: {concat_file}")

        # Build FFmpeg command
        cmd = [
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', concat_file,
            '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,fps=30,format=yuv420p',
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '18',       # High quality
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',  # Web-optimized
            output_path
        ]

        logger.info(f"🔧 Running FFmpeg (silent video)...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

        if result.returncode != 0:
            logger.error(f"FFmpeg error:\n{result.stderr[-2000:]}")
            raise RuntimeError(f"FFmpeg failed with exit code {result.returncode}")

        # Clean up concat file
        try:
            os.remove(concat_file)
        except:
            pass

        logger.info("✓ Silent video created successfully")

    def _merge_audio(
        self,
        video_path: str,
        audio_path: str,
        output_path: str,
        video_duration: float
    ):
        """Merge background music into the video with fade-in/fade-out"""

        fade_in = 1.0     # 1 second fade in
        fade_out = 2.5    # 2.5 second fade out at end
        fade_out_start = max(0, video_duration - fade_out)

        # FFmpeg: trim audio to video length, apply fades, merge
        cmd = [
            'ffmpeg', '-y',
            '-i', video_path,
            '-i', audio_path,
            '-filter_complex',
            f'[1:a]atrim=0:{video_duration},asetpts=PTS-STARTPTS,'
            f'afade=t=in:st=0:d={fade_in},'
            f'afade=t=out:st={fade_out_start}:d={fade_out},'
            f'volume=0.3[a]',    # 30% volume so music stays as background
            '-map', '0:v',
            '-map', '[a]',
            '-c:v', 'copy',      # Don't re-encode video
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
            '-movflags', '+faststart',
            output_path
        ]

        logger.info(f"🎵 Merging audio: {os.path.basename(audio_path)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

        if result.returncode != 0:
            logger.error(f"FFmpeg audio merge error:\n{result.stderr[-2000:]}")
            raise RuntimeError(f"FFmpeg audio merge failed with exit code {result.returncode}")

        logger.info("✓ Audio merged successfully")

    def build_all_reels(
        self,
        frames_base_dir: str,
        output_dir: str,
        reel_count: int,
        date_filename: str
    ) -> List[str]:
        """
        Build all reel videos for today's quiz.

        Args:
            frames_base_dir: Base directory containing reel frame subdirectories
            output_dir: Directory for output MP4 files
            reel_count: Number of reels to build
            date_filename: Date string for filenames (e.g. '20260228')

        Returns:
            List of paths to created MP4 files
        """
        os.makedirs(output_dir, exist_ok=True)
        reel_paths = []

        music_path = self.get_daily_music_track()

        for i in range(reel_count):
            frames_dir = os.path.join(frames_base_dir, f"reel_{i}")
            output_path = os.path.join(output_dir, f"reel_{i}_{date_filename}.mp4")

            if not os.path.exists(frames_dir):
                logger.warning(f"Frames directory not found: {frames_dir}")
                continue

            logger.info(f"\n🎬 Building Reel {i + 1}/{reel_count}...")
            video = self.build_video(frames_dir, output_path, music_path)

            if video:
                reel_paths.append(video)
            else:
                logger.error(f"Failed to build reel {i}")

        logger.info(f"\n✅ Built {len(reel_paths)}/{reel_count} reels")
        return reel_paths
