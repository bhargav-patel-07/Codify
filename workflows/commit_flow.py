"""
Commit flow workflow for managing code commits and version control.
"""
import os
import subprocess
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

from backend.services.github_service import GitHubService

class CommitStatus(Enum):
    PENDING = "pending"
    STAGED = "staged"
    COMMITTED = "committed"
    PUSHED = "pushed"
    FAILED = "failed"

@dataclass
class CommitInfo:
    id: str
    message: str
    files: List[str]
    status: CommitStatus
    timestamp: datetime
    author: str
    branch: str
    hash: Optional[str] = None
    error: Optional[str] = None

class CommitFlow:
    """Manages git operations and commit workflows."""
    
    def __init__(self, repo_path: str = ".", github_service: Optional[GitHubService] = None):
        self.repo_path = repo_path
        self.github_service = github_service or GitHubService()
        self.commits: Dict[str, CommitInfo] = {}
    
    def init_repository(self) -> bool:
        """Initialize a git repository."""
        try:
            result = subprocess.run(
                ["git", "init"],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def get_repository_status(self) -> Dict[str, Any]:
        """Get the current repository status."""
        try:
            # Get current branch
            branch_result = subprocess.run(
                ["git", "branch", "--show-current"],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            current_branch = branch_result.stdout.strip() if branch_result.returncode == 0 else "unknown"
            
            # Get status
            status_result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            
            if status_result.returncode == 0:
                status_lines = status_result.stdout.strip().split('\n') if status_result.stdout.strip() else []
                
                modified_files = []
                untracked_files = []
                staged_files = []
                
                for line in status_lines:
                    if line:
                        status_code = line[:2]
                        filename = line[3:]
                        
                        if status_code[0] in ['M', 'A', 'D', 'R', 'C']:
                            staged_files.append(filename)
                        if status_code[1] in ['M', 'D']:
                            modified_files.append(filename)
                        if status_code == '??':
                            untracked_files.append(filename)
                
                return {
                    "current_branch": current_branch,
                    "staged_files": staged_files,
                    "modified_files": modified_files,
                    "untracked_files": untracked_files,
                    "is_clean": len(status_lines) == 0
                }
            else:
                return {"error": "Failed to get repository status"}
        except Exception as e:
            return {"error": str(e)}
    
    def stage_files(self, files: List[str]) -> bool:
        """Stage files for commit."""
        try:
            for file in files:
                result = subprocess.run(
                    ["git", "add", file],
                    cwd=self.repo_path,
                    capture_output=True,
                    text=True
                )
                if result.returncode != 0:
                    return False
            return True
        except Exception:
            return False
    
    def stage_all_files(self) -> bool:
        """Stage all modified and untracked files."""
        try:
            result = subprocess.run(
                ["git", "add", "."],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def create_commit(self, message: str, files: List[str] = None, author: str = None) -> Optional[CommitInfo]:
        """Create a commit with the specified message and files."""
        try:
            # Stage files if specified
            if files:
                if not self.stage_files(files):
                    return None
            
            # Create commit command
            commit_cmd = ["git", "commit", "-m", message]
            if author:
                commit_cmd.extend(["--author", author])
            
            result = subprocess.run(
                commit_cmd,
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                # Get commit hash
                hash_result = subprocess.run(
                    ["git", "rev-parse", "HEAD"],
                    cwd=self.repo_path,
                    capture_output=True,
                    text=True
                )
                commit_hash = hash_result.stdout.strip() if hash_result.returncode == 0 else None
                
                # Get current branch
                branch_result = subprocess.run(
                    ["git", "branch", "--show-current"],
                    cwd=self.repo_path,
                    capture_output=True,
                    text=True
                )
                current_branch = branch_result.stdout.strip() if branch_result.returncode == 0 else "main"
                
                commit_info = CommitInfo(
                    id=commit_hash or f"commit_{datetime.now().timestamp()}",
                    message=message,
                    files=files or [],
                    status=CommitStatus.COMMITTED,
                    timestamp=datetime.now(),
                    author=author or "CodingAgent",
                    branch=current_branch,
                    hash=commit_hash
                )
                
                self.commits[commit_info.id] = commit_info
                return commit_info
            else:
                return None
        except Exception as e:
            return None
    
    def push_to_remote(self, remote: str = "origin", branch: str = None) -> bool:
        """Push commits to remote repository."""
        try:
            if branch is None:
                # Get current branch
                branch_result = subprocess.run(
                    ["git", "branch", "--show-current"],
                    cwd=self.repo_path,
                    capture_output=True,
                    text=True
                )
                branch = branch_result.stdout.strip() if branch_result.returncode == 0 else "main"
            
            result = subprocess.run(
                ["git", "push", remote, branch],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def create_branch(self, branch_name: str, checkout: bool = True) -> bool:
        """Create a new branch."""
        try:
            # Create branch
            result = subprocess.run(
                ["git", "branch", branch_name],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0 and checkout:
                # Checkout the new branch
                checkout_result = subprocess.run(
                    ["git", "checkout", branch_name],
                    cwd=self.repo_path,
                    capture_output=True,
                    text=True
                )
                return checkout_result.returncode == 0
            
            return result.returncode == 0
        except Exception:
            return False
    
    def switch_branch(self, branch_name: str) -> bool:
        """Switch to a different branch."""
        try:
            result = subprocess.run(
                ["git", "checkout", branch_name],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def get_commit_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get commit history."""
        try:
            result = subprocess.run(
                ["git", "log", f"--max-count={limit}", "--pretty=format:%H|%s|%an|%ad", "--date=iso"],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                commits = []
                for line in result.stdout.strip().split('\n'):
                    if line:
                        parts = line.split('|')
                        if len(parts) >= 4:
                            commits.append({
                                "hash": parts[0],
                                "message": parts[1],
                                "author": parts[2],
                                "date": parts[3]
                            })
                return commits
            else:
                return []
        except Exception:
            return []
    
    def generate_commit_message(self, files: List[str], changes_summary: str = "") -> str:
        """Generate a commit message based on files and changes."""
        if not files:
            return "Update project files"
        
        # Analyze file types
        file_types = set()
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.go', '.rs']:
                file_types.add('code')
            elif ext in ['.md', '.txt', '.rst']:
                file_types.add('docs')
            elif ext in ['.json', '.yaml', '.yml', '.toml', '.ini']:
                file_types.add('config')
            elif ext in ['.html', '.css', '.scss']:
                file_types.add('frontend')
        
        # Generate message based on file types
        if 'code' in file_types:
            if len(files) == 1:
                return f"Update {os.path.basename(files[0])}"
            else:
                return f"Update {len(files)} code files"
        elif 'docs' in file_types:
            return "Update documentation"
        elif 'config' in file_types:
            return "Update configuration files"
        elif 'frontend' in file_types:
            return "Update frontend files"
        else:
            return f"Update {len(files)} files"
    
    def auto_commit_workflow(self, message: str = None, push: bool = False) -> Optional[CommitInfo]:
        """Automated commit workflow."""
        try:
            # Get repository status
            status = self.get_repository_status()
            if status.get("error"):
                return None
            
            # Check if there are changes to commit
            if status.get("is_clean", True):
                return None
            
            # Stage all changes
            if not self.stage_all_files():
                return None
            
            # Generate commit message if not provided
            if not message:
                all_files = (status.get("modified_files", []) + 
                           status.get("untracked_files", []))
                message = self.generate_commit_message(all_files)
            
            # Create commit
            commit_info = self.create_commit(message)
            if not commit_info:
                return None
            
            # Push if requested
            if push:
                if self.push_to_remote():
                    commit_info.status = CommitStatus.PUSHED
                else:
                    commit_info.error = "Failed to push to remote"
            
            return commit_info
        except Exception as e:
            return None
    
    def create_pull_request(self, owner: str, repo: str, title: str, body: str, head_branch: str, base_branch: str = "main") -> Optional[Dict[str, Any]]:
        """Create a pull request using GitHub service."""
        try:
            if self.github_service:
                return self.github_service.create_pull_request(
                    owner, repo, title, body, head_branch, base_branch
                )
            else:
                return None
        except Exception:
            return None
    
    def setup_remote(self, remote_url: str, remote_name: str = "origin") -> bool:
        """Set up a remote repository."""
        try:
            # Check if remote already exists
            result = subprocess.run(
                ["git", "remote", "get-url", remote_name],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                # Remote exists, update it
                result = subprocess.run(
                    ["git", "remote", "set-url", remote_name, remote_url],
                    cwd=self.repo_path,
                    capture_output=True,
                    text=True
                )
            else:
                # Remote doesn't exist, add it
                result = subprocess.run(
                    ["git", "remote", "add", remote_name, remote_url],
                    cwd=self.repo_path,
                    capture_output=True,
                    text=True
                )
            
            return result.returncode == 0
        except Exception:
            return False
