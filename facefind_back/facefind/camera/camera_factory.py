from abc import ABC, abstractmethod
from .concrete_cameras import USBCamera, IPCamera

class ICameraFactory(ABC):
    @abstractmethod
    def factoryCamera(self):
        pass

class FactoryUSBCamera(ICameraFactory):
    def factoryCamera(self) -> USBCamera:
        return USBCamera()

class FactoryIPCamera(ICameraFactory):
    def factoryCamera(self) -> IPCamera:
        return IPCamera()