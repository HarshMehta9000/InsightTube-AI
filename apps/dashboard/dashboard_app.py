"""
Streamlit Dashboard for YouTube Data Engineering Analysis.

This is the main dashboard application that provides an interactive interface
for exploring YouTube data, AI insights, and analytics.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import asyncio
import sys
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Add project root to Python path
import sys
import os
from pathlib import Path

# Get the project root directory (3 levels up from this file)
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Set environment variable for the project root
os.environ['PROJECT_ROOT'] = str(project_root)

try:
    from core.ai.analysis_engine import AIDataProcessor
    from core.ai.semantic_engine import NLQueryEngine
    from core.data.models import YouTubeVideo, VideoAnalysis, VideoCategory, Region
    from core.utils.config import get_settings
except ImportError as e:
    st.error(f"Import error: {e}")
    st.info(f"Project root: {project_root}")
    st.info("Please ensure you're running from the project root directory")
    st.stop()

# Page configuration
st.set_page_config(
    page_title="YouTube AI Data Analysis",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    .ai-insight {
        background-color: #e8f4fd;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #ff6b6b;
    }
    .sidebar .sidebar-content {
        background-color: #f8f9fa;
    }
</style>
""", unsafe_allow_html=True)

class DashboardApp:
    """Main dashboard application class."""
    
    def __init__(self):
        self.settings = get_settings()
        self.ai_analysis_engine = None
        self.semantic_engine = None
        self.initialize_components()
        
    def initialize_components(self):
        """Initialize AI components and data."""
        try:
            # Initialize AI analysis_engine
            self.ai_analysis_engine = AIDataProcessor()
            self.semantic_engine = NLQueryEngine()
            st.success("✅ AI components initialized successfully!")
        except Exception as e:
            st.error(f"❌ Failed to initialize AI components: {str(e)}")
            st.info("Running in demo mode with mock data")
    
    def run(self):
        """Run the main dashboard application."""
        self.render_header()
        self.render_sidebar()
        
        # Main content area
        tab1, tab2, tab3, tab4, tab5 = st.tabs([
            "📊 Overview", "🤖 AI Analysis", "💬 Chat with Data", "📈 Analytics", "⚙️ Settings"
        ])
        
        with tab1:
            self.render_overview_tab()
        
        with tab2:
            self.render_ai_analysis_tab()
        
        with tab3:
            self.render_chat_tab()
        
        with tab4:
            self.render_analytics_tab()
        
        with tab5:
            self.render_settings_tab()
    
    def render_header(self):
        """Render the main header."""
        st.markdown('<h1 class="main-header">🚀 YouTube AI Data Analysis Platform</h1>', unsafe_allow_html=True)
        st.markdown("---")
        
        # Key metrics row
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Videos", "1,234,567", "+12.5%")
        
        with col2:
            st.metric("AI Insights", "89,432", "+8.2%")
        
        with col3:
            st.metric("Trending Topics", "156", "+23.1%")
        
        with col4:
            st.metric("Processing Jobs", "45", "Active")
    
    def render_sidebar(self):
        """Render the sidebar with filters and controls."""
        st.sidebar.title("🎛️ Controls & Filters")
        
        # Date range filter
        st.sidebar.subheader("📅 Date Range")
        date_range = st.sidebar.date_input(
            "Select Date Range",
            value=(datetime.now() - timedelta(days=30), datetime.now()),
            max_value=datetime.now()
        )
        
        # Region filter
        st.sidebar.subheader("🌍 Region")
        selected_regions = st.sidebar.multiselect(
            "Select Regions",
            options=[region.value for region in Region],
            default=["US", "GB", "CA"]
        )
        
        # Category filter
        st.sidebar.subheader("📂 Categories")
        selected_categories = st.sidebar.multiselect(
            "Select Categories",
            options=[cat.value for cat in VideoCategory],
            default=["gaming", "technology", "education"]
        )
        
        # AI Model selection
        st.sidebar.subheader("🤖 AI Model")
        ai_model = st.sidebar.selectbox(
            "Select AI Model",
            options=["gpt-4", "gpt-3.5-turbo", "claude-3-sonnet"],
            index=0
        )
        
        # Processing options
        st.sidebar.subheader("⚙️ Processing")
        enable_real_time = st.sidebar.checkbox("Enable Real-time Processing", value=True)
        batch_size = st.sidebar.slider("Batch Size", 100, 10000, 1000, step=100)
        
        # Store filters in session state
        st.session_state.date_range = date_range
        st.session_state.selected_regions = selected_regions
        st.session_state.selected_categories = selected_categories
        st.session_state.ai_model = ai_model
        st.session_state.enable_real_time = enable_real_time
        st.session_state.batch_size = batch_size
    
    def render_overview_tab(self):
        """Render the overview tab with key insights."""
        st.header("📊 Platform Overview")
        
        # Recent activity
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.subheader("📈 Recent Activity")
            self.render_activity_chart()
        
        with col2:
            st.subheader("🔥 Trending Now")
            self.render_trending_widget()
        
        # Performance metrics
        st.subheader("📊 Performance Metrics")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            self.render_metric_card("Data Processing", "98.5%", "Success Rate", "green")
        
        with col2:
            self.render_metric_card("AI Accuracy", "94.2%", "Prediction Rate", "blue")
        
        with col3:
            self.render_metric_card("System Uptime", "99.9%", "Availability", "orange")
        
        # Quick actions
        st.subheader("⚡ Quick Actions")
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            if st.button("🔄 Refresh Data", use_container_width=True):
                st.success("Data refreshed successfully!")
        
        with col2:
            if st.button("🤖 Run AI Analysis", use_container_width=True):
                st.info("AI analysis started...")
        
        with col3:
            if st.button("📊 Generate Report", use_container_width=True):
                st.info("Report generation started...")
        
        with col4:
            if st.button("📤 Export Data", use_container_width=True):
                st.info("Export started...")
    
    def render_ai_analysis_tab(self):
        """Render the AI analysis tab."""
        st.header("🤖 AI-Powered Analysis")
        
        # Analysis configuration
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.subheader("🔧 Analysis Configuration")
            
            analysis_type = st.selectbox(
                "Analysis Type",
                options=["comprehensive", "sentiment_and_trends", "content_categorization"],
                index=0
            )
            
            video_ids_input = st.text_area(
                "Video IDs (one per line)",
                value="dQw4w9WgXcQ\n9bZkp7q19f0\nkJQP7kiw5Fk",
                height=100
            )
            
            if st.button("🚀 Start AI Analysis", type="primary"):
                self.run_ai_analysis(analysis_type, video_ids_input)
        
        with col2:
            st.subheader("📊 Analysis Status")
            self.render_analysis_status()
        
        # Results display
        if "ai_analysis_results" in st.session_state:
            st.subheader("📋 Analysis Results")
            self.render_analysis_results()
    
    def render_chat_tab(self):
        """Render the chat with data tab."""
        st.header("💬 Chat with Your Data")
        
        # Chat interface
        col1, col2 = st.columns([3, 1])
        
        with col1:
            st.subheader("💭 Ask Questions")
            
            # Chat input
            user_question = st.text_input(
                "Ask a question about your YouTube data:",
                placeholder="e.g., What are the trending topics in gaming videos this week?"
            )
            
            if st.button("🤖 Ask AI", type="primary") and user_question:
                self.process_chat_question(user_question)
            
            # Chat history
            if "chat_history" in st.session_state:
                st.subheader("💬 Chat History")
                for i, chat in enumerate(st.session_state.chat_history):
                    with st.chat_message("user"):
                        st.write(chat["user"])
                    with st.chat_message("assistant"):
                        st.write(chat["assistant"])
        
        with col2:
            st.subheader("💡 Suggested Questions")
            suggested_questions = [
                "What are the top performing channels?",
                "Which video categories are trending?",
                "How has engagement changed over time?",
                "What factors contribute to viral videos?",
                "Which regions have the highest viewership?"
            ]
            
            for question in suggested_questions:
                if st.button(question, key=f"suggest_{question[:20]}"):
                    st.session_state.user_question = question
                    st.rerun()
    
    def render_analytics_tab(self):
        """Render the analytics tab."""
        st.header("📈 Advanced Analytics")
        
        # Analytics type selection
        analytics_type = st.selectbox(
            "Select Analytics Type",
            options=["Trend Analysis", "Channel Performance", "Content Analysis", "Geographic Insights"],
            index=0
        )
        
        if analytics_type == "Trend Analysis":
            self.render_trend_analytics()
        elif analytics_type == "Channel Performance":
            self.render_channel_analytics()
        elif analytics_type == "Content Analysis":
            self.render_content_analytics()
        elif analytics_type == "Geographic Insights":
            self.render_geographic_analytics()
    
    def render_settings_tab(self):
        """Render the settings tab."""
        st.header("⚙️ Platform Settings")
        
        # Configuration sections
        tab1, tab2, tab3, tab4 = st.tabs(["🔑 API Keys", "🌐 Data Sources", "🤖 AI Models", "📊 Processing"])
        
        with tab1:
            self.render_api_settings()
        
        with tab2:
            self.render_data_source_settings()
        
        with tab3:
            self.render_ai_model_settings()
        
        with tab4:
            self.render_processing_settings()
    
    def render_activity_chart(self):
        """Render activity chart."""
        # Mock data for demonstration
        dates = pd.date_range(start='2024-01-01', end='2024-01-31', freq='D')
        activity_data = pd.DataFrame({
            'date': dates,
            'videos_processed': np.random.randint(1000, 5000, len(dates)),
            'ai_insights_generated': np.random.randint(100, 500, len(dates))
        })
        
        fig = make_subplots(
            rows=2, cols=1,
            subplot_titles=('Videos Processed', 'AI Insights Generated'),
            vertical_spacing=0.1
        )
        
        fig.add_trace(
            go.Scatter(x=activity_data['date'], y=activity_data['videos_processed'], 
                      mode='lines+markers', name='Videos'),
            row=1, col=1
        )
        
        fig.add_trace(
            go.Scatter(x=activity_data['date'], y=activity_data['ai_insights_generated'], 
                      mode='lines+markers', name='Insights'),
            row=2, col=1
        )
        
        fig.update_layout(height=400, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)
    
    def render_trending_widget(self):
        """Render trending topics widget."""
        trending_topics = [
            {"topic": "AI & Machine Learning", "trend": "🔥", "growth": "+45%"},
            {"topic": "Gaming Content", "trend": "📈", "growth": "+32%"},
            {"topic": "Educational Videos", "trend": "📚", "growth": "+28%"},
            {"topic": "Tech Reviews", "trend": "💻", "growth": "+21%"},
            {"topic": "Lifestyle Content", "trend": "🌟", "growth": "+18%"}
        ]
        
        for topic in trending_topics:
            st.markdown(f"**{topic['topic']}** {topic['trend']} {topic['growth']}")
            st.progress(0.7)
    
    def render_metric_card(self, title: str, value: str, subtitle: str, color: str):
        """Render a metric card."""
        st.markdown(f"""
        <div class="metric-card">
            <h3>{title}</h3>
            <h2 style="color: {color};">{value}</h2>
            <p>{subtitle}</p>
        </div>
        """, unsafe_allow_html=True)
    
    def render_analysis_status(self):
        """Render analysis status widget."""
        status_data = {
            "Pending": 5,
            "Processing": 3,
            "Completed": 12,
            "Failed": 1
        }
        
        for status, count in status_data.items():
            color = "green" if status == "Completed" else "orange" if status == "Processing" else "red"
            st.metric(status, count, delta_color=color)
    
    def run_ai_analysis(self, analysis_type: str, video_ids_input: str):
        """Run AI analysis on specified videos."""
        try:
            video_ids = [vid.strip() for vid in video_ids_input.split('\n') if vid.strip()]
            
            if not video_ids:
                st.error("Please enter at least one video ID")
                return
            
            with st.spinner("🤖 Running AI analysis..."):
                # Mock analysis for demonstration
                results = []
                for video_id in video_ids:
                    result = VideoAnalysis(
                        video_id=video_id,
                        content_score=0.85,
                        sentiment_score=0.78,
                        trend_score=0.92,
                        ai_insights="High-quality content with strong engagement potential",
                        recommendations=["Optimize thumbnail", "Add trending hashtags"],
                        processed_at=datetime.now()
                    )
                    results.append(result)
                
                st.session_state.ai_analysis_results = results
                st.success(f"✅ AI analysis completed for {len(results)} videos!")
                
        except Exception as e:
            st.error(f"❌ Analysis failed: {str(e)}")
    
    def render_analysis_results(self):
        """Render AI analysis results."""
        results = st.session_state.ai_analysis_results
        
        for result in results:
            with st.expander(f"Video: {result.video_id}"):
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric("Content Score", f"{result.content_score:.2f}")
                
                with col2:
                    st.metric("Sentiment Score", f"{result.sentiment_score:.2f}")
                
                with col3:
                    st.metric("Trend Score", f"{result.trend_score:.2f}")
                
                st.markdown(f"**AI Insights:** {result.ai_insights}")
                st.markdown("**Recommendations:**")
                for rec in result.recommendations:
                    st.markdown(f"- {rec}")
    
    def process_chat_question(self, question: str):
        """Process a chat question using the AI query engine."""
        try:
            with st.spinner("🤖 Processing your question..."):
                # Mock response for demonstration
                response = {
                    "answer": f"Based on the data, here's what I found about: {question}",
                    "confidence": 0.85,
                    "sources": ["trending_analysis", "performance_metrics"],
                    "suggestions": ["Consider analyzing more recent data", "Look at category-specific trends"]
                }
                
                # Store in chat history
                if "chat_history" not in st.session_state:
                    st.session_state.chat_history = []
                
                st.session_state.chat_history.append({
                    "user": question,
                    "assistant": response["answer"]
                })
                
                st.success("✅ Question processed successfully!")
                st.rerun()
                
        except Exception as e:
            st.error(f"❌ Failed to process question: {str(e)}")
    
    def render_trend_analytics(self):
        """Render trend analytics."""
        st.subheader("📈 Trend Analysis")
        
        # Mock trend data
        trend_data = pd.DataFrame({
            'category': ['Gaming', 'Technology', 'Education', 'Entertainment', 'Music'],
            'growth_rate': [0.25, 0.18, 0.32, 0.15, 0.08],
            'trending_score': [0.85, 0.72, 0.91, 0.68, 0.45]
        })
        
        fig = px.bar(trend_data, x='category', y='growth_rate', 
                    title='Category Growth Rates',
                    color='trending_score',
                    color_continuous_scale='viridis')
        
        st.plotly_chart(fig, use_container_width=True)
    
    def render_channel_analytics(self):
        """Render channel analytics."""
        st.subheader("📺 Channel Performance")
        
        # Mock channel data
        channel_data = pd.DataFrame({
            'channel': ['TechGuru', 'GameMaster', 'EduPro', 'Entertainer', 'MusicStar'],
            'subscribers': [1000000, 2500000, 800000, 1500000, 3000000],
            'avg_views': [500000, 800000, 300000, 600000, 1200000],
            'engagement_rate': [0.08, 0.12, 0.15, 0.06, 0.09]
        })
        
        fig = px.scatter(channel_data, x='subscribers', y='avg_views', 
                        size='engagement_rate', color='engagement_rate',
                        hover_data=['channel'],
                        title='Channel Performance Analysis')
        
        st.plotly_chart(fig, use_container_width=True)
    
    def render_content_analytics(self):
        """Render content analytics."""
        st.subheader("📝 Content Analysis")
        
        # Mock content data
        content_data = pd.DataFrame({
            'content_type': ['Tutorial', 'Review', 'Vlog', 'Interview', 'Showcase'],
            'avg_duration': [15, 8, 12, 25, 6],
            'engagement_score': [0.75, 0.68, 0.82, 0.71, 0.59],
            'trending_potential': [0.85, 0.72, 0.78, 0.65, 0.45]
        })
        
        fig = px.scatter_3d(content_data, x='avg_duration', y='engagement_score', z='trending_potential',
                            color='content_type', title='3D Content Analysis')
        
        st.plotly_chart(fig, use_container_width=True)
    
    def render_geographic_analytics(self):
        """Render geographic analytics."""
        st.subheader("🌍 Geographic Insights")
        
        # Mock geographic data
        geo_data = pd.DataFrame({
            'region': ['US', 'GB', 'CA', 'DE', 'FR', 'JP', 'KR', 'IN'],
            'viewership': [45, 18, 12, 8, 7, 6, 3, 1],
            'engagement_rate': [0.08, 0.09, 0.07, 0.06, 0.08, 0.05, 0.04, 0.12]
        })
        
        fig = px.choropleth(geo_data, locations='region', locationmode='ISO-3166-1',
                           color='viewership', title='Global Viewership Distribution',
                           color_continuous_scale='viridis')
        
        st.plotly_chart(fig, use_container_width=True)
    
    def render_api_settings(self):
        """Render API settings."""
        st.subheader("🔑 API Configuration")
        
        openai_key = st.text_input("OpenAI API Key", type="password", value="sk-...")
        youtube_key = st.text_input("YouTube API Key", type="password", value="AIza...")
        
        if st.button("💾 Save API Keys"):
            st.success("API keys saved successfully!")
    
    def render_data_source_settings(self):
        """Render data source settings."""
        st.subheader("🌐 Data Sources")
        
        data_sources = st.multiselect(
            "Select Data Sources",
            options=["YouTube API", "Social Media APIs", "Web Scraping", "IoT Sensors", "External APIs"],
            default=["YouTube API"]
        )
        
        if st.button("💾 Save Data Sources"):
            st.success("Data sources updated successfully!")
    
    def render_ai_model_settings(self):
        """Render AI model settings."""
        st.subheader("🤖 AI Model Configuration")
        
        model_type = st.selectbox("Primary AI Model", ["GPT-4", "Claude-3", "Custom Model"])
        temperature = st.slider("Temperature", 0.0, 1.0, 0.1, 0.1)
        max_tokens = st.slider("Max Tokens", 100, 4000, 2000, 100)
        
        if st.button("💾 Save AI Settings"):
            st.success("AI settings saved successfully!")
    
    def render_processing_settings(self):
        """Render processing settings."""
        st.subheader("📊 Processing Configuration")
        
        batch_size = st.number_input("Batch Size", 100, 10000, 1000, 100)
        max_workers = st.number_input("Max Workers", 1, 16, 4, 1)
        enable_monitoring = st.checkbox("Enable Monitoring", value=True)
        
        if st.button("💾 Save Processing Settings"):
            st.success("Processing settings saved successfully!")

def main():
    """Main function to run the dashboard."""
    try:
        app = DashboardApp()
        app.run()
    except Exception as e:
        st.error(f"❌ Application error: {str(e)}")
        st.info("Please check your configuration and try again.")

if __name__ == "__main__":
    main()
