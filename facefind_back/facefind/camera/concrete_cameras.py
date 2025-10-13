import cv2
from .camera_interface import ICamera

class USBCamera(ICamera):
    def __init__(self):
        self.stream = None
        self.is_connected = False
        self.device_id = 0

    def connect(self) -> bool:
        try:
            self.stream = cv2.VideoCapture(self.device_id)
            if not self.stream.isOpened():
                self.device_id = 1  # Try second camera
                self.stream = cv2.VideoCapture(self.device_id)
            
            self.is_connected = self.stream.isOpened()
            return self.is_connected
        except Exception as e:
            print(f"Error connecting to USB camera: {e}")
            return False

    def get_frame(self):
        if not self.is_connected:
            return None
        ret, frame = self.stream.read()
        return frame if ret else None

    def disconnect(self):
        if self.stream:
            self.stream.release()
        self.is_connected = False

class IPCamera(ICamera):
    def __init__(self, url: str = None):
        self.stream = None
        self.is_connected = False
        self.url = url

    def set_url(self, url: str):
        self.url = url

    def connect(self) -> bool:
        try:
            if not self.url:
                return False
                
            print(f"🔗 Conectando a cámara IP: {self.url}")
            self.stream = cv2.VideoCapture(self.url)
            self.is_connected = self.stream.isOpened()
            
            if self.is_connected:
                print(f"Conectado exitosamente a: {self.url}")
            else:
                print(f"No se pudo conectar a: {self.url}")
                
            return self.is_connected
        except Exception as e:
            print(f"Error connecting to IP camera: {e}")
            return False

    def get_frame(self):
        if not self.is_connected:
            return None
        ret, frame = self.stream.read()
        return frame if ret else None

    def disconnect(self):
        if self.stream:
            self.stream.release()
        self.is_connected = False