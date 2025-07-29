
# AI Craftworks Python Backend

This is a sample FastAPI backend for AI Craftworks that provides API endpoints for various AI features.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install fastapi uvicorn pydantic python-multipart PyJWT
   ```

   For a full AI implementation, you would also need:
   ```bash
   pip install openai langchain yfinance pytube
   ```

4. Set your API keys and Supabase secret as environment variables:
   - On Windows:
     ```bash
     set OPENAI_API_KEY=your_openai_api_key
     set SUPABASE_JWT_SECRET=your_supabase_jwt_secret
     ```
   - On macOS/Linux:
     ```bash
     export OPENAI_API_KEY=your_openai_api_key
     export SUPABASE_JWT_SECRET=your_supabase_jwt_secret
     ```

### Running the Server

Start the FastAPI server:
```bash
python main.py
```

The API will be available at http://localhost:8000

### API Documentation

FastAPI automatically generates interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Integrating with the Frontend

1. Set the backend URL in your frontend `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. Use the `apiHelpers.ts` utility functions to make requests to this API.

## Production Deployment

For production, you should:

1. Set up proper authentication with JWT tokens
2. Configure CORS to only allow your frontend domain
3. Deploy to a cloud service like:
   - AWS Lambda with API Gateway
   - Google Cloud Run
   - Heroku
   - DigitalOcean App Platform

### Supabase Configuration

1. Open your Supabase project and navigate to **Project Settings > API**.
2. Copy the **JWT secret** value.
3. Set this value as the `SUPABASE_JWT_SECRET` environment variable used by the backend.

## Further Customization

To implement the actual AI functionality:
1. Uncomment and configure the AI service code in each endpoint
2. Add error handling and rate limiting
3. Set up proper caching for expensive operations
