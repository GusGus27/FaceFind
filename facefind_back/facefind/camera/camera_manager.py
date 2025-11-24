from typing import Optional
from .camera_factory import FactoryUSBCamera, FactoryIPCamera, ICameraFactory
from .camera_interface import ICamera

class CameraManager:
    def __init__(self, camera_type: str = "USB", device_id: int = 0):
        self.camera_type = camera_type
        self.device_id = device_id
        self.factory: ICameraFactory = self._get_factory(camera_type, device_id)
        self.active_camera: Optional[ICamera] = None

    def _get_factory(self, camera_type: str, device_id: int = 0) -> ICameraFactory:
        if camera_type.upper() == "USB":
            return FactoryUSBCamera(device_id)
        elif camera_type.upper() == "IP":
            return FactoryIPCamera()
        else:
            raise ValueError(f"Unsupported camera type: {camera_type}")

    def factoryCamera(self) -> ICamera:
        if not self.active_camera:
            self.active_camera = self.factory.factoryCamera()
        return self.active_camera

    def switch_camera_type(self, camera_type: str):
        if self.active_camera:
            self.active_camera.disconnect()
        self.factory = self._get_factory(camera_type)
        self.active_camera = None

    def disconnect(self):
        if self.active_camera:
            self.active_camera.disconnect()
            self.active_camera = None