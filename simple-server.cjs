const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// 基础中间件
app.use(helmet());
app.use(cors());
app.use(express.json());

// 简单的内存数据存储
const memories = [];
const users = [];
const projects = [];

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 内存相关API
app.get('/api/v1/memories', (req, res) => {
  res.json({ memories, count: memories.length });
});

app.post('/api/v1/memories', (req, res) => {
  const memory = {
    id: Date.now().toString(),
    ...req.body,
    timestamp: new Date().toISOString()
  };
  memories.push(memory);
  res.json(memory);
});

// 用户相关API
app.get('/api/v1/users', (req, res) => {
  res.json({ users, count: users.length });
});

app.post('/api/v1/users', (req, res) => {
  const user = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  res.json(user);
});

// 项目相关API
app.get('/api/v1/projects', (req, res) => {
  res.json({ projects, count: projects.length });
});

app.post('/api/v1/projects', (req, res) => {
  const project = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  projects.push(project);
  res.json(project);
});

// OpenAI兼容接口
app.post('/v1/chat/completions', (req, res) => {
  const { messages, model, stream } = req.body;
  
  if (stream) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    
    res.write('data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n');
    
    setTimeout(() => {
      res.write('data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"content":"这是一个模拟的AI响应。"},"finish_reason":null}]}\n\n');
      res.write('data: [DONE]\n\n');
      res.end();
    }, 1000);
  } else {
    res.json({
      id: 'chatcmpl-123',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || 'gpt-3.5-turbo',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: '这是一个模拟的AI响应。'
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 10,
        total_tokens: 20
      }
    });
  }
});

// 默认路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'SuperMemory API Server (Simplified)', 
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /api/v1/memories',
      'POST /api/v1/memories',
      'GET /api/v1/users',
      'POST /api/v1/users',
      'GET /api/v1/projects',
      'POST /api/v1/projects',
      'POST /v1/chat/completions'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simplified API server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API endpoints: http://localhost:${PORT}/api/v1/*`);
});