"""
Natural Language Query Engine for YouTube Data using LangChain.

This module allows users to ask questions about YouTube data in natural language
and get intelligent, contextual responses powered by AI.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from langchain_openai import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

from ..data.models import YouTubeVideo, VideoAnalysis
from ..utils.config import get_settings

logger = logging.getLogger(__name__)

class NLQueryEngine:
    """
    Natural Language Query Engine for YouTube data analysis.
    
    This class enables users to:
    - Ask questions about YouTube trends in natural language
    - Get contextual, AI-powered responses
    - Have conversational interactions with the data
    - Retrieve relevant information based on queries
    """
    
    def __init__(self):
        """Initialize the natural language query engine."""
        self.settings = get_settings()
        
        # Check if OpenAI API key is available
        if self.settings.ai.openai_api_key:
            # Initialize OpenAI LLM
            self.llm = ChatOpenAI(
                model_name="gpt-4",
                temperature=0.1,
                openai_api_key=self.settings.ai.openai_api_key
            )
            self.demo_mode = False
        else:
            # Demo mode - no real LLM
            self.llm = None
            self.demo_mode = True
            logger.warning("OpenAI API key not found. Running in demo mode.")
        
        # Initialize conversation memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Initialize retriever (would be connected to vector store)
        self.retriever = None
        
        # Initialize conversation chain
        self.conversation_chain = None
        
        # Query templates for different types of questions
        self.query_templates = self._initialize_query_templates()
        
    def _initialize_query_templates(self) -> Dict[str, str]:
        """Initialize query templates for different question types."""
        return {
            "trending": "What are the trending topics in {category} videos this {timeframe}?",
            "performance": "How are {channel} videos performing in terms of {metric}?",
            "comparison": "Compare the performance of {video1} and {video2} videos",
            "prediction": "What's the predicted {metric} for {category} videos next week?",
            "insights": "What insights can you provide about {topic} in YouTube data?",
            "recommendations": "What recommendations do you have for improving {aspect}?"
        }
    
    async def ask(
        self, 
        question: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Ask a question about YouTube data and get an AI-powered response.
        
        Args:
            question: Natural language question about YouTube data
            context: Additional context for the question
            
        Returns:
            Dictionary containing the answer and metadata
        """
        logger.info(f"Processing question: {question}")
        
        # Check if running in demo mode
        if self.demo_mode:
            return await self._demo_response(question)
        
        try:
            # Analyze question type and extract entities
            question_analysis = await self._analyze_question(question)
            
            # Retrieve relevant context
            relevant_docs = await self._retrieve_context(question, question_analysis)
            
            # Generate response
            response = await self._generate_response(question, relevant_docs, context)
            
            # Update conversation memory
            self._update_memory(question, response)
            
            return {
                "question": question,
                "answer": response["answer"],
                "confidence": response["confidence"],
                "sources": response["sources"],
                "suggestions": response["suggestions"],
                "timestamp": datetime.now().isoformat(),
                "question_type": question_analysis["type"]
            }
            
        except Exception as e:
            logger.error(f"Error processing question: {str(e)}")
            return {
                "question": question,
                "answer": "I'm sorry, I encountered an error processing your question. Please try rephrasing it.",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _analyze_question(self, question: str) -> Dict[str, Any]:
        """Analyze the question to determine type and extract entities."""
        analysis_prompt = PromptTemplate(
            input_variables=["question"],
            template="""
            Analyze the following question about YouTube data and classify it:
            
            Question: {question}
            
            Please provide:
            1. Question type (trending, performance, comparison, prediction, insights, recommendations, other)
            2. Key entities mentioned (channels, categories, metrics, timeframes)
            3. Intent (what the user wants to know)
            4. Complexity level (simple, moderate, complex)
            
            Format as JSON with keys: type, entities, intent, complexity
            """
        )
        
        try:
            # In production, this would use the LLM
            # For now, using rule-based classification
            question_lower = question.lower()
            
            if any(word in question_lower for word in ["trend", "trending", "popular"]):
                question_type = "trending"
            elif any(word in question_lower for word in ["performance", "views", "likes", "engagement"]):
                question_type = "performance"
            elif any(word in question_lower for word in ["compare", "comparison", "vs"]):
                question_type = "comparison"
            elif any(word in question_lower for word in ["predict", "forecast", "next"]):
                question_type = "prediction"
            elif any(word in question_lower for word in ["insight", "analysis", "understand"]):
                question_type = "insights"
            elif any(word in question_lower for word in ["recommend", "improve", "suggestion"]):
                question_type = "recommendations"
            else:
                question_type = "other"
            
            return {
                "type": question_type,
                "entities": self._extract_entities(question),
                "intent": "data_analysis",
                "complexity": "moderate"
            }
            
        except Exception as e:
            logger.warning(f"Question analysis failed: {str(e)}")
            return {
                "type": "other",
                "entities": {},
                "intent": "unknown",
                "complexity": "simple"
            }
    
    def _extract_entities(self, question: str) -> Dict[str, Any]:
        """Extract entities from the question using simple NLP."""
        entities = {
            "categories": [],
            "channels": [],
            "metrics": [],
            "timeframes": [],
            "topics": []
        }
        
        # Simple entity extraction (in production, use NER models)
        question_lower = question.lower()
        
        # Extract categories
        categories = ["gaming", "technology", "education", "entertainment", "music", "sports"]
        for category in categories:
            if category in question_lower:
                entities["categories"].append(category)
        
        # Extract metrics
        metrics = ["views", "likes", "comments", "engagement", "subscribers"]
        for metric in metrics:
            if metric in question_lower:
                entities["metrics"].append(metric)
        
        # Extract timeframes
        timeframes = ["today", "week", "month", "year", "yesterday", "last week"]
        for timeframe in timeframes:
            if timeframe in question_lower:
                entities["timeframes"].append(timeframe)
        
        return entities
    
    async def _retrieve_context(
        self, 
        question: str, 
        analysis: Dict[str, Any]
    ) -> List[Document]:
        """Retrieve relevant context for the question."""
        try:
            if not self.retriever:
                # Mock retrieval for now
                return self._mock_retrieval(question, analysis)
            
            # Use the actual retriever
            docs = await self.retriever.aget_relevant_documents(question)
            return docs
            
        except Exception as e:
            logger.warning(f"Context retrieval failed: {str(e)}")
            return self._mock_retrieval(question, analysis)
    
    def _mock_retrieval(
        self, 
        question: str, 
        analysis: Dict[str, Any]
    ) -> List[Document]:
        """Mock retrieval for development/testing."""
        # Create mock documents based on question analysis
        mock_docs = []
        
        if analysis["type"] == "trending":
            mock_docs.append(Document(
                page_content="Gaming videos are trending this week with 15% increase in views",
                metadata={"source": "trending_analysis", "category": "gaming"}
            ))
        
        elif analysis["type"] == "performance":
            mock_docs.append(Document(
                page_content="Channel performance metrics show 25% growth in engagement",
                metadata={"source": "performance_analysis", "metric": "engagement"}
            ))
        
        return mock_docs
    
    async def _generate_response(
        self, 
        question: str, 
        docs: List[Document], 
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate a response using the LLM and retrieved context."""
        try:
            # Prepare context for the LLM
            context_text = "\n".join([doc.page_content for doc in docs])
            
            response_prompt = PromptTemplate(
                input_variables=["question", "context"],
                template="""
                Based on the following context, answer the question about YouTube data:
                
                Context: {context}
                
                Question: {question}
                
                Please provide:
                1. A clear, informative answer
                2. Relevant insights from the data
                3. Actionable recommendations if applicable
                4. Confidence level in your response
                
                Be conversational and helpful. If you don't have enough information, say so.
                """
            )
            
            # In production, use the LLM chain
            # For now, generating mock responses
            response = self._generate_mock_response(question, docs, analysis)
            
            return response
            
        except Exception as e:
            logger.error(f"Response generation failed: {str(e)}")
            return {
                "answer": "I'm sorry, I couldn't generate a response. Please try again.",
                "confidence": 0.0,
                "sources": [],
                "suggestions": []
            }
    
    def _generate_mock_response(
        self, 
        question: str, 
        docs: List[Document], 
        analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate mock responses for development/testing."""
        if analysis["type"] == "trending":
            return {
                "answer": "Based on the data, gaming videos are currently trending with a 15% increase in views this week. The most popular categories include action games and strategy games.",
                "confidence": 0.85,
                "sources": ["trending_analysis"],
                "suggestions": ["Consider creating gaming content", "Focus on trending game titles"]
            }
        
        elif analysis["type"] == "performance":
            return {
                "answer": "Channel performance analysis shows strong growth in engagement metrics, with a 25% increase over the last month. Views and likes are performing above average.",
                "confidence": 0.90,
                "sources": ["performance_analysis"],
                "suggestions": ["Continue current content strategy", "Optimize video thumbnails"]
            }
        
        else:
            return {
                "answer": "I can help you analyze YouTube data. Please ask a specific question about trends, performance, or insights.",
                "confidence": 0.70,
                "sources": [],
                "suggestions": ["Ask about trending topics", "Request performance metrics"]
            }
    
    def _update_memory(self, question: str, response: Dict[str, Any]) -> None:
        """Update conversation memory."""
        try:
            self.memory.chat_memory.add_user_message(question)
            self.memory.chat_memory.add_ai_message(response["answer"])
        except Exception as e:
            logger.warning(f"Failed to update memory: {str(e)}")
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get conversation history."""
        try:
            messages = self.memory.chat_memory.messages
            history = []
            
            for i in range(0, len(messages), 2):
                if i + 1 < len(messages):
                    history.append({
                        "user": messages[i].content,
                        "assistant": messages[i + 1].content
                    })
            
            return history
        except Exception as e:
            logger.warning(f"Failed to get conversation history: {str(e)}")
            return []
    
    def clear_memory(self) -> None:
        """Clear conversation memory."""
        try:
            self.memory.clear()
            logger.info("Conversation memory cleared")
        except Exception as e:
            logger.warning(f"Failed to clear memory: {str(e)}")

    async def _demo_response(self, question: str) -> Dict[str, Any]:
        """Generate demo responses when OpenAI API key is not available."""
        question_lower = question.lower()
        
        # Demo responses based on question type
        if any(word in question_lower for word in ["trend", "trending", "popular"]):
            answer = "🎯 **Demo Mode**: Gaming videos are currently trending with a 15% increase in views this week. The most popular categories include action games and strategy games. In production mode, I would analyze real-time data from YouTube's trending API."
        elif any(word in question_lower for word in ["performance", "views", "likes", "engagement"]):
            answer = "📊 **Demo Mode**: Channel performance analysis shows strong growth in engagement metrics, with a 25% increase over the last month. Views and likes are performing above average. In production mode, I would analyze your actual channel data."
        elif any(word in question_lower for word in ["compare", "comparison", "vs"]):
            answer = "⚖️ **Demo Mode**: I can help you compare video performance, channel metrics, or content categories. In production mode, I would analyze real data from multiple sources."
        elif any(word in question_lower for word in ["predict", "forecast", "next"]):
            answer = "🔮 **Demo Mode**: Based on current trends, I predict continued growth in educational content and short-form videos. In production mode, I would use machine learning models to make accurate predictions."
        elif any(word in question_lower for word in ["insight", "analysis", "understand"]):
            answer = "💡 **Demo Mode**: Key insights include the growing importance of thumbnail optimization and the rise of mobile-first content consumption. In production mode, I would analyze your specific data patterns."
        elif any(word in question_lower for word in ["recommend", "improve", "suggestion"]):
            answer = "🚀 **Demo Mode**: I recommend optimizing video titles with relevant keywords, creating engaging thumbnails, and posting consistently. In production mode, I would provide personalized recommendations based on your channel data."
        else:
            answer = "🤖 **Demo Mode**: I'm here to help you analyze YouTube data! Ask me about trends, performance, comparisons, predictions, insights, or recommendations. To use the full AI capabilities, please set your OpenAI API key in the .env file."
        
        return {
            "question": question,
            "answer": answer,
            "confidence": 0.95,
            "sources": ["demo_mode"],
            "suggestions": [
                "Set up your OpenAI API key for full AI capabilities",
                "Try asking about trending topics",
                "Request performance analysis",
                "Ask for content recommendations"
            ],
            "timestamp": datetime.now().isoformat(),
            "question_type": "demo",
            "demo_mode": True
        }


# Factory function
def create_semantic_engine() -> NLQueryEngine:
    """Create a natural language query engine."""
    return NLQueryEngine()


from sentence_transformers import SentenceTransformer
import faiss

class SemanticSearch:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index = faiss.IndexFlatL2(384)
        self.data = []

    def add(self, texts):
        emb = self.model.encode(texts)
        self.index.add(emb)
        self.data.extend(texts)

    def search(self, q):
        if not self.data:
            return []
        emb = self.model.encode([q])
        D, I = self.index.search(emb, k=min(5, len(self.data)))
        return [self.data[i] for i in I[0]]
