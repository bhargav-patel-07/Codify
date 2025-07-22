# Coding Agent

An AI-powered coding assistant that helps with code generation, analysis, testing, and repository management.

## Features

- **Code Generation**: Generate code from natural language descriptions
- **Code Analysis**: Review and analyze existing code for improvements
- **Testing**: Automated test generation and execution
- **GitHub Integration**: Repository management and pull request creation
- **Task Management**: Asynchronous task execution and tracking
- **Multi-language Support**: Python, JavaScript, Java, C++, Go, Rust, and more

## Project Structure

```
coding-agent/
├── backend/
│   ├── api/                 # API routes and endpoints
│   ├── agents/              # AI agents (prompt parser, coder)
│   ├── services/            # External services (GitHub, Piston, testing)
│   └── main.py             # FastAPI application entry point
├── frontend/               # Optional frontend (to be implemented)
├── workflows/              # Task and commit management workflows
│   ├── task_runner.py      # Task execution and management
│   └── commit_flow.py      # Git operations and commit workflows
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables
└── README.md              # This file
```

## Setup

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   - Copy `.env` file and update with your credentials
   - Set `GITHUB_TOKEN` for GitHub integration
   - Configure other settings as needed

4. **Run the application**:
   ```bash
   python backend/main.py
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

### Core Endpoints
- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /api/generate` - Generate code from prompt

### Task Management
- `POST /api/tasks` - Create a new coding task
- `GET /api/tasks/{task_id}` - Get task status
- `POST /api/analyze` - Analyze code for improvements
- `GET /api/languages` - Get supported programming languages

## Usage Examples

### Generate Code
```bash
curl -X POST "http://localhost:8000/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a Python function to calculate fibonacci numbers",
    "language": "python"
  }'
```

### Create Task
```bash
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a REST API for user management",
    "language": "python",
    "requirements": "Use FastAPI and include CRUD operations"
  }'
```

## Components

### Agents
- **PromptParser**: Analyzes user prompts to extract task information
- **CoderAgent**: Generates code based on parsed requirements

### Services
- **GitHubService**: GitHub API integration for repository operations
- **PistonService**: Code execution using Piston API
- **TestService**: Automated testing and validation

### Workflows
- **TaskRunner**: Manages asynchronous task execution
- **CommitFlow**: Handles git operations and commit workflows

## Configuration

Key environment variables:

- `PORT`: Server port (default: 8000)
- `GITHUB_TOKEN`: GitHub personal access token
- `PISTON_API_URL`: Piston API endpoint for code execution
- `MAX_CONCURRENT_TASKS`: Maximum concurrent task execution
- `TASK_TIMEOUT_SECONDS`: Task execution timeout

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
flake8 .
```

### Type Checking
```bash
mypy backend/
```

## Supported Languages

- Python
- JavaScript/TypeScript
- Java
- C/C++
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- And more...

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.
