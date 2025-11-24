from abc import ABC, abstractmethod
from .concrete_cameras import USBCamera, IPCamera

class ICameraFactory(ABC):
    @abstractmethod
    def factoryCamera(self):
        pass

class FactoryUSBCamera(ICameraFactory):
    def __init__(self, device_id: int = 0):
        self.device_id = device_id
    
    def factoryCamera(self) -> USBCamera:
        return USBCamera(self.device_id)

class FactoryIPCamera(ICameraFactory):
    def factoryCamera(self) -> IPCamera:
        return IPCamera()