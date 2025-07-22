"""
Task runner workflow for managing coding tasks.
"""
import asyncio
import uuid
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import json

from backend.agents.prompt_parser import PromptParser, ParsedPrompt
from backend.agents.coder import CoderAgent, CodeResult
from backend.services.piston_service import PistonService
from backend.services.test_service import TestService

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class Task:
    id: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    result: Optional[CodeResult] = None
    error: Optional[str] = None
    progress: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

class TaskRunner:
    """Manages and executes coding tasks."""
    
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.prompt_parser = PromptParser()
        self.coder_agent = CoderAgent()
        self.piston_service = PistonService()
        self.test_service = TestService()
        self.running_tasks: Dict[str, asyncio.Task] = {}
    
    def create_task(self, description: str, metadata: Dict[str, Any] = None) -> str:
        """Create a new coding task."""
        task_id = str(uuid.uuid4())
        task = Task(
            id=task_id,
            description=description,
            metadata=metadata or {}
        )
        self.tasks[task_id] = task
        return task_id
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """Get a task by ID."""
        return self.tasks.get(task_id)
    
    def get_all_tasks(self) -> List[Task]:
        """Get all tasks."""
        return list(self.tasks.values())
    
    def get_tasks_by_status(self, status: TaskStatus) -> List[Task]:
        """Get tasks by status."""
        return [task for task in self.tasks.values() if task.status == status]
    
    async def execute_task(self, task_id: str) -> Task:
        """Execute a coding task."""
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")
        
        if task.status != TaskStatus.PENDING:
            raise ValueError(f"Task {task_id} is not in pending status")
        
        # Create async task for execution
        async_task = asyncio.create_task(self._run_task(task))
        self.running_tasks[task_id] = async_task
        
        try:
            return await async_task
        finally:
            self.running_tasks.pop(task_id, None)
    
    async def _run_task(self, task: Task) -> Task:
        """Internal method to run a task."""
        try:
            task.status = TaskStatus.RUNNING
            task.updated_at = datetime.now()
            task.progress = 10
            
            # Step 1: Parse the prompt
            parsed_prompt = self.prompt_parser.parse(task.description)
            task.progress = 30
            
            # Step 2: Generate code
            code_result = self.coder_agent.generate_code(parsed_prompt)
            task.progress = 60
            
            # Step 3: Validate/test code if applicable
            if code_result.code and parsed_prompt.language:
                try:
                    validation = self.piston_service.validate_code_syntax(
                        parsed_prompt.language, 
                        code_result.code
                    )
                    code_result.metadata = {"validation": validation}
                except Exception as e:
                    # Validation failed, but don't fail the entire task
                    code_result.metadata = {"validation_error": str(e)}
            
            task.progress = 90
            
            # Step 4: Complete task
            task.result = code_result
            task.status = TaskStatus.COMPLETED
            task.progress = 100
            task.updated_at = datetime.now()
            
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            task.updated_at = datetime.now()
        
        return task
    
    def cancel_task(self, task_id: str) -> bool:
        """Cancel a running task."""
        task = self.tasks.get(task_id)
        if not task:
            return False
        
        if task.status == TaskStatus.RUNNING:
            async_task = self.running_tasks.get(task_id)
            if async_task:
                async_task.cancel()
            
            task.status = TaskStatus.CANCELLED
            task.updated_at = datetime.now()
            return True
        
        return False
    
    def delete_task(self, task_id: str) -> bool:
        """Delete a task."""
        if task_id in self.tasks:
            # Cancel if running
            self.cancel_task(task_id)
            del self.tasks[task_id]
            return True
        return False
    
    def get_task_statistics(self) -> Dict[str, Any]:
        """Get statistics about tasks."""
        total_tasks = len(self.tasks)
        status_counts = {}
        
        for status in TaskStatus:
            status_counts[status.value] = len(self.get_tasks_by_status(status))
        
        return {
            "total_tasks": total_tasks,
            "status_counts": status_counts,
            "running_tasks": len(self.running_tasks)
        }
    
    async def execute_batch_tasks(self, task_ids: List[str], max_concurrent: int = 3) -> List[Task]:
        """Execute multiple tasks concurrently."""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def execute_with_semaphore(task_id: str) -> Task:
            async with semaphore:
                return await self.execute_task(task_id)
        
        tasks = [execute_with_semaphore(task_id) for task_id in task_ids]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    def export_task_results(self, task_ids: List[str] = None) -> Dict[str, Any]:
        """Export task results to a dictionary."""
        if task_ids is None:
            tasks_to_export = self.tasks.values()
        else:
            tasks_to_export = [self.tasks[tid] for tid in task_ids if tid in self.tasks]
        
        exported_tasks = []
        for task in tasks_to_export:
            task_data = {
                "id": task.id,
                "description": task.description,
                "status": task.status.value,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
                "progress": task.progress,
                "metadata": task.metadata
            }
            
            if task.result:
                task_data["result"] = {
                    "code": task.result.code,
                    "explanation": task.result.explanation,
                    "tests": task.result.tests,
                    "documentation": task.result.documentation,
                    "dependencies": task.result.dependencies
                }
            
            if task.error:
                task_data["error"] = task.error
            
            exported_tasks.append(task_data)
        
        return {
            "tasks": exported_tasks,
            "exported_at": datetime.now().isoformat(),
            "total_count": len(exported_tasks)
        }
    
    def save_tasks_to_file(self, filename: str, task_ids: List[str] = None):
        """Save tasks to a JSON file."""
        data = self.export_task_results(task_ids)
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_tasks_from_file(self, filename: str):
        """Load tasks from a JSON file."""
        with open(filename, 'r') as f:
            data = json.load(f)
        
        for task_data in data.get("tasks", []):
            task = Task(
                id=task_data["id"],
                description=task_data["description"],
                status=TaskStatus(task_data["status"]),
                created_at=datetime.fromisoformat(task_data["created_at"]),
                updated_at=datetime.fromisoformat(task_data["updated_at"]),
                progress=task_data["progress"],
                metadata=task_data.get("metadata", {})
            )
            
            if "result" in task_data:
                result_data = task_data["result"]
                task.result = CodeResult(
                    code=result_data["code"],
                    explanation=result_data["explanation"],
                    tests=result_data.get("tests"),
                    documentation=result_data.get("documentation"),
                    dependencies=result_data.get("dependencies", [])
                )
            
            if "error" in task_data:
                task.error = task_data["error"]
            
            self.tasks[task.id] = task
