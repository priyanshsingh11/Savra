import time
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class CircuitState(Enum):
    CLOSED = "CLOSED" # Normal operation
    OPEN = "OPEN"     # API is failing, bypass it
    HALF_OPEN = "HALF_OPEN" # Testing if API is back

class CircuitBreaker:
    def __init__(self, failure_threshold=3, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = CircuitState.CLOSED
        self.failures = 0
        self.last_failure_time = 0

    def record_success(self):
        if self.state != CircuitState.CLOSED:
            logger.info(f"[CIRCUIT] {self.state.value} -> CLOSED (Service Recovered)")
        self.state = CircuitState.CLOSED
        self.failures = 0

    def record_failure(self):
        self.failures += 1
        self.last_failure_time = time.time()
        
        if self.failures >= self.failure_threshold:
            self.state = CircuitState.OPEN
            logger.warning(f"[CIRCUIT] CLOSED -> OPEN (Service failing, bypassing for {self.recovery_timeout}s)")

    def can_proceed(self) -> bool:
        if self.state == CircuitState.CLOSED:
            return True
            
        # Check if recovery timeout has passed
        if self.state == CircuitState.OPEN:
            if (time.time() - self.last_failure_time) > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                logger.info("[CIRCUIT] OPEN -> HALF_OPEN (Testing service recovery)")
                return True
            return False
            
        return True # HALF_OPEN state allows one request

# Global circuit breaker for LLM services
llm_circuit_breaker = CircuitBreaker()
