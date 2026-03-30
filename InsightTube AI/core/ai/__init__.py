"""
AI module for the YouTube Data Engineering Analysis platform.
Provides AI-powered data processing and analysis capabilities.
"""

# Import core AI components
from .analysis_engine import AIDataProcessor, create_ai_analysis_engine
from .semantic_engine import NLQueryEngine, create_semantic_engine

# Export public interface
__all__ = [
    "AIDataProcessor", 
    "create_ai_analysis_engine",
    "NLQueryEngine", 
    "create_semantic_engine"
]
