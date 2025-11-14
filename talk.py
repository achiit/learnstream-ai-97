import asyncio
import base64
import os
import time
from io import BytesIO
import logging # Import logging module

import gradio as gr
import numpy as np
import websockets
from dotenv import load_dotenv
from fastrtc import (
    AsyncAudioVideoStreamHandler,
    Stream,
    WebRTC,
    # Removed get_cloudflare_turn_credentials_async as we are replacing it
    wait_for_item,
)
from google import genai
from gradio.utils import get_space
from PIL import Image

# --- Configure Logging ---
logging.basicConfig(
    level=logging.INFO,  # Set to logging.DEBUG for more verbose output
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()

# --- Debugging API Key Load ---
gemini_api_key_from_env = os.getenv("GEMINI_API_KEY")
if gemini_api_key_from_env:
    logger.info(f"API Key loaded from environment. Length: {len(gemini_api_key_from_env)}, Starts with: '{gemini_api_key_from_env[:5]}...', Ends with: '...{gemini_api_key_from_env[-5:]}'")
else:
    logger.error("GEMINI_API_KEY environment variable is NOT set or empty. This will likely cause connection issues.")
# --- End Debugging API Key Load ---


# --- SOLUTION B: Static RTC Configuration for local testing ---
rtc_config_for_local_testing = {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"},
        {"urls": "stun:stun1.l.google.com:19302"},
        # You can add more STUN servers if needed, or even private TURN servers
        # if you have them configured locally.
    ]
}
logger.info("Using static RTC configuration for local testing.")
# --- END SOLUTION B ---


def encode_audio(data: np.ndarray) -> dict:
    """Encode Audio data to send to the server"""
    return {
        "mime_type": "audio/pcm",
        "data": base64.b64encode(data.tobytes()).decode("UTF-8"),
    }


def encode_image(data: np.ndarray) -> dict:
    with BytesIO() as output_bytes:
        pil_image = Image.fromarray(data)
        pil_image.save(output_bytes, "JPEG")
        bytes_data = output_bytes.getvalue()
    base64_str = str(base64.b64encode(bytes_data), "utf-8")
    return {"mime_type": "image/jpeg", "data": base64_str}


class GeminiHandler(AsyncAudioVideoStreamHandler):
    def __init__(
        self,
    ) -> None:
        super().__init__(
            "mono",
            output_sample_rate=24000,
            input_sample_rate=16000,
        )
        self.audio_queue = asyncio.Queue()
        self.video_queue = asyncio.Queue()
        self.session = None
        self.last_frame_time = 0
        self.quit = asyncio.Event()
        logger.info("GeminiHandler initialized.")

    def copy(self) -> "GeminiHandler":
        logger.debug("Copying GeminiHandler instance.")
        return GeminiHandler()

    async def start_up(self):
        logger.info("GeminiHandler: Starting up connection to Gemini API...")
        try:
            client = genai.Client(
                api_key=os.getenv("GEMINI_API_KEY"),
                http_options={"api_version": "v1alpha"}
            )
            config = {"response_modalities": ["AUDIO"]}
            async with client.aio.live.connect(
                model="gemini-2.0-flash-exp",
                config=config,  # type: ignore
            ) as session:
                self.session = session
                logger.info("GeminiHandler: Successfully connected to Gemini API live session.")
                while not self.quit.is_set():
                    try:
                        turn = self.session.receive()
                        async for response in turn:
                            if data := response.data:
                                audio = np.frombuffer(data, dtype=np.int16).reshape(1, -1)
                                self.audio_queue.put_nowait(audio)
                                logger.debug("Received audio chunk from Gemini API.")
                    except websockets.exceptions.ConnectionClosedOK:
                        logger.info("GeminiHandler: WebSockets connection closed gracefully.")
                        break
                    except websockets.exceptions.ConnectionClosed as e:
                        logger.error(f"GeminiHandler: WebSockets connection closed unexpectedly: {e}")
                        break
                    except Exception as e:
                        logger.error(f"GeminiHandler: Error during session receive: {e}", exc_info=True)
                        break # Exit loop on unhandled error
        except Exception as e:
            logger.critical(f"GeminiHandler: Failed to connect to Gemini API live session: {e}", exc_info=True)
            # If connection fails, ensure quit event is set to stop further processing
            self.quit.set()


    async def video_receive(self, frame: np.ndarray):
        self.video_queue.put_nowait(frame)
        logger.debug("Received video frame for queue.")

        if self.session:
            current_time = time.time()
            if current_time - self.last_frame_time > 1:
                self.last_frame_time = current_time
                try:
                    await self.session.send(input=encode_image(frame))
                    logger.debug("Sent main video frame to Gemini API.")
                    if self.latest_args[1] is not None:
                        await self.session.send(input=encode_image(self.latest_args[1]))
                        logger.debug("Sent additional input image to Gemini API.")
                except Exception as e:
                    logger.error(f"Error sending video frame to Gemini API: {e}", exc_info=True)


    async def video_emit(self):
        frame = await wait_for_item(self.video_queue, 0.01)
        if frame is not None:
            logger.debug("Emitting video frame from queue.")
            return frame
        else:
            return np.zeros((100, 100, 3), dtype=np.uint8)

    async def receive(self, frame: tuple[int, np.ndarray]) -> None:
        _, array = frame
        array = array.squeeze()
        audio_message = encode_audio(array)
        if self.session:
            try:
                await self.session.send(input=audio_message)
                logger.debug("Sent audio message to Gemini API.")
            except Exception as e:
                logger.error(f"Error sending audio message to Gemini API: {e}", exc_info=True)
        else:
            logger.warning("Attempted to send audio but Gemini session is not active.")


    async def emit(self):
        array = await wait_for_item(self.audio_queue, 0.01)
        if array is not None:
            logger.debug("Emitting audio array from queue.")
            return (self.output_sample_rate, array)
        return array

    async def shutdown(self) -> None:
        logger.info("GeminiHandler: Shutting down.")
        if self.session:
            self.quit.set()
            try:
                await self.session.close()
                logger.info("Gemini API session gracefully closed.")
            except Exception as e:
                logger.error(f"Error closing Gemini API session: {e}", exc_info=True)
            self.quit.clear()
        else:
            logger.warning("Shutdown called but no active Gemini session found.")


