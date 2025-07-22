"""
Prompt parser agent for understanding and processing user requests.
"""
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class TaskType(Enum):
    CODE_GENERATION = "code_generation"
    CODE_REVIEW = "code_review"
    DEBUGGING = "debugging"
    REFACTORING = "refactoring"
    TESTING = "testing"
    DOCUMENTATION = "documentation"

@dataclass
class ParsedPrompt:
    task_type: TaskType
    language: str
    description: str
    requirements: List[str]
    context: Optional[str] = None
    files_mentioned: List[str] = None
    complexity: str = "medium"  # low, medium, high

class PromptParser:
    """Parses user prompts to extract task information and requirements."""
    
    def __init__(self):
        self.language_patterns = {
            'python': r'\b(python|py|\.py)\b',
            'javascript': r'\b(javascript|js|\.js|node)\b',
            'typescript': r'\b(typescript|ts|\.ts)\b',
            'java': r'\b(java|\.java)\b',
            'cpp': r'\b(c\+\+|cpp|\.cpp)\b',
            'c': r'\b(?<!c\+\+)c(?!\+\+)|\b\.c\b',
            'go': r'\b(golang|go|\.go)\b',
            'rust': r'\b(rust|\.rs)\b',
            'php': r'\b(php|\.php)\b',
            'ruby': r'\b(ruby|\.rb)\b'
        }
        
        self.task_patterns = {
            TaskType.CODE_GENERATION: [
                r'\b(create|generate|write|build|make|implement)\b',
                r'\b(function|class|module|script|program)\b'
            ],
            TaskType.CODE_REVIEW: [
                r'\b(review|check|analyze|examine|audit)\b',
                r'\b(code|implementation)\b'
            ],
            TaskType.DEBUGGING: [
                r'\b(debug|fix|error|bug|issue|problem)\b',
                r'\b(not working|broken|failing)\b'
            ],
            TaskType.REFACTORING: [
                r'\b(refactor|improve|optimize|clean|restructure)\b',
                r'\b(performance|efficiency)\b'
            ],
            TaskType.TESTING: [
                r'\b(test|testing|unit test|integration test)\b',
                r'\b(pytest|jest|junit)\b'
            ],
            TaskType.DOCUMENTATION: [
                r'\b(document|documentation|docs|comment)\b',
                r'\b(readme|docstring|api doc)\b'
            ]
        }
    
    def parse(self, prompt: str) -> ParsedPrompt:
        """Parse a user prompt and extract structured information."""
        prompt_lower = prompt.lower()
        
        # Detect programming language
        language = self._detect_language(prompt_lower)
        
        # Detect task type
        task_type = self._detect_task_type(prompt_lower)
        
        # Extract requirements
        requirements = self._extract_requirements(prompt)
        
        # Extract file mentions
        files_mentioned = self._extract_file_mentions(prompt)
        
        # Determine complexity
        complexity = self._assess_complexity(prompt_lower, requirements)
        
        return ParsedPrompt(
            task_type=task_type,
            language=language,
            description=prompt.strip(),
            requirements=requirements,
            files_mentioned=files_mentioned,
            complexity=complexity
        )
    
    def _detect_language(self, prompt: str) -> str:
        """Detect the programming language from the prompt."""
        for lang, pattern in self.language_patterns.items():
            if re.search(pattern, prompt, re.IGNORECASE):
                return lang
        return "python"  # Default to Python
    
    def _detect_task_type(self, prompt: str) -> TaskType:
        """Detect the type of task from the prompt."""
        task_scores = {}
        
        for task_type, patterns in self.task_patterns.items():
            score = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, prompt, re.IGNORECASE))
                score += matches
            task_scores[task_type] = score
        
        # Return the task type with the highest score
        if task_scores:
            best_task = max(task_scores, key=task_scores.get)
            if task_scores[best_task] > 0:
                return best_task
        
        return TaskType.CODE_GENERATION  # Default
    
    def _extract_requirements(self, prompt: str) -> List[str]:
        """Extract specific requirements from the prompt."""
        requirements = []
        
        # Look for requirement indicators
        requirement_patterns = [
            r'should\s+(.+?)(?:\.|$)',
            r'must\s+(.+?)(?:\.|$)',
            r'need\s+to\s+(.+?)(?:\.|$)',
            r'requirements?:\s*(.+?)(?:\n|$)',
            r'specs?:\s*(.+?)(?:\n|$)'
        ]
        
        for pattern in requirement_patterns:
            matches = re.findall(pattern, prompt, re.IGNORECASE | re.MULTILINE)
            requirements.extend([match.strip() for match in matches])
        
        return requirements
    
    def _extract_file_mentions(self, prompt: str) -> List[str]:
        """Extract file names mentioned in the prompt."""
        # Pattern to match file names with extensions
        file_pattern = r'\b[\w\-\.]+\.[a-zA-Z]{1,4}\b'
        files = re.findall(file_pattern, prompt)
        return list(set(files))  # Remove duplicates
    
    def _assess_complexity(self, prompt: str, requirements: List[str]) -> str:
        """Assess the complexity of the task."""
        complexity_indicators = {
            'high': [
                'complex', 'advanced', 'sophisticated', 'enterprise',
                'scalable', 'distributed', 'microservice', 'architecture'
            ],
            'low': [
                'simple', 'basic', 'quick', 'small', 'minimal', 'easy'
            ]
        }
        
        word_count = len(prompt.split())
        requirement_count = len(requirements)
        
        # Check for complexity keywords
        for level, keywords in complexity_indicators.items():
            if any(keyword in prompt for keyword in keywords):
                return level
        
        # Assess based on length and requirements
        if word_count > 100 or requirement_count > 5:
            return 'high'
        elif word_count < 20 and requirement_count <= 2:
            return 'low'
        
        return 'medium'
