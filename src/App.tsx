// 导入必要的React库和组件
import React, { useState } from 'react'; // 导入React核心库和useState钩子
import ChatBot from './components/ChatBot'; // 导入聊天机器人组件
import ContextDisplay from './components/ContextDisplay'; // 导入上下文显示组件
import './App.css'; // 导入样式文件

// 定义App组件,使用React.FC表示这是一个函数组件(Function Component)
const App: React.FC = () => {
  // 使用useState钩子定义状态
  // baihuawenContext用于存储白话文内容,是一个字符串数组
  const [baihuawenContext, setBaihuawenContext] = useState<string[]>([]);
  // originalTextContext用于存储原文内容,也是一个字符串数组
  const [originalTextContext, setOriginalTextContext] = useState<string[]>([]);

  // 定义处理上下文更新的函数
  // 接收白话文和原文两个参数,都是字符串数组类型
  const handleContextUpdate = (baihuawen: string[], originalText: string[]) => {
    console.log(baihuawen);
    console.log(originalText);
    setBaihuawenContext(baihuawen); // 更新白话文状态
    setOriginalTextContext(originalText); // 更新原文状态
  };

  // 渲染组件
  return (
    // 最外层容器
    <div className="app-container">
      {/* 聊天区域容器 */}
      <div className="chat-container">
        {/* 聊天机器人组件,传入上下文更新处理函数 */}
        <ChatBot onContextUpdate={handleContextUpdate} />
      </div>
      {/* 上下文显示区域容器 */}
      <div className="context-container">
        {/* 显示白话文上下文 */}
        <ContextDisplay title="白话文上下文" content={baihuawenContext} />
        {/* 显示原文上下文 */}
        <ContextDisplay title="原文上下文" content={originalTextContext} />
      </div>
    </div>
  );
};

// 导出App组件
export default App;

