// 导入React核心库
import React from 'react';
// 导入组件样式文件
import './ContextDisplay.css';

// 定义组件接收的props类型接口
interface ContextDisplayProps {
  title: string;    // 标题文本
  content: string[]; // 内容数组,每个元素是一段文本
}

// 定义ContextDisplay组件,使用React.FC指定这是一个函数组件
// 通过解构赋值获取传入的title和content props
const ContextDisplay: React.FC<ContextDisplayProps> = ({ title, content }) => {
  return (
    // 最外层容器,使用context-display类名
    <div className="context-display">
      {/* 显示标题 */}
      <h2>{title}</h2>
      {/* 内容区域容器 */}
      <div className="context-content">
        {/* 遍历content数组,渲染每一项内容 */}
        {content.map((item, index) => (
          // 每一项内容的容器,使用index作为key
          <div key={index} className="context-item">
            {/* 显示序号和具体的文本内容 */}
            <p>[{index + 1}] {item}</p>
            {/* 如果不是最后一项,则显示两个换行 */}
            {index < content.length - 1 && (
              <>
                <br />
                <br />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 导出ContextDisplay组件供其他文件使用
export default ContextDisplay;

