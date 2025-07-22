"""
GitHub integration service for repository operations.
"""
import os
import requests
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import base64

@dataclass
class GitHubRepo:
    name: str
    full_name: str
    description: str
    url: str
    clone_url: str
    default_branch: str

@dataclass
class GitHubFile:
    name: str
    path: str
    content: str
    sha: str
    size: int

class GitHubService:
    """Service for interacting with GitHub API."""
    
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CodingAgent/1.0"
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"
    
    def get_user_repos(self, username: str) -> List[GitHubRepo]:
        """Get repositories for a user."""
        url = f"{self.base_url}/users/{username}/repos"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            repos_data = response.json()
            return [
                GitHubRepo(
                    name=repo["name"],
                    full_name=repo["full_name"],
                    description=repo["description"] or "",
                    url=repo["html_url"],
                    clone_url=repo["clone_url"],
                    default_branch=repo["default_branch"]
                )
                for repo in repos_data
            ]
        else:
            raise Exception(f"Failed to fetch repositories: {response.status_code}")
    
    def get_repo_contents(self, owner: str, repo: str, path: str = "") -> List[Dict[str, Any]]:
        """Get contents of a repository directory."""
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to fetch repo contents: {response.status_code}")
    
    def get_file_content(self, owner: str, repo: str, path: str) -> GitHubFile:
        """Get content of a specific file."""
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            file_data = response.json()
            content = base64.b64decode(file_data["content"]).decode("utf-8")
            
            return GitHubFile(
                name=file_data["name"],
                path=file_data["path"],
                content=content,
                sha=file_data["sha"],
                size=file_data["size"]
            )
        else:
            raise Exception(f"Failed to fetch file content: {response.status_code}")
    
    def create_file(self, owner: str, repo: str, path: str, content: str, message: str) -> Dict[str, Any]:
        """Create a new file in the repository."""
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}"
        
        data = {
            "message": message,
            "content": base64.b64encode(content.encode("utf-8")).decode("utf-8")
        }
        
        response = requests.put(url, json=data, headers=self.headers)
        
        if response.status_code == 201:
            return response.json()
        else:
            raise Exception(f"Failed to create file: {response.status_code}")
    
    def update_file(self, owner: str, repo: str, path: str, content: str, message: str, sha: str) -> Dict[str, Any]:
        """Update an existing file in the repository."""
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}"
        
        data = {
            "message": message,
            "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
            "sha": sha
        }
        
        response = requests.put(url, json=data, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to update file: {response.status_code}")
    
    def create_pull_request(self, owner: str, repo: str, title: str, body: str, head: str, base: str = "main") -> Dict[str, Any]:
        """Create a pull request."""
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls"
        
        data = {
            "title": title,
            "body": body,
            "head": head,
            "base": base
        }
        
        response = requests.post(url, json=data, headers=self.headers)
        
        if response.status_code == 201:
            return response.json()
        else:
            raise Exception(f"Failed to create pull request: {response.status_code}")
    
    def get_repo_languages(self, owner: str, repo: str) -> Dict[str, int]:
        """Get programming languages used in a repository."""
        url = f"{self.base_url}/repos/{owner}/{repo}/languages"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to fetch repo languages: {response.status_code}")
    
    def search_repositories(self, query: str, language: Optional[str] = None) -> List[GitHubRepo]:
        """Search for repositories."""
        search_query = query
        if language:
            search_query += f" language:{language}"
        
        url = f"{self.base_url}/search/repositories"
        params = {"q": search_query, "sort": "stars", "order": "desc"}
        
        response = requests.get(url, params=params, headers=self.headers)
        
        if response.status_code == 200:
            search_results = response.json()
            return [
                GitHubRepo(
                    name=repo["name"],
                    full_name=repo["full_name"],
                    description=repo["description"] or "",
                    url=repo["html_url"],
                    clone_url=repo["clone_url"],
                    default_branch=repo["default_branch"]
                )
                for repo in search_results["items"]
            ]
        else:
            raise Exception(f"Failed to search repositories: {response.status_code}")
