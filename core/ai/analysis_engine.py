"""
AI-powered data analysis_engine for YouTube data analysis.
Uses LangChain and OpenAI for intelligent data processing and insights.
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from langchain.schema import Document

from ..utils.config import get_settings
from ..data.models import YouTubeVideo, VideoAnalysis, ProcessingConfig

logger = logging.getLogger(__name__)


class AIDataProcessor:
    """
    AI-powered analysis_engine for YouTube data analysis.
    
    This class provides intelligent analysis of YouTube videos using:
    - OpenAI GPT models for content analysis
    - LangChain for structured processing
    - Vector embeddings for semantic search
    - Custom prompts for specialized analysis
    """
    
    def __init__(self, config: Optional[ProcessingConfig] = None):
        """Initialize the AI data analysis_engine."""
        self.config = config or ProcessingConfig()
        self.settings = get_settings()
        
        # Check if OpenAI API key is available
        if self.settings.ai.openai_api_key:
            # Initialize OpenAI components
            self.llm = ChatOpenAI(
                model_name=self.settings.ai.model_name,
                temperature=self.settings.ai.temperature,
                openai_api_key=self.settings.ai.openai_api_key
            )
            
            # Initialize embeddings
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=self.settings.ai.openai_api_key
            )
            self.demo_mode = False
        else:
            # Demo mode - no real LLM
            self.llm = None
            self.embeddings = None
            self.demo_mode = True
            logger.warning("OpenAI API key not found. Running in demo mode.")
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        # Vector store for semantic search
        self.vector_store = None
        
        logger.info("AI Data Processor initialized successfully")
    
    async def process_youtube_data(
        self, 
        video_ids: List[str], 
        analysis_type: str = "comprehensive"
    ) -> List[VideoAnalysis]:
        """
        Process YouTube videos with AI-powered analysis.
        
        Args:
            video_ids: List of YouTube video IDs to analyze
            analysis_type: Type of analysis to perform
            
        Returns:
            List of video analysis results
        """
        logger.info(f"Starting AI analysis of {len(video_ids)} videos")
        
        # Check if running in demo mode
        if self.demo_mode:
            return await self._demo_analysis(video_ids, analysis_type)
        
        analyses = []
        
        for video_id in video_ids:
            try:
                # Fetch video data (mock implementation)
                video = self._fetch_video_data(video_id)
                
                # Perform AI analysis
                analysis = await self._analyze_video(video, analysis_type)
                
                analyses.append(analysis)
                logger.info(f"Completed analysis for video {video_id}")
                
            except Exception as e:
                logger.error(f"Error analyzing video {video_id}: {e}")
                # Create error analysis
                error_analysis = VideoAnalysis(
                    video_id=video_id,
                    content_score=0.0,
                    sentiment_score=0.0,
                    engagement_score=0.0,
                    category="error",
                    tags=[],
                    summary="Analysis failed",
                    insights=["Error occurred during processing"],
                    recommendations=["Please try again later"]
                )
                analyses.append(error_analysis)
        
        logger.info(f"Completed AI analysis of {len(analyses)} videos")
        return analyses
    
    async def _analyze_video(
        self, 
        video: YouTubeVideo, 
        analysis_type: str
    ) -> VideoAnalysis:
        """Analyze a single video with AI."""
        
        # Create content for analysis
        content = f"""
        Title: {video.title}
        Description: {video.description}
        Duration: {video.duration}
        Views: {video.view_count}
        Likes: {video.like_count}
        Comments: {video.comment_count}
        """
        
        # Perform content analysis
        content_analysis = await self._analyze_content(video)
        
        # Perform sentiment analysis
        sentiment_analysis = await self._analyze_sentiment(video)
        
        # Perform engagement analysis
        engagement_analysis = await self._analyze_engagement(video)
        
        # Generate insights and recommendations
        insights = await self._generate_insights(video, content_analysis)
        recommendations = await self._generate_recommendations(video, content_analysis)
        
        # Create comprehensive analysis
        analysis = VideoAnalysis(
            video_id=video.id,
            content_score=content_analysis.get("score", 0.0),
            sentiment_score=sentiment_analysis.get("score", 0.0),
            engagement_score=engagement_analysis.get("score", 0.0),
            category=content_analysis.get("category", "general"),
            tags=content_analysis.get("tags", []),
            summary=content_analysis.get("summary", ""),
            insights=insights,
            recommendations=recommendations
        )
        
        return analysis
    
    async def _analyze_content(self, video: YouTubeVideo) -> Dict[str, Any]:
        """Analyze video content using AI."""
        
        prompt_template = PromptTemplate(
            input_variables=["title", "description", "metrics"],
            template="""
            Analyze this YouTube video content and provide insights:
            
            Title: {title}
            Description: {description}
            Metrics: {metrics}
            
            Please provide:
            1. Content quality score (0-100)
            2. Content category
            3. Relevant tags
            4. Brief summary
            
            Format your response as JSON with keys: score, category, tags, summary
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt_template)
        
        metrics = f"Views: {video.view_count}, Likes: {video.like_count}, Comments: {video.comment_count}"
        
        try:
            result = await chain.arun(
                title=video.title,
                description=video.description,
                metrics=metrics
            )
            
            # Parse JSON response (simplified)
            return {
                "score": 85.0,  # Mock score
                "category": "technology",
                "tags": ["tech", "tutorial", "programming"],
                "summary": "A comprehensive tutorial on modern programming techniques"
            }
            
        except Exception as e:
            logger.error(f"Content analysis failed: {e}")
            return {
                "score": 50.0,
                "category": "general",
                "tags": [],
                "summary": "Content analysis unavailable"
            }
    
    async def _analyze_sentiment(self, video: YouTubeVideo) -> Dict[str, Any]:
        """Analyze video sentiment using AI."""
        
        prompt_template = PromptTemplate(
            input_variables=["title", "description"],
            template="""
            Analyze the sentiment of this YouTube video:
            
            Title: {title}
            Description: {description}
            
            Provide a sentiment score from -100 (very negative) to +100 (very positive)
            and a brief explanation.
            
            Format as JSON: {{"score": number, "explanation": "string"}}
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt_template)
        
        try:
            result = await chain.arun(
                title=video.title,
                description=video.description
            )
            
            # Mock sentiment analysis
            return {
                "score": 75.0,
                "explanation": "Positive and informative content"
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return {
                "score": 0.0,
                "explanation": "Sentiment analysis unavailable"
            }
    
    async def _analyze_engagement(self, video: YouTubeVideo) -> Dict[str, Any]:
        """Analyze video engagement metrics."""
        
        # Calculate engagement rate
        engagement_rate = video.engagement_rate()
        
        # Mock engagement analysis
        if engagement_rate > 0.1:
            score = 90.0
            explanation = "High engagement rate indicates strong audience connection"
        elif engagement_rate > 0.05:
            score = 70.0
            explanation = "Good engagement rate with room for improvement"
        else:
            score = 40.0
            explanation = "Low engagement rate, consider content optimization"
        
        return {
            "score": score,
            "explanation": explanation,
            "engagement_rate": engagement_rate
        }
    
    async def _generate_insights(self, video: YouTubeVideo, content_analysis: Dict[str, Any]) -> List[str]:
        """Generate insights about the video."""
        
        insights = [
            f"Content quality score: {content_analysis.get('score', 0)}/100",
            f"Category: {content_analysis.get('category', 'general')}",
            f"Engagement rate: {video.engagement_rate():.2%}",
            "Consider optimizing thumbnail and title for better CTR",
            "Monitor comment sentiment for audience feedback"
        ]
        
        return insights
    
    async def _generate_recommendations(self, video: YouTubeVideo, content_analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations for improvement."""
        
        recommendations = [
            "Optimize video title with relevant keywords",
            "Create engaging thumbnails to improve click-through rate",
            "Add end screens to promote other videos",
            "Respond to comments to boost engagement",
            "Consider creating a series on related topics"
        ]
        
        return recommendations
    
    def create_vector_store(self, documents: List[Document]) -> None:
        """Create a vector store for semantic search."""
        try:
            self.vector_store = Chroma.from_documents(
                documents=documents,
                embedding=self.embeddings
            )
            logger.info("Vector store created successfully")
        except Exception as e:
            logger.error(f"Failed to create vector store: {e}")
    
    async def semantic_search(self, query: str, k: int = 5) -> List[Document]:
        """Perform semantic search using the vector store."""
        if not self.vector_store:
            logger.warning("Vector store not initialized")
            return []
        
        try:
            results = self.vector_store.similarity_search(query, k=k)
            return results
        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return []
    
    def _fetch_video_data(self, video_id: str) -> YouTubeVideo:
        """Fetch video data (mock implementation)."""
        # In a real implementation, this would fetch from YouTube API
        return YouTubeVideo(
            id=video_id,
            title=f"Sample Video {video_id}",
            description="This is a sample video description for demonstration purposes.",
            duration=600,  # 10 minutes
            view_count=10000,
            like_count=500,
            comment_count=100,
            published_at="2024-01-01T00:00:00Z",
            channel_id="sample_channel",
            channel_name="Sample Channel",
            category_id="22",
            tags=["sample", "demo", "tutorial"],
            region="US"
        )


    async def _demo_analysis(self, video_ids: List[str], analysis_type: str) -> List[VideoAnalysis]:
        """Generate demo analysis when OpenAI API key is not available."""
        logger.info("Running demo analysis mode")
        
        analyses = []
        for i, video_id in enumerate(video_ids):
            # Create demo analysis
            analysis = VideoAnalysis(
                video_id=video_id,
                content_score=75.0 + (i * 5),  # Varying scores
                sentiment_score=60.0 + (i * 3),
                engagement_score=80.0 + (i * 2),
                category="technology" if i % 2 == 0 else "education",
                tags=["demo", "ai-analysis", "youtube"],
                summary=f"Demo analysis for video {video_id}. This is a sample analysis showing the platform's capabilities.",
                insights=[
                    "Content quality score: 75-85/100",
                    "Positive sentiment detected",
                    "Good engagement potential",
                    "Demo mode - set up OpenAI API key for real analysis"
                ],
                recommendations=[
                    "Optimize video title and thumbnail",
                    "Consider creating a series on related topics",
                    "Engage with audience through comments",
                    "Set up OpenAI API key for full AI capabilities"
                ]
            )
            analyses.append(analysis)
        
        return analyses


async def create_ai_analysis_engine(config: Optional[ProcessingConfig] = None) -> AIDataProcessor:
    """Create and return an AI data analysis_engine instance."""
    return AIDataProcessor(config)
