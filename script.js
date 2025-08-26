// Simple JavaScript for Flowable Demo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Flowable Demo页面已加载');
    
    // 添加简单的交互效果
    const title = document.querySelector('h1');
    
    title.addEventListener('click', function() {
        this.style.color = this.style.color === 'green' ? '#007bff' : 'green';
    });
    
    // 显示当前时间
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN');
        
        // 如果还没有时间显示元素，创建一个
        let timeElement = document.getElementById('current-time');
        if (!timeElement) {
            timeElement = document.createElement('div');
            timeElement.id = 'current-time';
            timeElement.style.textAlign = 'center';
            timeElement.style.marginTop = '20px';
            timeElement.style.color = '#666';
            timeElement.style.fontSize = '0.9rem';
            document.querySelector('.content').appendChild(timeElement);
        }
        
        timeElement.textContent = `当前时间: ${timeString}`;
    }
    
    // 立即更新一次时间，然后每秒更新
    updateTime();
    setInterval(updateTime, 1000);
});