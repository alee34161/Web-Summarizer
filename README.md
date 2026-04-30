# Web-Summarizer
Users will provide a URL which the web app will summarize into bullet points using AI.

## Functionality
- Bulleted Summary
- Sources and applicable hyperlinks
- Search Bar
- History List
- Local Storage data
- Serverless AWS Lambda function use
- AWS Bedrock for AI implementation

## Limitations
- Maximum tokens allowed from webpage; if the URL's html is too long the function will fail.
- If webpage does not allow scraping the AI will have nothing to work with.
- Set to 1 min timeout before automatically sending a 503 error.