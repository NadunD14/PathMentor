import re
import html
from typing import List, Optional


class TextCleaner:
    """Utility class for cleaning and processing text from various sources"""
    
    def __init__(self):
        # Common patterns to clean
        self.html_pattern = re.compile(r'<[^>]+>')
        self.url_pattern = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
        self.extra_whitespace_pattern = re.compile(r'\s+')
        self.markdown_link_pattern = re.compile(r'\[([^\]]+)\]\([^\)]+\)')
        self.reddit_user_pattern = re.compile(r'/?u/[a-zA-Z0-9_-]+')
        self.reddit_sub_pattern = re.compile(r'/?r/[a-zA-Z0-9_-]+')
        
        # Common stop words for text analysis
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
            'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
            'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        }
    
    def clean_title(self, title: str) -> str:
        """Clean and format a title"""
        if not title:
            return ""
        
        # Decode HTML entities
        cleaned = html.unescape(title)
        
        # Remove extra whitespace
        cleaned = self.extra_whitespace_pattern.sub(' ', cleaned).strip()
        
        # Limit length
        if len(cleaned) > 200:
            cleaned = cleaned[:197] + "..."
        
        return cleaned
    
    def clean_description(self, description: str, max_length: int = 500) -> str:
        """Clean and format a description"""
        if not description:
            return ""
        
        # Decode HTML entities
        cleaned = html.unescape(description)
        
        # Remove HTML tags
        cleaned = self.html_pattern.sub('', cleaned)
        
        # Remove markdown links but keep the text
        cleaned = self.markdown_link_pattern.sub(r'\1', cleaned)
        
        # Remove URLs
        cleaned = self.url_pattern.sub('', cleaned)
        
        # Remove Reddit user and subreddit mentions
        cleaned = self.reddit_user_pattern.sub('', cleaned)
        cleaned = self.reddit_sub_pattern.sub('', cleaned)
        
        # Remove extra whitespace
        cleaned = self.extra_whitespace_pattern.sub(' ', cleaned).strip()
        
        # Limit length
        if len(cleaned) > max_length:
            cleaned = cleaned[:max_length-3] + "..."
        
        return cleaned
    
    def extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        """Extract relevant keywords from text"""
        if not text:
            return []
        
        # Convert to lowercase and clean
        text = text.lower()
        text = self.html_pattern.sub('', text)
        text = self.url_pattern.sub('', text)
        
        # Extract words (alphanumeric only)
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text)
        
        # Remove stop words and duplicates
        keywords = []
        seen = set()
        for word in words:
            if word not in self.stop_words and word not in seen and len(word) > 2:
                keywords.append(word)
                seen.add(word)
                if len(keywords) >= max_keywords:
                    break
        
        return keywords
    
    def normalize_duration(self, duration: str) -> str:
        """Normalize duration strings to a consistent format"""
        if not duration:
            return "Unknown"
        
        duration = duration.strip().lower()
        
        # Handle common variations
        duration_patterns = [
            (r'(\d+)\s*h(?:ours?)?\s*(\d+)\s*m(?:in(?:utes?)?)?', r'\1:\2:00'),
            (r'(\d+)\s*hours?', r'\1:00:00'),
            (r'(\d+)\s*minutes?', r'0:\1:00'),
            (r'(\d+)\s*mins?', r'0:\1:00'),
            (r'(\d+)\s*h(?:ours?)?', r'\1:00:00'),
            (r'(\d+)\s*m(?:in(?:utes?)?)?', r'0:\1:00'),
            (r'(\d+):(\d+)', r'\1:\2:00'),  # Handle H:M format
        ]
        
        for pattern, replacement in duration_patterns:
            match = re.search(pattern, duration)
            if match:
                result = re.sub(pattern, replacement, duration)
                return self._format_duration(result)
        
        return duration.title()
    
    def _format_duration(self, duration: str) -> str:
        """Format duration string to ensure proper formatting"""
        try:
            parts = duration.split(':')
            if len(parts) == 3:
                hours, minutes, seconds = map(int, parts)
                if hours > 0:
                    return f"{hours}:{minutes:02d}:{seconds:02d}"
                else:
                    return f"{minutes}:{seconds:02d}"
            elif len(parts) == 2:
                minutes, seconds = map(int, parts)
                return f"{minutes}:{seconds:02d}"
        except:
            pass
        
        return duration
    
    def clean_author_name(self, author: str) -> str:
        """Clean and format author name"""
        if not author:
            return "Unknown"
        
        # Remove common prefixes/suffixes
        cleaned = author.strip()
        
        # Remove channel/user indicators
        prefixes_to_remove = ['channel:', 'user:', 'by ', '@']
        for prefix in prefixes_to_remove:
            if cleaned.lower().startswith(prefix):
                cleaned = cleaned[len(prefix):].strip()
        
        # Limit length
        if len(cleaned) > 50:
            cleaned = cleaned[:47] + "..."
        
        return cleaned or "Unknown"
    
    def extract_difficulty_indicators(self, text: str) -> List[str]:
        """Extract difficulty level indicators from text"""
        if not text:
            return []
        
        text_lower = text.lower()
        indicators = []
        
        difficulty_keywords = {
            'beginner': ['beginner', 'basic', 'intro', 'introduction', 'fundamentals', 'getting started', 'start here', 'new to'],
            'intermediate': ['intermediate', 'practical', 'hands-on', 'project', 'build', 'create', 'implement'],
            'advanced': ['advanced', 'expert', 'deep', 'complex', 'professional', 'mastery', 'optimization', 'architecture']
        }
        
        for level, keywords in difficulty_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    indicators.append(level)
                    break
        
        return list(set(indicators))  # Remove duplicates
    
    def sanitize_url(self, url: str) -> Optional[str]:
        """Sanitize and validate URL"""
        if not url:
            return None
        
        url = url.strip()
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Basic URL validation
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        if url_pattern.match(url):
            return url
        
        return None
    
    def extract_tags_from_text(self, text: str, max_tags: int = 5) -> List[str]:
        """Extract potential tags from text"""
        if not text:
            return []
        
        # Common tag patterns
        hashtag_pattern = re.compile(r'#([a-zA-Z0-9_]+)')
        hashtags = hashtag_pattern.findall(text.lower())
        
        # Technology keywords that make good tags
        tech_keywords = [
            'python', 'javascript', 'react', 'vue', 'angular', 'node', 'express',
            'django', 'flask', 'mongodb', 'sql', 'postgresql', 'mysql',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'devops',
            'machine learning', 'data science', 'ai', 'deep learning',
            'web development', 'frontend', 'backend', 'fullstack',
            'mobile', 'android', 'ios', 'flutter', 'react native',
            'tutorial', 'course', 'beginner', 'advanced', 'project'
        ]
        
        text_lower = text.lower()
        found_keywords = []
        
        for keyword in tech_keywords:
            if keyword in text_lower:
                found_keywords.append(keyword.replace(' ', '-'))
        
        # Combine hashtags and keywords
        all_tags = hashtags + found_keywords
        
        # Remove duplicates and limit
        unique_tags = list(dict.fromkeys(all_tags))[:max_tags]
        
        return unique_tags
    
    def calculate_reading_time(self, text: str, words_per_minute: int = 200) -> str:
        """Calculate estimated reading time for text"""
        if not text:
            return "0 min"
        
        # Count words
        words = len(re.findall(r'\b\w+\b', text))
        
        # Calculate time in minutes
        time_minutes = max(1, words // words_per_minute)
        
        if time_minutes < 60:
            return f"{time_minutes} min"
        else:
            hours = time_minutes // 60
            minutes = time_minutes % 60
            if minutes > 0:
                return f"{hours}h {minutes}m"
            else:
                return f"{hours}h"
