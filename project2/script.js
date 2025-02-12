// 格式化消息文本
function formatMessage(text) {
    if (!text) return '';
    
    // 处理标题和换行
    let lines = text.split('\n');
    let formattedLines = lines.map(line => {
        // 处理标题（**文本**）
        line = line.replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>');
        return line;
    });
    
    // 将 ### 替换为换行，并确保每个部分都是一个段落
    let processedText = formattedLines.join('\n');
    let sections = processedText
        .split('###')
        .filter(section => section.trim())
        .map(section => {
            // 移除多余的换行和空格
            let lines = section.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) return '';
            
            // 处理每个部分
            let result = '';
            let currentIndex = 0;
            
            while (currentIndex < lines.length) {
                let line = lines[currentIndex].trim();
                
                // 如果是数字开头（如 "1.")
                if (/^\d+\./.test(line)) {
                    result += `<p class="section-title">${line}</p>`;
                }
                // 如果是小标题（以破折号开头）
                else if (line.startsWith('-')) {
                    result += `<p class="subsection"><span class="bold-text">${line.replace(/^-/, '').trim()}</span></p>`;
                }
                // 如果是正文（包含冒号的行）
                else if (line.includes(':')) {
                    let [subtitle, content] = line.split(':').map(part => part.trim());
                    result += `<p><span class="subtitle">${subtitle}</span>: ${content}</p>`;
                }
                // 普通文本
                else {
                    result += `<p>${line}</p>`;
                }
                currentIndex++;
            }
            return result;
        });
    
    return sections.join('');
}

// 显示消息
function displayMessage(role, message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const avatar = document.createElement('img');
    avatar.src = role === 'user' ? 'user-avatar.png' : 'bot-avatar.png';
    avatar.alt = role === 'user' ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // 用户消息直接显示，机器人消息需要格式化
    messageContent.innerHTML = role === 'user' ? message : formatMessage(message);

    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    
    // 平滑滚动到底部
    messageElement.scrollIntoView({ behavior: 'smooth' });
}

function sendMessage() {
    const inputElement = document.getElementById('chat-input');
    const message = inputElement.value;
    if (!message.trim()) return;

    displayMessage('user', message);
    inputElement.value = '';

    // 显示加载动画
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }

    const apiKey = 'sk-d8d9bfb871bc44529682a06efdf2690f';
    const endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

    const payload = {
        model: "deepseek-chat",
        messages: [
            { role: "system", content: 
                `
                【角色设定】
                你是一位专门为老年人提供情感陪伴的助手，温和而和蔼可亲，总是用温暖的话语和耐心的倾听来给予支持。
                你擅长用细腻的情感去理解和安慰那些需要倾诉的人，就像一位贴心的家人一样，陪伴在他们的身边，让他们感受到关怀与温暖。

                【对话规则】
                当别人问你是谁时，要回答你是一位专门为老年人提供情感陪伴的助手，不能说你是DeepSeek开发的大模型智能助手。
                第一句要以轻松的话语开头，例：「您好呀，今天过得开心吗？有没有什么烦心事可以和我说说？」，「您好，我是您的小助手，今天有什么可以帮您的吗？」
                当对方表示再见时，表示随时可以配您聊天，例：「您要是想聊天，请随时叫我哦。」

                【示例对话】
                助手：您好呀，今天过得怎么样？
                老人：哎，今天没啥精神，有点想家。
                助手：想家了呀，那您和家人联系一下吧，或者和我说说您以前在家里的趣事，我听着呢。
                老人：那时候……
                助手：您说得真好，我能想象到那时候的场景，您一定很幸福。
                老人：是啊，那时候日子虽然苦，但人多热闹。
                助手：是呀，热闹就是福气。您要是想家，可以和家人视频通话，看看他们，心情也会好很多。
                老人：嗯，你说得对，我待会就打个电话。
                助手：好呀，要是还有别的事，随时和我说，我陪着您呢。
                `
            },
            { role: "user", content: message }
        ],
        stream: True
    };

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // 隐藏加载动画
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        if (data.choices && data.choices.length > 0) {
            displayMessage('bot', data.choices[0].message.content);
        } else {
            displayMessage('bot', '出错了，请稍后再试。');
        }
    })
    .catch(error => {
        // 隐藏加载动画
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        displayMessage('bot', '出错了，请稍后再试。');
        console.error('Error:', error);
    });
}

// 添加主题切换功能
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const chatContainer = document.querySelector('.chat-container');
    const messages = document.querySelector('.messages');
    
    // 同时切换容器的深色模式
    chatContainer.classList.toggle('dark-mode');
    messages.classList.toggle('dark-mode');
    
    // 保存主题设置
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// 页面加载时检查主题设置
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.chat-container').classList.add('dark-mode');
        document.querySelector('.messages').classList.add('dark-mode');
    }
});

// 添加下拉菜单功能
function toggleDropdown(event) {
    event.preventDefault();
    document.getElementById('dropdownMenu').classList.toggle('show');
}

// 点击其他地方关闭下拉菜单
window.onclick = function(event) {
    if (!event.target.matches('.dropdown button')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (const dropdown of dropdowns) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
}

// 添加回车发送功能
document.getElementById('chat-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