stream = Stream(
    handler=GeminiHandler(),
    modality="audio-video",
    mode="send-receive",
    rtc_configuration=rtc_config_for_local_testing, # <<< CHANGED HERE
    time_limit=180 if get_space() else None,
    additional_inputs=[
        gr.Image(label="Image", type="numpy", sources=["upload", "clipboard"])
    ],
    ui_args={
        "icon": "https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png",
        "pulse_color": "rgb(255, 255, 255)",
        "icon_button_color": "rgb(255, 255, 255)",
        "title": "Gemini Audio Video Chat",
    },
)

css = """
#video-source {max-width: 600px !important; max-height: 600 !important;}
"""

with gr.Blocks(css=css) as demo:
    gr.HTML(
        """
    <div style='display: flex; align-items: center; justify-content: center; gap: 20px'>
        <div style="background-color: var(--block-background-fill); border-radius: 8px">
            <img src="https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png" style="width: 100px; height: 100px;">
        </div>
        <div>
            <h1>Gen AI SDK Voice Chat</h1>
            <p>Speak with Gemini using real-time audio + video streaming</p>
            <p>Powered by <a href="https://gradio.app/">Gradio</a> and <a href=https://freddyaboulton.github.io/gradio-webrtc/">WebRTC</a>⚡️</p>
            <p>Get an API Key <a href="https://support.google.com/googleapi/answer/6158862?hl=en">here</a></p>
        </div>
    </div>
    """
    )
    with gr.Row() as row:
        with gr.Column():
            webrtc = WebRTC(
                label="Video Chat",
                modality="audio-video",
                mode="send-receive",
                elem_id="video-source",
                rtc_configuration=rtc_config_for_local_testing, # <<< CHANGED HERE
                icon="https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png",
                pulse_color="rgb(255, 255, 255)",
                icon_button_color="rgb(255, 255, 255)",
            )
        with gr.Column():
            image_input = gr.Image(
                label="Image", type="numpy", sources=["upload", "clipboard"]
            )

        webrtc.stream(
            GeminiHandler(),
            inputs=[webrtc, image_input],
            outputs=[webrtc],
            time_limit=180 if get_space() else None,
            concurrency_limit=2 if get_space() else None,
        )

stream.ui = demo


if __name__ == "__main__":
    if (mode := os.getenv("MODE")) == "UI":
        logger.info("Running in UI mode.")
        stream.ui.launch(server_port=7860)
    elif mode == "PHONE":
        logger.error("Phone mode not supported for this demo.")
        raise ValueError("Phone mode not supported for this demo")
    else:
        logger.info("Running in default mode (UI).")
        stream.ui.launch(server_port=7860)