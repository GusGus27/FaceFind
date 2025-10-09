from abc import ABC, abstractmethod

class ICamera(ABC):
    @abstractmethod
    def connect(self) -> bool:
        pass

    @abstractmethod
    def get_frame(self):
        pass

    @abstractmethod
    def disconnect(self):
        pass