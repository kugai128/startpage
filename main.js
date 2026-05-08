// 时钟功能：每秒更新一次
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { hour12: false });
    document.getElementById('clock').textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock();
