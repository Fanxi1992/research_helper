// 导入必要的React库和钩子函数
import React, { useState, useEffect, useRef } from 'react';
// 导入样式文件
import './ChatBot.css';

// 定义消息类型接口
interface Message {
  type: 'user' | 'bot';    // 消息类型:用户消息或机器人消息
  content: string;         // 消息内容
}

// 定义ChatBot组件的props接口
interface ChatBotProps {
  // 定义一个回调函数类型,用于更新上下文
  // 该函数接收两个字符串数组参数:白话文和原文
  onContextUpdate: (baihuawen: string[], originalText: string[]) => void;
}

// 定义ChatBot组件,使用React.FC指定这是一个函数组件
// 通过解构赋值获取传入的onContextUpdate函数
const ChatBot: React.FC<ChatBotProps> = ({ onContextUpdate }) => {
  // 使用useState定义组件状态
  const [messages, setMessages] = useState<Message[]>([]); // 存储聊天消息历史
  const [input, setInput] = useState('');                  // 存储输入框的值
  const [isLoading, setIsLoading] = useState(false);       // 标记是否正在加载
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.0-flash-thinking-exp:free'); // 添加这一行
  // 使用useRef创建对消息列表末尾的引用,用于自动滚动
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 使用useEffect在消息更新时自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 处理表单提交的函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表单默认提交行为
    if (!input.trim()) return; // 如果输入为空,直接返回

    // 创建用户消息对象并添加到消息列表
    const userMessage: Message = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput(''); // 清空输入框
    setIsLoading(true); // 设置加载状态

    try {
      // 发送POST请求到后端API
      const response = await fetch('http://127.0.0.1:8000/api/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 23422' // 认证token
        },
        body: JSON.stringify({ query: input, model: selectedModel }) // 发送用户输入和选择的模型
      });

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 获取响应数据的读取器
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let botResponse = ''; // 存储机器人的完整响应
      // 添加一个空的机器人消息,等待填充内容
      setMessages(prev => [...prev, { type: 'bot', content: '' }]);

      // 循环读取流式响应数据
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 将二进制数据转换为文本
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        // 处理每一行数据
        for (const line of lines) {
          if (line.trim() === '' || !line.startsWith('data: ')) continue;

          try {
            const jsonStr = line.slice(5); // 移除 'data: ' 前缀
            const parsedData = JSON.parse(jsonStr);

            // 根据event类型处理不同的数据
            if (parsedData.event === 'cmpl') {
              // 处理大模型的回答内容
              botResponse += parsedData.text;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = botResponse;
                return newMessages;
              });
            } else if (parsedData.event === 'data_source') {
              // 处理数据源文本,更新上下文显示
              const contextData = JSON.parse(parsedData.text);
              onContextUpdate(
                contextData.baihuawen,
                contextData.original_text
              );
            }
          } catch (parseError) {
            console.error('解析 JSON 出错:', parseError, '行:', line);
            continue;
          }
        }
      }

      // 如果没有收到有效响应,抛出错误
      if (!botResponse) {
        throw new Error('No valid response received from the server');
      }

    } catch (error) {
      // 错误处理
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}` 
      }]);
    } finally {
      setIsLoading(false); // 无论成功失败,都结束加载状态
    }
  };

  // 渲染聊天界面
  return (
    <div className="chatbot">
      {/* 消息显示区域 */}
      <div className="chat-messages">
        {/* 遍历渲染所有消息 */}
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.content}
          </div>
        ))}
        {/* 用于自动滚动的空div */}
        <div ref={messagesEndRef} />
      </div>
      {/* 输入表单 */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="在此输入消息..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '发送中...' : '发送'}
        </button>
        {/* 添加模型选择下拉框 */}
        <select 
          value={selectedModel} 
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isLoading}
        >
          <option value="google/gemini-2.0-flash-thinking-exp:free">google/gemini-2.0-flash-thinking-exp:free</option>
          <option value="google/gemini-2.0-flash-exp:free">google/gemini-2.0-flash-exp:free</option>
          <option value="google/gemini-exp-1206:free">google/gemini-exp-1206:free</option>
          <option value="google/gemini-pro-1.5">google/gemini-pro-1.5</option>
        </select>
      </form>
    </div>
  );
};

// 导出ChatBot组件
export default ChatBot;

